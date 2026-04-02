import { useState, useCallback } from "react";
import { databases, DATABASE_ID } from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";

const TICKETS_COLLECTION = "tickets";
const PRINT_LOGS_COLLECTION = "print_logs";
const AUDIT_COLLECTION = "audit_logs";

/** Default number of copies per print operation */
export const DEFAULT_COPIES = 3;

/**
 * Hook for controlled print and reprint operations on tickets.
 * Tracks print events in print_logs and updates ticket metadata.
 */
export function usePrintTicket() {
  const { user, profile } = useAuth();
  const [printing, setPrinting] = useState(false);
  const [printHistory, setPrintHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  /* ─── Audit helper ─── */
  const logAudit = async (action, docId, details = {}) => {
    if (!user) return;
    try {
      await databases.createDocument(
        DATABASE_ID,
        AUDIT_COLLECTION,
        ID.unique(),
        {
          action,
          collection: TICKETS_COLLECTION,
          docId,
          userId: user.$id,
          details: JSON.stringify(details),
        },
      );
    } catch (err) {
      console.warn("Audit log failed:", err.message);
    }
  };

  /**
   * Register initial print event.
   * - Creates print_log with printType = "initial_print"
   * - Updates ticket: status → printed, printCount++, firstPrintedAt, lastPrintedAt, lastPrintedBy
   * - Logs audit
   * - Opens browser print dialog
   */
  const printTicket = async (ticket, { copies = DEFAULT_COPIES } = {}) => {
    if (!user) throw new Error("No autenticado");
    if (!ticket?.$id) throw new Error("Ticket inválido");

    const unprintable = ["cancelled", "blocked"];
    if (unprintable.includes(ticket.status)) {
      throw new Error(
        `No se puede imprimir un ticket en estado "${ticket.status}"`,
      );
    }

    setPrinting(true);
    try {
      const now = new Date().toISOString();
      const isFirstPrint = !ticket.firstPrintedAt && ticket.printCount === 0;
      const printType = isFirstPrint ? "initial_print" : "reprint";

      // Create print log entry
      await databases.createDocument(
        DATABASE_ID,
        PRINT_LOGS_COLLECTION,
        ID.unique(),
        {
          ticketId: ticket.$id,
          ticketNumber: ticket.ticketNumber,
          printType,
          copiesCount: copies,
          reason: "",
          printedBy: user.$id,
          printedByName: profile?.name || user.name || user.email,
          metadata: JSON.stringify({
            previousPrintCount: ticket.printCount || 0,
            previousStatus: ticket.status,
          }),
        },
      );

      // Update ticket with print metadata
      const updatePayload = {
        printCount: (ticket.printCount || 0) + 1,
        lastPrintedAt: now,
        lastPrintedBy: user.$id,
        updatedBy: user.$id,
      };

      if (isFirstPrint) {
        updatePayload.firstPrintedAt = now;
      }

      // Transition status to printed if currently ready_to_print or generated
      if (["generated", "ready_to_print"].includes(ticket.status)) {
        updatePayload.status = "printed";
      }

      await databases.updateDocument(
        DATABASE_ID,
        TICKETS_COLLECTION,
        ticket.$id,
        updatePayload,
      );

      await logAudit("ticket.print", ticket.$id, {
        printType,
        copies,
        ticketNumber: ticket.ticketNumber,
      });

      return { printType, copies, printedAt: now };
    } finally {
      setPrinting(false);
    }
  };

  /**
   * Register reprint event with required reason.
   * - Creates print_log with printType = "reprint"
   * - Updates ticket: reprintCount++, printCount++, lastPrintedAt, lastPrintedBy
   * - Logs audit with reason
   */
  const reprintTicket = async (
    ticket,
    reason,
    { copies = DEFAULT_COPIES } = {},
  ) => {
    if (!user) throw new Error("No autenticado");
    if (!ticket?.$id) throw new Error("Ticket inválido");
    if (!reason?.trim())
      throw new Error("El motivo de reimpresión es obligatorio");

    const unprintable = ["cancelled", "blocked"];
    if (unprintable.includes(ticket.status)) {
      throw new Error(
        `No se puede reimprimir un ticket en estado "${ticket.status}"`,
      );
    }

    setPrinting(true);
    try {
      const now = new Date().toISOString();

      // Create print log entry for reprint
      await databases.createDocument(
        DATABASE_ID,
        PRINT_LOGS_COLLECTION,
        ID.unique(),
        {
          ticketId: ticket.$id,
          ticketNumber: ticket.ticketNumber,
          printType: "reprint",
          copiesCount: copies,
          reason: reason.trim(),
          printedBy: user.$id,
          printedByName: profile?.name || user.name || user.email,
          metadata: JSON.stringify({
            previousPrintCount: ticket.printCount || 0,
            previousReprintCount: ticket.reprintCount || 0,
            previousStatus: ticket.status,
          }),
        },
      );

      // Update ticket
      await databases.updateDocument(
        DATABASE_ID,
        TICKETS_COLLECTION,
        ticket.$id,
        {
          printCount: (ticket.printCount || 0) + 1,
          reprintCount: (ticket.reprintCount || 0) + 1,
          lastPrintedAt: now,
          lastPrintedBy: user.$id,
          updatedBy: user.$id,
        },
      );

      await logAudit("ticket.reprint", ticket.$id, {
        reason: reason.trim(),
        copies,
        ticketNumber: ticket.ticketNumber,
        reprintNumber: (ticket.reprintCount || 0) + 1,
      });

      return {
        printType: "reprint",
        copies,
        printedAt: now,
        reason: reason.trim(),
      };
    } finally {
      setPrinting(false);
    }
  };

  /**
   * Fetch print history for a given ticket.
   */
  const fetchPrintHistory = useCallback(async (ticketId) => {
    if (!ticketId) return;
    setLoadingHistory(true);
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        PRINT_LOGS_COLLECTION,
        [
          Query.equal("ticketId", ticketId),
          Query.orderDesc("$createdAt"),
          Query.limit(50),
        ],
      );
      setPrintHistory(res.documents);
    } catch (err) {
      console.error("Error cargando historial de impresión:", err);
      setPrintHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  return {
    printing,
    printHistory,
    loadingHistory,
    printTicket,
    reprintTicket,
    fetchPrintHistory,
  };
}
