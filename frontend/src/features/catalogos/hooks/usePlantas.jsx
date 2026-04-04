import { useState, useEffect, useCallback } from "react";
import { databases, DATABASE_ID, APP_IDS } from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  fetchWithCache,
  isNetworkError,
} from "../../../shared/lib/catalogCache";
import { addToQueue } from "../../../shared/lib/offlineStorage";

const COLLECTION = APP_IDS.collections.PLANTS;

export function usePlantas() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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

  /* ─── Load plants (with offline cache) ─── */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const queries = [Query.orderAsc("sortOrder"), Query.limit(200)];

      if (filterStatus === "active") queries.push(Query.equal("active", true));
      if (filterStatus === "inactive")
        queries.push(Query.equal("active", false));

      const cacheKey = `plants_${filterStatus}`;
      const res = await fetchWithCache(cacheKey, () =>
        databases.listDocuments(DATABASE_ID, COLLECTION, queries),
      );
      let docs = res.documents;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        docs = docs.filter(
          (d) =>
            (d.name || "").toLowerCase().includes(q) ||
            (d.code || "").toLowerCase().includes(q) ||
            (d.type || "").toLowerCase().includes(q) ||
            (d.locationReference || "").toLowerCase().includes(q) ||
            (d.description || "").toLowerCase().includes(q),
        );
      }

      setItems(docs);
    } catch (err) {
      console.error("Error cargando plantas:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  /* ─── CRUD (with offline queue fallback) ─── */
  const create = async (data) => {
    const payload = {
      name: data.name.trim(),
      code: data.code?.trim().toUpperCase() || "",
      type: data.type?.trim() || "",
      locationReference: data.locationReference?.trim() || "",
      description: data.description?.trim() || "",
      contactName: data.contactName?.trim() || "",
      contactPhone: data.contactPhone?.trim() || "",
      notes: data.notes?.trim() || "",
      sortOrder: data.sortOrder ? parseInt(data.sortOrder, 10) : 0,
      active: true,
      createdBy: user.$id,
    };

    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTION,
        ID.unique(),
        payload,
      );
      await logAudit("plant.create", doc.$id, { name: payload.name });
      await fetchItems();
      return doc;
    } catch (err) {
      if (isNetworkError(err)) {
        const entry = await addToQueue({
          collection: COLLECTION,
          action: "create",
          data: payload,
          meta: {
            module: "catalogos",
            description: `Crear planta: ${payload.name}`,
          },
        });
        setItems((prev) => [
          { ...payload, $id: entry.id, _offline: true },
          ...prev,
        ]);
        return { offline: true };
      }
      throw err;
    }
  };

  const update = async (id, data) => {
    const payload = { updatedBy: user.$id };

    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.code !== undefined) payload.code = data.code.trim().toUpperCase();

    const stringFields = [
      "type",
      "locationReference",
      "description",
      "contactName",
      "contactPhone",
      "notes",
    ];
    for (const key of stringFields) {
      if (data[key] !== undefined) payload[key] = data[key].trim();
    }

    if (data.sortOrder !== undefined)
      payload.sortOrder = data.sortOrder ? parseInt(data.sortOrder, 10) : 0;

    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION, id, payload);
      await logAudit("plant.update", id, { fields: Object.keys(payload) });
      await fetchItems();
    } catch (err) {
      if (isNetworkError(err)) {
        await addToQueue({
          collection: COLLECTION,
          action: "update",
          documentId: id,
          data: payload,
          meta: { module: "catalogos", description: `Editar planta: ${id}` },
        });
        setItems((prev) =>
          prev.map((item) =>
            item.$id === id ? { ...item, ...payload, _offline: true } : item,
          ),
        );
        return { offline: true };
      }
      throw err;
    }
  };

  const toggleActive = async (id, currentActive) => {
    const newActive = !currentActive;
    const payload = { active: newActive, updatedBy: user.$id };
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION, id, payload);
      await logAudit(newActive ? "plant.activate" : "plant.disable", id, {
        active: newActive,
      });
      await fetchItems();
    } catch (err) {
      if (isNetworkError(err)) {
        await addToQueue({
          collection: COLLECTION,
          action: "update",
          documentId: id,
          data: payload,
          meta: {
            module: "catalogos",
            description: `${newActive ? "Activar" : "Desactivar"} planta: ${id}`,
          },
        });
        setItems((prev) =>
          prev.map((item) =>
            item.$id === id ? { ...item, ...payload, _offline: true } : item,
          ),
        );
        return { offline: true };
      }
      throw err;
    }
  };

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
    fetchItems,
    create,
    update,
    toggleActive,
  };
}
