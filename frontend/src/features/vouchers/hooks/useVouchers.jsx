import { useState, useEffect, useCallback } from "react";
import { databases, DATABASE_ID, APP_IDS } from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  fetchWithCache,
  requireOnline,
} from "../../../shared/lib/catalogCache";

const COLLECTION = APP_IDS.collections.VOUCHERS;

/**
 * Estados del voucher:
 *   draft            — recién creado, editable libremente
 *   issued           — emitido/confirmado, aún sin ticket
 *   ready_for_ticket — listo para generar ticket operativo (Task 13)
 *   consumed         — ya se generó ticket a partir de este voucher
 *   cancelled        — cancelado por usuario autorizado
 *   blocked          — bloqueado por situación operativa
 *
 * Transiciones permitidas:
 *   draft → issued → ready_for_ticket → consumed
 *   draft|issued|ready_for_ticket → cancelled
 *   any (admin) → blocked
 *
 * Editable: solo en draft o issued
 */
export const VOUCHER_STATUSES = {
  draft: { label: "Borrador", color: "slate" },
  issued: { label: "Emitido", color: "blue" },
  ready_for_ticket: { label: "Listo para ticket", color: "indigo" },
  consumed: { label: "Consumido", color: "green" },
  cancelled: { label: "Cancelado", color: "red" },
  blocked: { label: "Bloqueado", color: "amber" },
};

export const EDITABLE_STATUSES = ["draft", "issued"];
export const CANCELLABLE_STATUSES = ["draft", "issued", "ready_for_ticket"];

const COMMERCIAL_UNITS = [
  { value: "viaje", label: "Viaje" },
  { value: "tonelada", label: "Tonelada" },
  { value: "m3", label: "Metro cúbico (m³)" },
  { value: "kg", label: "Kilogramo (kg)" },
  { value: "pieza", label: "Pieza" },
];

/** Genera folio interno: V-YYMMDD-XXXX (4 random hex) */
function generateFolio() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `V-${yy}${mm}${dd}-${rand}`;
}

export function useVouchers() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Related catalogs
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [plants, setPlants] = useState([]);

  /* ─── Audit helper ─── */
  const logAudit = async (action, docId, details = {}) => {
    if (!user) return;
    try {
      await databases.createDocument(
        DATABASE_ID,
        APP_IDS.collections.AUDIT_LOGS,
        ID.unique(),
        {
          action,
          collection: COLLECTION,
          docId,
          userId: user.$id,
          details: JSON.stringify(details),
        },
      );
    } catch (err) {
      console.warn("Audit log failed:", err.message);
    }
  };

  /* ─── Load catalogs ─── */
  const fetchClients = useCallback(async () => {
    try {
      const res = await fetchWithCache("clients_active", () =>
        databases.listDocuments(DATABASE_ID, APP_IDS.collections.CLIENTS, [
          Query.equal("active", true),
          Query.orderAsc("name"),
          Query.limit(500),
        ]),
      );
      setClients(res.documents);
    } catch (err) {
      console.error("Error cargando clientes:", err);
    }
  }, []);

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await fetchWithCache("drivers_active", () =>
        databases.listDocuments(DATABASE_ID, APP_IDS.collections.DRIVERS, [
          Query.equal("active", true),
          Query.orderAsc("fullName"),
          Query.limit(500),
        ]),
      );
      setDrivers(res.documents);
    } catch (err) {
      console.error("Error cargando choferes:", err);
    }
  }, []);

  const fetchTrucks = useCallback(async () => {
    try {
      const res = await fetchWithCache("trucks_active", () =>
        databases.listDocuments(DATABASE_ID, APP_IDS.collections.TRUCKS, [
          Query.equal("active", true),
          Query.orderDesc("$createdAt"),
          Query.limit(500),
        ]),
      );
      setTrucks(res.documents);
    } catch (err) {
      console.error("Error cargando camiones:", err);
    }
  }, []);

  const fetchMaterials = useCallback(async () => {
    try {
      const res = await fetchWithCache("materials_active", () =>
        databases.listDocuments(DATABASE_ID, APP_IDS.collections.MATERIALS, [
          Query.equal("active", true),
          Query.orderAsc("name"),
          Query.limit(500),
        ]),
      );
      setMaterials(res.documents);
    } catch (err) {
      console.error("Error cargando materiales:", err);
    }
  }, []);

  const fetchPlants = useCallback(async () => {
    try {
      const res = await fetchWithCache("plants_active", () =>
        databases.listDocuments(DATABASE_ID, APP_IDS.collections.PLANTS, [
          Query.equal("active", true),
          Query.orderAsc("sortOrder"),
          Query.limit(500),
        ]),
      );
      setPlants(res.documents);
    } catch (err) {
      console.error("Error cargando plantas:", err);
    }
  }, []);

  /* ─── Load vouchers ─── */
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
            (d.internalFolio || "").toLowerCase().includes(q) ||
            (d.externalReference || "").toLowerCase().includes(q),
        );
      }

      setItems(docs);
    } catch (err) {
      console.error("Error cargando vouchers:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  /* ─── CRUD (requires online) ─── */
  const create = async (data) => {
    requireOnline();
    const folio = generateFolio();
    const payload = {
      internalFolio: folio,
      externalReference: data.externalReference?.trim() || "",
      clientId: data.clientId,
      driverId: data.driverId || "",
      truckId: data.truckId || "",
      materialId: data.materialId,
      plantId: data.plantId,
      commercialQty: parseFloat(data.commercialQty),
      commercialUnit: data.commercialUnit || "viaje",
      usedQty: 0,
      status: "draft",
      notes: data.notes?.trim() || "",
      cancelReason: "",
      ticketId: "",
      createdBy: user.$id,
    };

    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTION,
      ID.unique(),
      payload,
    );
    await logAudit("voucher.create", doc.$id, {
      folio,
      clientId: payload.clientId,
      materialId: payload.materialId,
    });
    await fetchItems();
    return doc;
  };

  const update = async (id, data, currentStatus) => {
    requireOnline();
    if (!EDITABLE_STATUSES.includes(currentStatus)) {
      throw new Error(
        `No se puede editar un voucher en estado "${VOUCHER_STATUSES[currentStatus]?.label || currentStatus}"`,
      );
    }

    const payload = { updatedBy: user.$id };

    if (data.externalReference !== undefined)
      payload.externalReference = data.externalReference.trim();
    if (data.clientId !== undefined) payload.clientId = data.clientId;
    if (data.driverId !== undefined) payload.driverId = data.driverId || "";
    if (data.truckId !== undefined) payload.truckId = data.truckId || "";
    if (data.materialId !== undefined) payload.materialId = data.materialId;
    if (data.plantId !== undefined) payload.plantId = data.plantId;
    if (data.commercialQty !== undefined)
      payload.commercialQty = parseFloat(data.commercialQty);
    if (data.commercialUnit !== undefined)
      payload.commercialUnit = data.commercialUnit;
    if (data.notes !== undefined) payload.notes = data.notes.trim();

    await databases.updateDocument(DATABASE_ID, COLLECTION, id, payload);
    await logAudit("voucher.update", id, { fields: Object.keys(payload) });
    await fetchItems();
  };

  const changeStatus = async (id, newStatus, reason = "") => {
    requireOnline();
    const payload = { status: newStatus, updatedBy: user.$id };
    if (newStatus === "cancelled" && reason) {
      payload.cancelReason = reason.trim();
    }
    await databases.updateDocument(DATABASE_ID, COLLECTION, id, payload);
    await logAudit(`voucher.${newStatus}`, id, { status: newStatus, reason });
    await fetchItems();
  };

  const cancel = async (id, currentStatus, reason = "") => {
    if (!CANCELLABLE_STATUSES.includes(currentStatus)) {
      throw new Error(
        `No se puede cancelar un voucher en estado "${VOUCHER_STATUSES[currentStatus]?.label || currentStatus}"`,
      );
    }
    await changeStatus(id, "cancelled", reason);
  };

  const issue = async (id) => {
    await changeStatus(id, "issued");
  };

  const markReadyForTicket = async (id) => {
    await changeStatus(id, "ready_for_ticket");
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
    create,
    update,
    cancel,
    issue,
    markReadyForTicket,
    changeStatus,
    COMMERCIAL_UNITS,
  };
}

export { COMMERCIAL_UNITS };
