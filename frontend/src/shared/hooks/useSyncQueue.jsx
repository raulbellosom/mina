import { useState, useEffect, useCallback, useRef } from "react";
import {
  addToQueue,
  getQueueEntries,
  countQueue,
  deleteQueueEntry,
  updateQueueEntry,
  clearSynced,
} from "../lib/offlineStorage";
import { databases, DATABASE_ID } from "../lib/appwrite";
import { ID } from "appwrite";
import { useOnlineStatus } from "./useOnlineStatus";

const MAX_RETRIES = 3;
const BACKOFF_BASE = 1000; // 1s, 2s, 4s
const SYNC_TIMEOUT = 15000; // 15s per operation

/**
 * Wrap a promise with a timeout.
 */
function withTimeout(promise, ms = SYNC_TIMEOUT) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SYNC_TIMEOUT")), ms),
    ),
  ]);
}

/**
 * Classify error to decide retry strategy.
 * Returns: 'permanent' | 'retryable'
 */
function classifyError(err) {
  const code = err?.code || err?.status;
  // 4xx (except 429 Too Many Requests) are permanent
  if (code >= 400 && code < 500 && code !== 429 && code !== 409)
    return "permanent";
  // Network errors and timeouts are retryable
  if (err?.message?.includes("SYNC_TIMEOUT")) return "retryable";
  if (err?.message?.includes("Failed to fetch")) return "retryable";
  if (err?.message?.includes("NetworkError")) return "retryable";
  // 5xx and 429 are retryable
  return "retryable";
}

/**
 * Hook para gestionar la cola de sincronización offline.
 *
 * Expone:
 *   pendingCount      — cantidad de operaciones pendientes + error
 *   entries           — lista completa de la cola
 *   loading           — cargando la cola
 *   syncing           — sincronización en curso
 *   syncProgress      — { current, total, lastResult }
 *   enqueue(op)       — agregar operación a la cola
 *   remove(id)        — eliminar una entrada de la cola
 *   refreshQueue()    — recargar la cola
 *   clearCompleted()  — limpiar entradas ya sincronizadas
 *   syncAll()         — sincronizar todas las pendientes
 *   syncOne(id)       — sincronizar una sola operación
 *   isOnline          — estado de conectividad
 *   wasOffline        — flag de que estuvo offline
 *   clearWasOffline   — limpiar el flag wasOffline
 */
export function useSyncQueue() {
  const { isOnline, wasOffline, clearWasOffline } = useOnlineStatus();
  const [entries, setEntries] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({
    current: 0,
    total: 0,
    lastResult: null,
  });
  const syncingRef = useRef(false);

  const refreshQueue = useCallback(async () => {
    try {
      const all = await getQueueEntries();
      setEntries(all);
      const pending = await countQueue("pending");
      const errored = await countQueue("error");
      setPendingCount(pending + errored);
    } catch (err) {
      console.warn("Error loading sync queue:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Process a single queue entry against Appwrite ───────────
  const processEntry = async (entry) => {
    const { collection, action, documentId, data } = entry;

    // Extract special sub-payloads
    const ticketUpdate = data._ticketUpdate;
    const scanLog = data._scanLog;
    const salePayload = data.salePayload;

    // Clean data of internal fields
    const cleanData = { ...data };
    delete cleanData._ticketUpdate;
    delete cleanData._scanLog;
    delete cleanData.salePayload;

    if (action === "create") {
      if (collection === "counter_sales" && salePayload) {
        // Mostrador offline — re-execute full flow
        const sale = await databases.createDocument(
          DATABASE_ID,
          "counter_sales",
          ID.unique(),
          salePayload,
        );
        // Use pre-generated ticketId from offline data if available
        const ticketId = data.ticketId || ID.unique();
        const ticketPayload = {
          ticketNumber: data.ticketNumber || "",
          voucherId: "",
          counterSaleId: sale.$id,
          type: "counter",
          status: "generated",
          materialId: data.materialId,
          plantId: data.plantId,
          commercialQty: data.commercialQty,
          commercialUnit: data.commercialUnit || "viaje",
          qrData: data.qrData || `MF:${ticketId}:SYNC`,
          printCount: 0,
          reprintCount: 0,
          notes: data.notes || "",
          cancelReason: "",
          createdBy: data.createdBy,
          updatedBy: data.createdBy,
        };
        if (data.clientId) ticketPayload.clientId = data.clientId;
        if (data.driverId) ticketPayload.driverId = data.driverId;
        if (data.truckId) ticketPayload.truckId = data.truckId;
        if (!ticketPayload.clientId) ticketPayload.clientId = "";

        await databases.createDocument(
          DATABASE_ID,
          "tickets",
          ticketId,
          ticketPayload,
        );
        await databases.updateDocument(DATABASE_ID, "counter_sales", sale.$id, {
          ticketId,
          status: "ticket_generated",
        });
      } else {
        // Generic create (weight_logs, etc.)
        await databases.createDocument(
          DATABASE_ID,
          collection,
          ID.unique(),
          cleanData,
        );
        // Apply ticket update if present
        if (ticketUpdate && cleanData.ticketId) {
          await databases.updateDocument(
            DATABASE_ID,
            "tickets",
            cleanData.ticketId,
            ticketUpdate,
          );
        }
      }
    } else if (action === "update") {
      if (documentId) {
        await databases.updateDocument(
          DATABASE_ID,
          collection,
          documentId,
          cleanData,
        );
      }
      // Process scan_log sub-payload
      if (scanLog) {
        await databases.createDocument(
          DATABASE_ID,
          "scan_logs",
          ID.unique(),
          scanLog,
        );
      }
    }

    // Log audit for sync
    try {
      await databases.createDocument(DATABASE_ID, "audit_logs", ID.unique(), {
        action: "sync.completed",
        collection,
        docId: documentId || "offline_sync",
        userId: data.createdBy || data.operatorId || data.validatedBy || "",
        details: JSON.stringify({
          queueId: entry.id,
          module: entry.meta?.module,
          description: entry.meta?.description,
        }),
      });
    } catch {
      // audit log failure is non-critical
    }
  };

  // ─── Sync a single entry by ID ──────────────────────────────
  const syncOne = useCallback(
    async (id) => {
      if (!navigator.onLine) return { success: false, error: "Sin conexión" };
      if (syncingRef.current)
        return { success: false, error: "Sincronización en curso" };

      const entry = entries.find((e) => e.id === id);
      if (!entry) return { success: false, error: "Operación no encontrada" };

      await updateQueueEntry(id, { status: "syncing" });
      await refreshQueue();

      try {
        await withTimeout(processEntry(entry));
        await updateQueueEntry(id, {
          status: "synced",
          syncedAt: new Date().toISOString(),
        });
        await refreshQueue();
        return { success: true };
      } catch (err) {
        const isDuplicate = err?.code === 409;
        if (isDuplicate) {
          await updateQueueEntry(id, {
            status: "synced",
            syncedAt: new Date().toISOString(),
          });
          await refreshQueue();
          return { success: true };
        }
        const errorType = classifyError(err);
        const newAttempts = (entry.attempts || 0) + 1;
        const isPermanent = errorType === "permanent";
        await updateQueueEntry(id, {
          status:
            isPermanent || newAttempts >= MAX_RETRIES ? "error" : "pending",
          attempts: newAttempts,
          lastError: err.message || "Error desconocido",
        });
        await refreshQueue();
        return { success: false, error: err.message };
      }
    },
    [entries, refreshQueue],
  );

  // ─── Sync all pending entries ───────────────────────────────
  const syncAll = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setSyncing(true);

    const pending = await getQueueEntries("pending");
    // Also retry errored entries with attempts < MAX_RETRIES
    const errored = (await getQueueEntries("error")).filter(
      (e) => (e.attempts || 0) < MAX_RETRIES,
    );
    const toSync = [...pending, ...errored].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );

    const total = toSync.length;
    let synced = 0;
    let failed = 0;

    setSyncProgress({ current: 0, total, lastResult: null });

    for (let i = 0; i < toSync.length; i++) {
      const entry = toSync[i];
      setSyncProgress({ current: i + 1, total, lastResult: null });

      await updateQueueEntry(entry.id, { status: "syncing" });

      try {
        await withTimeout(processEntry(entry));
        await updateQueueEntry(entry.id, {
          status: "synced",
          syncedAt: new Date().toISOString(),
        });
        synced++;
      } catch (err) {
        const isDuplicate = err?.code === 409;
        if (isDuplicate) {
          await updateQueueEntry(entry.id, {
            status: "synced",
            syncedAt: new Date().toISOString(),
          });
          synced++;
        } else {
          const errorType = classifyError(err);
          const isPermanent = errorType === "permanent";
          const newAttempts = (entry.attempts || 0) + 1;
          await updateQueueEntry(entry.id, {
            status:
              isPermanent || newAttempts >= MAX_RETRIES ? "error" : "pending",
            attempts: newAttempts,
            lastError: err.message || "Error desconocido",
          });
          failed++;

          // Backoff before next attempt
          if (i < toSync.length - 1) {
            const delay = BACKOFF_BASE * Math.pow(2, Math.min(newAttempts, 3));
            await new Promise((r) => setTimeout(r, delay));
          }
        }
      }
    }

    setSyncProgress({
      current: total,
      total,
      lastResult: { synced, failed, total },
    });

    // Clean synced entries after successful sync
    if (synced > 0) {
      await clearSynced();
    }

    await refreshQueue();
    syncingRef.current = false;
    setSyncing(false);

    return { synced, failed, total };
  }, [refreshQueue]);

  // Load on mount and when connectivity changes
  useEffect(() => {
    refreshQueue();
  }, [refreshQueue, isOnline]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && wasOffline && !syncingRef.current) {
      // Small delay to ensure connection is stable
      const timer = setTimeout(() => {
        syncAll();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, syncAll]);

  const enqueue = useCallback(
    async (op) => {
      const entry = await addToQueue(op);
      await refreshQueue();
      return entry;
    },
    [refreshQueue],
  );

  const remove = useCallback(
    async (id) => {
      await deleteQueueEntry(id);
      await refreshQueue();
    },
    [refreshQueue],
  );

  const clearCompleted = useCallback(async () => {
    await clearSynced();
    await refreshQueue();
  }, [refreshQueue]);

  return {
    entries,
    pendingCount,
    loading,
    syncing,
    syncProgress,
    enqueue,
    remove,
    refreshQueue,
    clearCompleted,
    syncAll,
    syncOne,
    isOnline,
    wasOffline,
    clearWasOffline,
  };
}
