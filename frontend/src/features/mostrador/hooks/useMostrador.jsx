import { useState, useEffect, useCallback } from "react";
import { databases, DATABASE_ID, APP_IDS } from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";
import { addToQueue } from "../../../shared/lib/offlineStorage";
import { fetchWithCache } from "../../../shared/lib/catalogCache";

const COUNTER_SALES = APP_IDS.collections.COUNTER_SALES;
const TICKETS = APP_IDS.collections.TICKETS;
const AUDIT = APP_IDS.collections.AUDIT_LOGS;

function isNetworkError(err) {
  return (
    !navigator.onLine ||
    err?.code === 0 ||
    err?.message?.includes("Failed to fetch") ||
    err?.message?.includes("NetworkError") ||
    err?.message?.includes("Network request failed")
  );
}

/**
 * Genera un número interno para venta mostrador: CS-YYMMDD-XXXX
 */
function generateSaleNumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(-4).toUpperCase();
  return `CS-${yy}${mm}${dd}-${rand}`;
}

/**
 * Genera el número de ticket para venta mostrador: CT-YYMMDD-XXXX
 */
function generateTicketNumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(-4).toUpperCase();
  return `CT-${yy}${mm}${dd}-${rand}`;
}

/**
 * QR secret for HMAC — from env or fallback
 */
const QR_SECRET = import.meta.env.VITE_QR_SECRET || "MF_DEFAULT_QR_KEY_2024";

/**
 * Genera el payload del QR para un ticket de mostrador con HMAC-SHA256.
 * Formato: MF:{ticketId}:{hmacToken}
 */
async function generateQrPayload(ticketId, ticketNumber) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(QR_SECRET);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const message = encoder.encode(`${ticketId}|${ticketNumber}`);
  const signature = await crypto.subtle.sign("HMAC", key, message);
  const hashArray = Array.from(new Uint8Array(signature));
  const token = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16)
    .toUpperCase();
  return `MF:${ticketId}:${token}`;
}

/**
 * Hook para el módulo de ventas en mostrador.
 *
 * Flujo:
 *   1. create(data) → crea counter_sale (status: confirmed) + genera ticket (type: counter)
 *   2. cancel(id, reason) → estado cancelled en counter_sale, cancelled en ticket vinculado
 *   3. fetchItems() → lista ventas mostrador con filtros
 *
 * Exports:
 *   items, loading, search, setSearch, filterStatus, setFilterStatus,
 *   clients, drivers, trucks, materials, plants, loadingCatalogs,
 *   create, cancel, fetchItems
 */
export function useMostrador() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // ─── Auditoría ─────────────────────────────────────────────────
  const logAudit = async (action, docId, details = {}) => {
    if (!user) return;
    try {
      await databases.createDocument(DATABASE_ID, AUDIT, ID.unique(), {
        action,
        collection: COUNTER_SALES,
        docId,
        userId: user.$id,
        details: JSON.stringify(details),
      });
    } catch (err) {
      console.warn("Audit log failed:", err.message);
    }
  };

  // ─── Catálogos (con caché offline) ──────────────────────────────
  const fetchCatalogs = useCallback(async () => {
    setLoadingCatalogs(true);
    try {
      const [c, d, tr, m, p] = await Promise.all([
        fetchWithCache("clients_active", () =>
          databases.listDocuments(DATABASE_ID, APP_IDS.collections.CLIENTS, [
            Query.equal("active", true),
            Query.orderAsc("name"),
            Query.limit(500),
          ]),
        ),
        fetchWithCache("drivers_active", () =>
          databases.listDocuments(DATABASE_ID, APP_IDS.collections.DRIVERS, [
            Query.equal("active", true),
            Query.orderAsc("fullName"),
            Query.limit(500),
          ]),
        ),
        fetchWithCache("trucks_active", () =>
          databases.listDocuments(DATABASE_ID, APP_IDS.collections.TRUCKS, [
            Query.equal("active", true),
            Query.orderAsc("plateNumber"),
            Query.limit(500),
          ]),
        ),
        fetchWithCache("materials_active", () =>
          databases.listDocuments(DATABASE_ID, APP_IDS.collections.MATERIALS, [
            Query.equal("active", true),
            Query.orderAsc("name"),
            Query.limit(500),
          ]),
        ),
        fetchWithCache("plants_active", () =>
          databases.listDocuments(DATABASE_ID, APP_IDS.collections.PLANTS, [
            Query.equal("active", true),
            Query.orderAsc("name"),
            Query.limit(500),
          ]),
        ),
      ]);
      setClients(c.documents);
      setDrivers(d.documents);
      setTrucks(tr.documents);
      setMaterials(m.documents);
      setPlants(p.documents);
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    } finally {
      setLoadingCatalogs(false);
    }
  }, []);

  // ─── Ventas ────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const queries = [Query.orderDesc("$createdAt"), Query.limit(200)];
      if (filterStatus !== "all")
        queries.push(Query.equal("status", filterStatus));

      const res = await databases.listDocuments(
        DATABASE_ID,
        COUNTER_SALES,
        queries,
      );

      let docs = res.documents;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        docs = docs.filter(
          (s) =>
            (s.internalNumber || "").toLowerCase().includes(q) ||
            (s.clientName || "").toLowerCase().includes(q),
        );
      }
      setItems(docs);
    } catch (err) {
      console.error("Error cargando ventas:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  /**
   * Crea una venta en mostrador y genera su ticket operativo.
   *
   * Pasos:
   *   1. Crear counter_sale (status: confirmed)
   *   2. Crear ticket (type: counter, status: generated)
   *   3. Vincular ticketId en counter_sale
   *   4. Auditoría
   */
  const create = async (data) => {
    if (!user) throw new Error("No autenticado");

    const internalNumber = generateSaleNumber();
    const ticketId = ID.unique();
    const ticketNumber = generateTicketNumber();
    const qrData = await generateQrPayload(ticketId, ticketNumber);

    // 1. Crear counter_sale
    const salePayload = {
      internalNumber,
      materialId: data.materialId,
      plantId: data.plantId,
      commercialQty: parseFloat(data.commercialQty),
      commercialUnit: data.commercialUnit || "viaje",
      paymentMethod: data.paymentMethod,
      paymentReference: data.paymentReference || "",
      status: "confirmed",
      ticketId: "", // se actualiza después
      notes: data.notes || "",
      cancelReason: "",
      createdBy: user.$id,
      updatedBy: user.$id,
    };

    if (data.clientId) salePayload.clientId = data.clientId;
    if (data.clientName) salePayload.clientName = data.clientName;
    if (data.driverId) salePayload.driverId = data.driverId;
    if (data.truckId) salePayload.truckId = data.truckId;

    try {
      const sale = await databases.createDocument(
        DATABASE_ID,
        COUNTER_SALES,
        ID.unique(),
        salePayload,
      );

      // 2. Crear ticket operativo type: counter
      const ticketPayload = {
        ticketNumber,
        voucherId: "",
        counterSaleId: sale.$id,
        type: "counter",
        status: "generated",
        materialId: data.materialId,
        plantId: data.plantId,
        commercialQty: parseFloat(data.commercialQty),
        commercialUnit: data.commercialUnit || "viaje",
        qrData,
        printCount: 0,
        reprintCount: 0,
        notes: data.notes || "",
        cancelReason: "",
        createdBy: user.$id,
        updatedBy: user.$id,
      };
      if (data.clientId) ticketPayload.clientId = data.clientId;
      if (data.driverId) ticketPayload.driverId = data.driverId;
      if (data.truckId) ticketPayload.truckId = data.truckId;

      // clientId is required on ticket — if no registered client, use empty
      if (!ticketPayload.clientId) ticketPayload.clientId = "";

      await databases.createDocument(
        DATABASE_ID,
        TICKETS,
        ticketId,
        ticketPayload,
      );

      // 3. Vincular ticketId en la venta
      await databases.updateDocument(DATABASE_ID, COUNTER_SALES, sale.$id, {
        ticketId,
        status: "ticket_generated",
      });

      // 4. Auditoría
      await logAudit("counter_sale.create", sale.$id, {
        internalNumber,
        materialId: data.materialId,
        paymentMethod: data.paymentMethod,
        ticketId,
        ticketNumber,
      });

      await fetchItems();
      return {
        sale: { ...sale, ticketId, status: "ticket_generated" },
        ticketId,
        ticketNumber,
        offline: false,
      };
    } catch (err) {
      if (isNetworkError(err)) {
        await addToQueue({
          collection: COUNTER_SALES,
          action: "create",
          data: {
            salePayload,
            ticketNumber,
            ticketId,
            qrData,
            materialId: data.materialId,
            plantId: data.plantId,
            commercialQty: parseFloat(data.commercialQty),
            commercialUnit: data.commercialUnit || "viaje",
            clientId: data.clientId || "",
            driverId: data.driverId || "",
            truckId: data.truckId || "",
            notes: data.notes || "",
            createdBy: user.$id,
          },
          meta: {
            module: "mostrador",
            description: `Venta mostrador: ${internalNumber}`,
            ticketNumber,
          },
        });
        return { ticketId, ticketNumber, offline: true };
      }
      throw err;
    }
  };

  /**
   * Cancela una venta mostrador y su ticket vinculado.
   */
  const cancel = async (id, reason = "") => {
    if (!user) throw new Error("No autenticado");

    const sale = await databases.getDocument(DATABASE_ID, COUNTER_SALES, id);

    if (["cancelled", "blocked"].includes(sale.status)) {
      throw new Error("Esta venta ya está cancelada o bloqueada");
    }

    // Cancelar counter_sale
    await databases.updateDocument(DATABASE_ID, COUNTER_SALES, id, {
      status: "cancelled",
      cancelReason: reason,
      updatedBy: user.$id,
    });

    // Cancelar ticket vinculado si existe y está en estado cancelable
    if (sale.ticketId) {
      try {
        const ticket = await databases.getDocument(
          DATABASE_ID,
          TICKETS,
          sale.ticketId,
        );
        const cancellableStates = ["generated", "ready_to_print", "printed"];
        if (cancellableStates.includes(ticket.status)) {
          await databases.updateDocument(DATABASE_ID, TICKETS, sale.ticketId, {
            status: "cancelled",
            cancelReason: `Venta mostrador cancelada. ${reason}`.trim(),
            updatedBy: user.$id,
          });
        }
      } catch (e) {
        console.warn("No se pudo cancelar el ticket vinculado:", e.message);
      }
    }

    await logAudit("counter_sale.cancel", id, {
      reason,
      ticketId: sale.ticketId,
    });
    await fetchItems();
  };

  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    clients,
    drivers,
    trucks,
    materials,
    plants,
    loadingCatalogs,
    fetchItems,
    create,
    cancel,
  };
}
