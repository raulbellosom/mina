import { useState, useEffect, useCallback } from "react";
import { databases, DATABASE_ID, APP_IDS } from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";

const COLLECTION = APP_IDS.collections.TICKETS;
const VOUCHERS_COLLECTION = APP_IDS.collections.VOUCHERS;

/**
 * Estados del ticket operativo:
 *   generated                — recién emitido desde un voucher
 *   ready_to_print           — listo para impresión
 *   printed                  — impreso al menos una vez
 *   loading                  — en proceso de carga (báscula)
 *   loaded                   — cargado, peso registrado
 *   pending_exit_validation  — esperando validación de salida (QR scan)
 *   completed                — operación cerrada exitosamente
 *   cancelled                — cancelado
 *   blocked                  — bloqueado por situación operativa
 */
export const TICKET_STATUSES = {
  generated: { label: "Generado", color: "slate" },
  ready_to_print: { label: "Listo para imprimir", color: "blue" },
  printed: { label: "Impreso", color: "cyan" },
  loading: { label: "En carga", color: "amber" },
  loaded: { label: "Cargado", color: "orange" },
  pending_exit_validation: { label: "Pendiente salida", color: "indigo" },
  completed: { label: "Completado", color: "green" },
  cancelled: { label: "Cancelado", color: "red" },
  blocked: { label: "Bloqueado", color: "rose" },
};

/** Voucher statuses that allow ticket generation */
const VALID_VOUCHER_STATUSES = ["issued", "ready_for_ticket"];

/**
 * Generates a ticket number: T-YYMMDD-XXXX
 * 4 random hex chars for collision avoidance
 */
function generateTicketNumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `T-${yy}${mm}${dd}-${rand}`;
}

/**
 * QR secret for HMAC — from env or fallback
 */
const QR_SECRET = import.meta.env.VITE_QR_SECRET || "MF_DEFAULT_QR_KEY_2024";

/**
 * Generates an HMAC-SHA256 token for the QR payload.
 * Uses the Web Crypto API for proper cryptographic integrity.
 */
async function generateHmacToken(ticketId, ticketNumber) {
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
  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16)
    .toUpperCase();
}

/**
 * Verifies the HMAC token in a QR payload.
 */
export async function verifyQrToken(ticketId, ticketNumber, token) {
  const expected = await generateHmacToken(ticketId, ticketNumber);
  return expected === token;
}

/**
 * Generates the QR payload with HMAC integrity.
 * Format: "MF:<ticketId>:<hmacToken>"
 */
async function generateQrData(ticketId, ticketNumber) {
  const token = await generateHmacToken(ticketId, ticketNumber);
  return `MF:${ticketId}:${token}`;
}

export function useTickets() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Related catalogs for name resolution
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [plants, setPlants] = useState([]);

  /* ─── Audit helper ─── */
  const logAudit = async (action, docId, details = {}) => {
    if (!user) return;
    try {
      await databases.createDocument(DATABASE_ID, APP_IDS.collections.AUDIT_LOGS, ID.unique(), {
        action,
        collection: COLLECTION,
        docId,
        userId: user.$id,
        details: JSON.stringify(details),
      });
    } catch (err) {
      console.warn("Audit log failed:", err.message);
    }
  };

  /* ─── Load catalogs ─── */
  const fetchClients = useCallback(async () => {
    try {
      const res = await databases.listDocuments(DATABASE_ID, APP_IDS.collections.CLIENTS, [
        Query.equal("active", true),
        Query.orderAsc("name"),
        Query.limit(500),
      ]);
      setClients(res.documents);
    } catch (err) {
      console.error("Error cargando clientes:", err);
    }
  }, []);

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await databases.listDocuments(DATABASE_ID, APP_IDS.collections.DRIVERS, [
        Query.equal("active", true),
        Query.orderAsc("fullName"),
        Query.limit(500),
      ]);
      setDrivers(res.documents);
    } catch (err) {
      console.error("Error cargando choferes:", err);
    }
  }, []);

  const fetchTrucks = useCallback(async () => {
    try {
      const res = await databases.listDocuments(DATABASE_ID, APP_IDS.collections.TRUCKS, [
        Query.equal("active", true),
        Query.orderDesc("$createdAt"),
        Query.limit(500),
      ]);
      setTrucks(res.documents);
    } catch (err) {
      console.error("Error cargando camiones:", err);
    }
  }, []);

  const fetchMaterials = useCallback(async () => {
    try {
      const res = await databases.listDocuments(DATABASE_ID, APP_IDS.collections.MATERIALS, [
        Query.equal("active", true),
        Query.orderAsc("name"),
        Query.limit(500),
      ]);
      setMaterials(res.documents);
    } catch (err) {
      console.error("Error cargando materiales:", err);
    }
  }, []);

  const fetchPlants = useCallback(async () => {
    try {
      const res = await databases.listDocuments(DATABASE_ID, APP_IDS.collections.PLANTS, [
        Query.equal("active", true),
        Query.orderAsc("sortOrder"),
        Query.limit(500),
      ]);
      setPlants(res.documents);
    } catch (err) {
      console.error("Error cargando plantas:", err);
    }
  }, []);

  /* ─── Load tickets ─── */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const queries = [Query.orderDesc("$createdAt"), Query.limit(200)];

      if (filterStatus !== "all") {
        queries.push(Query.equal("status", filterStatus));
      }

      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION,
        queries,
      );
      let docs = res.documents;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        docs = docs.filter(
          (d) =>
            (d.ticketNumber || "").toLowerCase().includes(q) ||
            (d.qrData || "").toLowerCase().includes(q),
        );
      }

      setItems(docs);
    } catch (err) {
      console.error("Error cargando tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  /* ─── Generate ticket from voucher ─── */
  const generateFromVoucher = async (voucher) => {
    // Validate voucher state
    if (!VALID_VOUCHER_STATUSES.includes(voucher.status)) {
      throw new Error(
        `No se puede generar ticket desde un voucher en estado "${voucher.status}"`,
      );
    }

    // Check no existing active ticket for this voucher (1:1 policy)
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTION, [
      Query.equal("voucherId", voucher.$id),
      Query.limit(1),
    ]);
    const activeTicket = existing.documents.find(
      (t) => t.status !== "cancelled" && t.status !== "blocked",
    );
    if (activeTicket) {
      throw new Error(
        `Ya existe un ticket activo (${activeTicket.ticketNumber}) para este voucher`,
      );
    }

    // Generate unique identifiers
    const ticketId = ID.unique();
    const ticketNumber = generateTicketNumber();
    const qrData = await generateQrData(ticketId, ticketNumber);

    // Create ticket document
    const payload = {
      ticketNumber,
      voucherId: voucher.$id,
      type: "voucher",
      status: "generated",
      clientId: voucher.clientId,
      driverId: voucher.driverId || "",
      truckId: voucher.truckId || "",
      materialId: voucher.materialId,
      plantId: voucher.plantId,
      commercialQty: voucher.commercialQty,
      commercialUnit: voucher.commercialUnit || "viaje",
      qrData,
      printCount: 0,
      notes: voucher.notes || "",
      cancelReason: "",
      createdBy: user.$id,
    };

    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTION,
      ticketId,
      payload,
    );

    // Transition voucher to consumed and update usedQty
    await databases.updateDocument(
      DATABASE_ID,
      VOUCHERS_COLLECTION,
      voucher.$id,
      {
        status: "consumed",
        ticketId: doc.$id,
        usedQty: voucher.commercialQty,
        updatedBy: user.$id,
      },
    );

    await logAudit("ticket.generate", doc.$id, {
      ticketNumber,
      voucherId: voucher.$id,
      voucherFolio: voucher.internalFolio,
    });

    await fetchItems();
    return doc;
  };

  /* ─── Change status ─── */
  const changeStatus = async (id, newStatus, reason = "") => {
    const payload = { status: newStatus, updatedBy: user.$id };
    if (newStatus === "cancelled" && reason) {
      payload.cancelReason = reason.trim();
    }
    await databases.updateDocument(DATABASE_ID, COLLECTION, id, payload);
    await logAudit(`ticket.${newStatus}`, id, { status: newStatus, reason });
    await fetchItems();
  };

  const cancel = async (id, reason = "") => {
    await changeStatus(id, "cancelled", reason);
  };

  const markReadyToPrint = async (id) => {
    await changeStatus(id, "ready_to_print");
  };

  /* ─── Initial load ─── */
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchClients();
    fetchDrivers();
    fetchTrucks();
    fetchMaterials();
    fetchPlants();
  }, [fetchClients, fetchDrivers, fetchTrucks, fetchMaterials, fetchPlants]);

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
    fetchItems,
    generateFromVoucher,
    cancel,
    markReadyToPrint,
    changeStatus,
  };
}
