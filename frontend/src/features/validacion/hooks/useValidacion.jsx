import { useState, useCallback } from "react";
import { databases, DATABASE_ID } from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";
import { addToQueue } from "../../../shared/lib/offlineStorage";
import { verifyQrToken } from "../../tickets/hooks/useTickets";

const TICKETS = "tickets";
const SCAN_LOGS = "scan_logs";
const AUDIT = "audit_logs";

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
 * Hook para el módulo de validación de salida.
 *
 * Flujo principal:
 *   1. lookupTicket(query, method) → recupera ticket por folio/QR y evalúa validez
 *   2. approveExit(ticketId) → approved, ticket → completed
 *   3. rejectExit(ticketId, reason) → rejected, ticket → rejected
 *   4. fetchHistory() → historial de scan_logs
 *
 * Exports:
 *   history, historyLoading, filterResult, setFilterResult,
 *   fetchHistory, lookupTicket, approveExit, rejectExit
 */
export function useValidacion() {
  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [filterResult, setFilterResult] = useState("all");

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

  const logScan = async (
    ticketId,
    result,
    reason,
    method,
    ticketNumber = "",
  ) => {
    if (!user) return;
    await databases.createDocument(DATABASE_ID, SCAN_LOGS, ID.unique(), {
      ticketId,
      validatorId: user.$id,
      result,
      reason: reason || "",
      method,
      ticketNumber,
      createdBy: user.$id,
    });
  };

  // ─── Historial ─────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const queries = [Query.orderDesc("$createdAt"), Query.limit(100)];
      if (filterResult !== "all")
        queries.push(Query.equal("result", filterResult));

      const res = await databases.listDocuments(
        DATABASE_ID,
        SCAN_LOGS,
        queries,
      );
      setHistory(res.documents);
    } catch (err) {
      console.error("Error cargando historial de validaciones:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [filterResult]);

  // ─── Lookup ticket ─────────────────────────────────────────────
  /**
   * Recupera un ticket por su número de folio o código QR (formato MF:ticketId:token)
   * y evalúa si es válido para salida.
   *
   * @param {string} query  — folio de ticket o payload QR "MF:id:token"
   * @param {string} method — 'qr_scan' | 'manual_entry'
   * @returns {{ ticket, valid, blocked, reason }}
   */
  const lookupTicket = async (query, method = "manual_entry") => {
    if (!user) throw new Error("No autenticado");
    if (!query || !query.trim())
      throw new Error("Ingresa un folio o escanea un QR");

    const q = query.trim();

    let ticket = null;
    let qrTokenValid = true;

    // QR format: MF:{ticketId}:{hmacToken}
    if (q.startsWith("MF:")) {
      const parts = q.split(":");
      if (parts.length >= 3) {
        const ticketId = parts[1];
        const token = parts[2];
        try {
          ticket = await databases.getDocument(DATABASE_ID, TICKETS, ticketId);
          method = "qr_scan";
          // Verify HMAC token
          qrTokenValid = await verifyQrToken(
            ticketId,
            ticket.ticketNumber,
            token,
          );
        } catch {
          // ticketId not found — fall through
        }
      } else if (parts.length === 2) {
        const ticketId = parts[1];
        try {
          ticket = await databases.getDocument(DATABASE_ID, TICKETS, ticketId);
          method = "qr_scan";
          qrTokenValid = false; // Missing token
        } catch {
          // ticketId not found — fall through
        }
      }
    }

    // Search by ticketNumber if not found yet
    if (!ticket) {
      const res = await databases.listDocuments(DATABASE_ID, TICKETS, [
        Query.equal("ticketNumber", q),
        Query.limit(1),
      ]);
      if (res.documents.length > 0) ticket = res.documents[0];
    }

    if (!ticket) {
      return {
        ticket: null,
        valid: false,
        blocked: false,
        reason: "Ticket no encontrado con ese folio o QR",
      };
    }

    // Verify HMAC integrity for QR scans
    if (method === "qr_scan" && !qrTokenValid) {
      return {
        ticket,
        valid: false,
        blocked: true,
        reason:
          "El código QR no pasó la verificación de integridad. Posible QR falsificado.",
      };
    }

    // Evaluate validity
    const validStates = ["pending_exit_validation"];
    const invalidStates = ["completed", "cancelled", "rejected", "blocked"];

    if (invalidStates.includes(ticket.status)) {
      const reasons = {
        completed: "Este ticket ya fue utilizado para una salida anterior",
        cancelled: "Este ticket está cancelado",
        rejected: "Este ticket fue rechazado previamente",
        blocked: "Este ticket está bloqueado",
      };
      return {
        ticket,
        valid: false,
        blocked: ticket.status === "blocked",
        reason: reasons[ticket.status] || `Estado no válido: ${ticket.status}`,
      };
    }

    if (!validStates.includes(ticket.status)) {
      return {
        ticket,
        valid: false,
        blocked: false,
        reason: `El ticket aún no completó el proceso de báscula (estado: ${ticket.status}). Debe estar en 'pending_exit_validation'.`,
      };
    }

    return { ticket, valid: true, blocked: false, reason: null, method };
  };

  // ─── Aprobar salida ────────────────────────────────────────────
  const approveExit = async (ticket, method = "manual_entry") => {
    if (!user) throw new Error("No autenticado");

    if (ticket.status !== "pending_exit_validation") {
      throw new Error(
        "Solo se pueden aprobar tickets en estado pending_exit_validation",
      );
    }

    const now = new Date().toISOString();

    try {
      await databases.updateDocument(DATABASE_ID, TICKETS, ticket.$id, {
        status: "completed",
        validatedAt: now,
        validatedBy: user.$id,
        updatedBy: user.$id,
      });

      await logScan(ticket.$id, "approved", "", method, ticket.ticketNumber);
      await logAudit("exit.approved", ticket.$id, {
        ticketNumber: ticket.ticketNumber,
        method,
        validatedAt: now,
      });

      await fetchHistory();
      return { offline: false };
    } catch (err) {
      if (isNetworkError(err)) {
        await addToQueue({
          collection: TICKETS,
          action: "update",
          documentId: ticket.$id,
          data: {
            status: "completed",
            validatedAt: now,
            validatedBy: user.$id,
            updatedBy: user.$id,
            _scanLog: {
              ticketId: ticket.$id,
              validatorId: user.$id,
              result: "approved",
              reason: "",
              method,
              ticketNumber: ticket.ticketNumber,
              createdBy: user.$id,
            },
          },
          meta: {
            module: "validacion",
            description: `Salida aprobada: ${ticket.ticketNumber}`,
            ticketNumber: ticket.ticketNumber,
          },
        });
        return { offline: true };
      }
      throw err;
    }
  };

  // ─── Rechazar salida ───────────────────────────────────────────
  const rejectExit = async (ticket, reason, method = "manual_entry") => {
    if (!user) throw new Error("No autenticado");
    if (!reason || !reason.trim())
      throw new Error("El motivo de rechazo es obligatorio");

    try {
      await databases.updateDocument(DATABASE_ID, TICKETS, ticket.$id, {
        status: "rejected",
        cancelReason: reason.trim(),
        validatedBy: user.$id,
        updatedBy: user.$id,
      });

      await logScan(
        ticket.$id,
        "rejected",
        reason.trim(),
        method,
        ticket.ticketNumber,
      );
      await logAudit("exit.rejected", ticket.$id, {
        ticketNumber: ticket.ticketNumber,
        reason: reason.trim(),
        method,
      });

      await fetchHistory();
      return { offline: false };
    } catch (err) {
      if (isNetworkError(err)) {
        await addToQueue({
          collection: TICKETS,
          action: "update",
          documentId: ticket.$id,
          data: {
            status: "rejected",
            cancelReason: reason.trim(),
            validatedBy: user.$id,
            updatedBy: user.$id,
            _scanLog: {
              ticketId: ticket.$id,
              validatorId: user.$id,
              result: "rejected",
              reason: reason.trim(),
              method,
              ticketNumber: ticket.ticketNumber,
              createdBy: user.$id,
            },
          },
          meta: {
            module: "validacion",
            description: `Salida rechazada: ${ticket.ticketNumber}`,
            ticketNumber: ticket.ticketNumber,
          },
        });
        return { offline: true };
      }
      throw err;
    }
  };

  return {
    history,
    historyLoading,
    filterResult,
    setFilterResult,
    fetchHistory,
    lookupTicket,
    approveExit,
    rejectExit,
  };
}
