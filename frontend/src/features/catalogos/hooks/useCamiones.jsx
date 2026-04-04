import { useState, useEffect, useCallback } from "react";
import { databases, DATABASE_ID, APP_IDS } from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  fetchWithCache,
  requireOnline,
} from "../../../shared/lib/catalogCache";

const COLLECTION = APP_IDS.collections.TRUCKS;

export function useCamiones() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);

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

  /* ─── Load active clients for selector ─── */
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

  /* ─── Load active drivers for selector ─── */
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

  /* ─── Load trucks ─── */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const queries = [Query.orderDesc("$createdAt"), Query.limit(200)];

      if (filterStatus === "active") queries.push(Query.equal("active", true));
      if (filterStatus === "inactive")
        queries.push(Query.equal("active", false));

      const cacheKey = `trucks_${filterStatus}`;
      const res = await fetchWithCache(cacheKey, () =>
        databases.listDocuments(DATABASE_ID, COLLECTION, queries),
      );
      let docs = res.documents;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        docs = docs.filter(
          (d) =>
            (d.plateNumber || "").toLowerCase().includes(q) ||
            (d.secondaryPlateNumber || "").toLowerCase().includes(q) ||
            (d.economicNumber || "").toLowerCase().includes(q) ||
            (d.brand || "").toLowerCase().includes(q) ||
            (d.model || "").toLowerCase().includes(q) ||
            (d.truckType || "").toLowerCase().includes(q),
        );
      }

      setItems(docs);
    } catch (err) {
      console.error("Error cargando camiones:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  /* ─── CRUD (requires online) ─── */
  const create = async (data) => {
    requireOnline();
    const payload = {
      plateNumber: data.plateNumber.trim().toUpperCase(),
      secondaryPlateNumber:
        data.secondaryPlateNumber?.trim().toUpperCase() || "",
      economicNumber: data.economicNumber?.trim().toUpperCase() || "",
      truckType: data.truckType?.trim() || "",
      brand: data.brand?.trim() || "",
      model: data.model?.trim() || "",
      year: data.year ? parseInt(data.year, 10) : null,
      color: data.color?.trim() || "",
      axleType: data.axleType?.trim() || "",
      referenceCapacity: data.referenceCapacity
        ? parseFloat(data.referenceCapacity)
        : null,
      clientId: data.clientId || "",
      habitualDriverId: data.habitualDriverId || "",
      notes: data.notes?.trim() || "",
      active: true,
      createdBy: user.$id,
    };

    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTION,
      ID.unique(),
      payload,
    );
    await logAudit("truck.create", doc.$id, {
      plateNumber: payload.plateNumber,
    });
    await fetchItems();
    return doc;
  };

  const update = async (id, data) => {
    requireOnline();
    const payload = { updatedBy: user.$id };

    if (data.plateNumber !== undefined)
      payload.plateNumber = data.plateNumber.trim().toUpperCase();
    if (data.secondaryPlateNumber !== undefined)
      payload.secondaryPlateNumber = data.secondaryPlateNumber
        .trim()
        .toUpperCase();
    if (data.economicNumber !== undefined)
      payload.economicNumber = data.economicNumber.trim().toUpperCase();

    const stringFields = [
      "truckType",
      "brand",
      "model",
      "color",
      "axleType",
      "notes",
    ];
    for (const key of stringFields) {
      if (data[key] !== undefined) payload[key] = data[key].trim();
    }

    if (data.year !== undefined)
      payload.year = data.year ? parseInt(data.year, 10) : null;
    if (data.referenceCapacity !== undefined)
      payload.referenceCapacity = data.referenceCapacity
        ? parseFloat(data.referenceCapacity)
        : null;
    if (data.clientId !== undefined) payload.clientId = data.clientId || "";
    if (data.habitualDriverId !== undefined)
      payload.habitualDriverId = data.habitualDriverId || "";

    await databases.updateDocument(DATABASE_ID, COLLECTION, id, payload);
    await logAudit("truck.update", id, { fields: Object.keys(payload) });
    await fetchItems();
  };

  const toggleActive = async (id, currentActive) => {
    requireOnline();
    const newActive = !currentActive;
    await databases.updateDocument(DATABASE_ID, COLLECTION, id, {
      active: newActive,
      updatedBy: user.$id,
    });
    await logAudit(newActive ? "truck.activate" : "truck.disable", id, {
      active: newActive,
    });
    await fetchItems();
  };

  useEffect(() => {
    fetchItems();
    fetchClients();
    fetchDrivers();
  }, [fetchItems, fetchClients, fetchDrivers]);

  return {
    items,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    clients,
    drivers,
    fetchItems,
    create,
    update,
    toggleActive,
  };
}
