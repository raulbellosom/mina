import { useState, useCallback } from "react";
import { databases, DATABASE_ID, APP_IDS } from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";
import { addToQueue } from "../../../shared/lib/offlineStorage";

const TICKETS = APP_IDS.collections.TICKETS;
const WEIGHT_LOGS = APP_IDS.collections.WEIGHT_LOGS;
const AUDIT = APP_IDS.collections.AUDIT_LOGS;
const TRUCKS = APP_IDS.collections.TRUCKS;
const VOUCHERS = APP_IDS.collections.VOUCHERS;

function isNetworkError(err) {
  return (
    !navigator.onLine ||
    err?.code === 0 ||
    err?.message?.includes("Failed to fetch") ||
    err?.message?.includes("NetworkError") ||
    err?.message?.includes("Network request failed")
  );
}

// States that can receive weight operations
const ENTRY_ALLOWED_STATES = [
  "generated",
  "issued",
  "ready_to_print",
  "printed",
];
const EXIT_ALLOWED_STATES = ["loading"];

/**
 * Hook para el módulo de báscula.
 *
 * Flujo principal:
 *   1. searchTicket(query) → encuentra ticket activo
 *   2. registerEntryWeight(ticketId, weight, unit, notes) → status: loading
 *   3. registerExitWeight(ticketId, weight, unit, notes) → status: pending_exit_validation
 *   4. fetchWeightLogs(ticketId) → historial de pesos de un ticket
 *   5. fetchOperations() → listado de operaciones activas e históricas
 *
 * Exports:
 *   operations, loading, searchResult, searchLoading,
 *   filterStatus, setFilterStatus,
 *   searchTicket, registerEntryWeight, registerExitWeight,
 *   fetchWeightLogs, fetchOperations
 */
export function useBascula() {
  const { user } = useAuth();

  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [filterStatus, setFilterStatus] = useState("active");

  // ─── Auditoría ─────────────────────────────────────────────────
  const logAudit = async (action, docId, details = {}) => {
    if (!user) return;
    try {
      await databases.createDocument(DATABASE_ID, AUDIT, ID.unique(), {
        action,
        collection: TICKETS,
        docId,
        userId: user.$id,
        details: JSON.stringify(details),
      });
    } catch (err) {
      console.warn("Audit log failed:", err.message);
    }
  };

  // ─── Operaciones ───────────────────────────────────────────────
  const fetchOperations = useCallback(async () => {
    setLoading(true);
    try {
      let statusFilter;
      if (filterStatus === "active") {
        // issued/printed/loading/loaded
        statusFilter = [
          Query.or([
            Query.equal("status", "issued"),
            Query.equal("status", "printed"),
            Query.equal("status", "loading"),
            Query.equal("status", "loaded"),
          ]),
        ];
      } else if (filterStatus === "pending") {
        statusFilter = [Query.equal("status", "pending_exit_validation")];
      } else if (filterStatus === "all") {
        statusFilter = [];
      } else {
        statusFilter = [Query.equal("status", filterStatus)];
      }

      const res = await databases.listDocuments(DATABASE_ID, TICKETS, [
        Query.orderDesc("$createdAt"),
        Query.limit(100),
        ...statusFilter,
      ]);
      setOperations(res.documents);
    } catch (err) {
      console.error("Error cargando operaciones de báscula:", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  // ─── Búsqueda de ticket ────────────────────────────────────────
  /**
   * Busca un ticket activo por:
   *   - ticketNumber exacto (ej: T-260101-ABCD o CT-260101-ABCD)
   *   - placas del camión (busca truck primero, luego ticket por truckId)
   *
   * Retorna el ticket encontrado o null. Sube error si no se encuentra.
   */
  const searchTicket = async (query) => {
    if (!query || !query.trim()) return;
    const q = query.trim();
    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      // 1. Intentar por ticketNumber exacto
      const byNumber = await databases.listDocuments(DATABASE_ID, TICKETS, [
        Query.equal("ticketNumber", q),
        Query.limit(1),
      ]);
      if (byNumber.documents.length > 0) {
        setSearchResult(byNumber.documents[0]);
        return byNumber.documents[0];
      }

      // 2. Intentar por placas del camión
      const truckRes = await databases.listDocuments(DATABASE_ID, TRUCKS, [
        Query.equal("plates", q.toUpperCase()),
        Query.limit(5),
      ]);
      if (truckRes.documents.length > 0) {
        const truckIds = truckRes.documents.map((t) => t.$id);
        // Buscar ticket activo de alguno de esos camiones
        for (const truckId of truckIds) {
          const byTruck = await databases.listDocuments(DATABASE_ID, TICKETS, [
            Query.equal("truckId", truckId),
            Query.or([
              Query.equal("status", "issued"),
              Query.equal("status", "printed"),
              Query.equal("status", "loading"),
              Query.equal("status", "loaded"),
            ]),
            Query.orderDesc("$createdAt"),
            Query.limit(1),
          ]);
          if (byTruck.documents.length > 0) {
            setSearchResult(byTruck.documents[0]);
            return byTruck.documents[0];
          }
        }
      }

      // 3. Búsqueda parcial por ticketNumber (contiene el texto)
      const partial = await databases.listDocuments(DATABASE_ID, TICKETS, [
        Query.search("ticketNumber", q),
        Query.limit(5),
      ]);
      if (partial.documents.length > 0) {
        setSearchResult(partial.documents[0]);
        return partial.documents[0];
      }

      setSearchError(
        "No se encontró ningún ticket activo con ese folio o placas",
      );
      return null;
    } catch (err) {
      console.error("Error buscando ticket:", err);
      setSearchError("Error al buscar el ticket");
      return null;
    } finally {
      setSearchLoading(false);
    }
  };

  /**
   * Registra el peso de ENTRADA (camión vacío / tara del camión).
   * - Crea weight_log con type: 'entry'
   * - Actualiza ticket.weightIn y transiciona a status: 'loading'
   */
  const registerEntryWeight = async (
    ticketId,
    weight,
    unit = "ton",
    notes = "",
  ) => {
    if (!user) throw new Error("No autenticado");

    const w = parseFloat(weight);
    if (!w || w <= 0) throw new Error("El peso debe ser mayor a 0");

    try {
      const ticket = await databases.getDocument(
        DATABASE_ID,
        TICKETS,
        ticketId,
      );

      if (!ENTRY_ALLOWED_STATES.includes(ticket.status)) {
        throw new Error(
          `El ticket en estado '${ticket.status}' no puede recibir peso de entrada`,
        );
      }

      // Crear weight_log de entrada
      await databases.createDocument(DATABASE_ID, WEIGHT_LOGS, ID.unique(), {
        ticketId,
        type: "entry",
        weight: w,
        unit,
        operatorId: user.$id,
        operatorName: user.name || "",
        notes: notes || "",
        createdBy: user.$id,
      });

      // Actualizar ticket
      await databases.updateDocument(DATABASE_ID, TICKETS, ticketId, {
        weightIn: w,
        weightUnit: unit,
        scaleOperatorId: user.$id,
        scaleNotes: notes || ticket.scaleNotes || "",
        status: "loading",
        updatedBy: user.$id,
      });

      await logAudit("bascula.entry_weight", ticketId, {
        weight: w,
        unit,
        previousStatus: ticket.status,
      });

      await fetchOperations();
      return { weight: w, unit, offline: false };
    } catch (err) {
      if (isNetworkError(err)) {
        await addToQueue({
          collection: WEIGHT_LOGS,
          action: "create",
          data: {
            ticketId,
            type: "entry",
            weight: w,
            unit,
            operatorId: user.$id,
            operatorName: user.name || "",
            notes: notes || "",
            createdBy: user.$id,
            _ticketUpdate: {
              weightIn: w,
              weightUnit: unit,
              scaleOperatorId: user.$id,
              scaleNotes: notes || "",
              status: "loading",
              updatedBy: user.$id,
            },
          },
          meta: {
            module: "bascula",
            description: `Peso entrada: ${w} ${unit}`,
            ticketNumber: ticketId,
          },
        });
        return { weight: w, unit, offline: true };
      }
      throw err;
    }
  };

  /**
   * Registra el peso de SALIDA (camión cargado).
   * - Crea weight_log con type: 'exit'
   * - Calcula: tara = exitWeight - entryWeight, netWeight = tara (neto del material)
   * - Actualiza ticket con todos los pesos
   * - Transiciona a: loaded → pending_exit_validation
   */
  const registerExitWeight = async (
    ticketId,
    weight,
    unit = "ton",
    notes = "",
  ) => {
    if (!user) throw new Error("No autenticado");

    const exitW = parseFloat(weight);
    if (!exitW || exitW <= 0) throw new Error("El peso debe ser mayor a 0");

    try {
      const ticket = await databases.getDocument(
        DATABASE_ID,
        TICKETS,
        ticketId,
      );

      if (!EXIT_ALLOWED_STATES.includes(ticket.status)) {
        throw new Error(
          `El ticket en estado '${ticket.status}' no puede recibir peso de salida. Primero registra el peso de entrada.`,
        );
      }

      const entryW = parseFloat(ticket.weightIn) || 0;
      const tara = parseFloat((exitW - entryW).toFixed(4));
      const netWeight = tara;

      await databases.createDocument(DATABASE_ID, WEIGHT_LOGS, ID.unique(), {
        ticketId,
        type: "exit",
        weight: exitW,
        unit,
        operatorId: user.$id,
        operatorName: user.name || "",
        notes: notes || "",
        createdBy: user.$id,
      });

      await databases.updateDocument(DATABASE_ID, TICKETS, ticketId, {
        weightOut: exitW,
        tara,
        netWeight,
        weightUnit: unit,
        scaleNotes: notes || ticket.scaleNotes || "",
        status: "pending_exit_validation",
        updatedBy: user.$id,
      });

      await logAudit("bascula.exit_weight", ticketId, {
        entryWeight: entryW,
        exitWeight: exitW,
        tara,
        netWeight,
        unit,
      });

      await fetchOperations();
      return {
        entryWeight: entryW,
        exitWeight: exitW,
        tara,
        netWeight,
        unit,
        offline: false,
      };
    } catch (err) {
      if (isNetworkError(err)) {
        await addToQueue({
          collection: WEIGHT_LOGS,
          action: "create",
          data: {
            ticketId,
            type: "exit",
            weight: exitW,
            unit,
            operatorId: user.$id,
            operatorName: user.name || "",
            notes: notes || "",
            createdBy: user.$id,
            _ticketUpdate: {
              weightOut: exitW,
              weightUnit: unit,
              scaleNotes: notes || "",
              status: "pending_exit_validation",
              updatedBy: user.$id,
            },
          },
          meta: {
            module: "bascula",
            description: `Peso salida: ${exitW} ${unit}`,
            ticketNumber: ticketId,
          },
        });
        return { exitWeight: exitW, unit, offline: true };
      }
      throw err;
    }
  };

  /**
   * Carga el historial de pesos de un ticket específico.
   */
  const fetchWeightLogs = async (ticketId) => {
    try {
      const res = await databases.listDocuments(DATABASE_ID, WEIGHT_LOGS, [
        Query.equal("ticketId", ticketId),
        Query.orderAsc("$createdAt"),
      ]);
      return res.documents;
    } catch (err) {
      console.error("Error cargando historial de pesos:", err);
      return [];
    }
  };

  /**
   * Recarga el ticket seleccionado por ID (para refrescar después de cambios).
   */
  const refreshTicket = async (ticketId) => {
    try {
      const ticket = await databases.getDocument(
        DATABASE_ID,
        TICKETS,
        ticketId,
      );
      setSearchResult(ticket);
      return ticket;
    } catch (err) {
      console.error("Error recargando ticket:", err);
      return null;
    }
  };

  const clearSearch = () => {
    setSearchResult(null);
    setSearchError(null);
  };

  return {
    operations,
    loading,
    filterStatus,
    setFilterStatus,
    fetchOperations,
    searchResult,
    searchLoading,
    searchError,
    searchTicket,
    clearSearch,
    registerEntryWeight,
    registerExitWeight,
    fetchWeightLogs,
    refreshTicket,
  };
}
