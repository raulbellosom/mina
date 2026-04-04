import { useState, useEffect, useCallback } from "react";
import { databases, DATABASE_ID, APP_IDS } from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";

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

  /* ─── Load plants ─── */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const queries = [Query.orderAsc("sortOrder"), Query.limit(200)];

      if (filterStatus === "active") queries.push(Query.equal("active", true));
      if (filterStatus === "inactive")
        queries.push(Query.equal("active", false));

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

  /* ─── CRUD ─── */
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

    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTION,
      ID.unique(),
      payload,
    );
    await logAudit("plant.create", doc.$id, { name: payload.name });
    await fetchItems();
    return doc;
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

    await databases.updateDocument(DATABASE_ID, COLLECTION, id, payload);
    await logAudit("plant.update", id, { fields: Object.keys(payload) });
    await fetchItems();
  };

  const toggleActive = async (id, currentActive) => {
    const newActive = !currentActive;
    await databases.updateDocument(DATABASE_ID, COLLECTION, id, {
      active: newActive,
      updatedBy: user.$id,
    });
    await logAudit(newActive ? "plant.activate" : "plant.disable", id, {
      active: newActive,
    });
    await fetchItems();
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
