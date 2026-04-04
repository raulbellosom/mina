import { useState, useEffect, useCallback } from "react";
import { databases, DATABASE_ID, APP_IDS } from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  fetchWithCache,
  requireOnline,
} from "../../../shared/lib/catalogCache";

const COLLECTION = APP_IDS.collections.CLIENTS;

/**
 * Hook para gestión de clientes.
 *
 * Operaciones:
 *   fetchItems()             — lista clientes con búsqueda/filtro
 *   create(data)             — crea un cliente nuevo
 *   update(id, data)         — actualiza datos del cliente
 *   toggleActive(id, active) — activa/desactiva lógicamente
 */
export function useClientes() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'active' | 'inactive'
  const [filterType, setFilterType] = useState("all"); // 'all' | 'person' | 'company'

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

  /* ─── Load clients ─── */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const queries = [Query.orderDesc("$createdAt"), Query.limit(200)];

      if (filterStatus === "active") queries.push(Query.equal("active", true));
      if (filterStatus === "inactive")
        queries.push(Query.equal("active", false));
      if (filterType !== "all") queries.push(Query.equal("type", filterType));

      const cacheKey = `clients_${filterStatus}_${filterType}`;
      const res = await fetchWithCache(cacheKey, () =>
        databases.listDocuments(DATABASE_ID, COLLECTION, queries),
      );
      let docs = res.documents;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        docs = docs.filter(
          (c) =>
            (c.name || "").toLowerCase().includes(q) ||
            (c.tradeName || "").toLowerCase().includes(q) ||
            (c.contactName || "").toLowerCase().includes(q) ||
            (c.rfc || "").toLowerCase().includes(q) ||
            (c.email || "").toLowerCase().includes(q) ||
            (c.phone || "").toLowerCase().includes(q),
        );
      }

      setItems(docs);
    } catch (err) {
      console.error("Error cargando clientes:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterType]);

  /* ─── CRUD (requires online) ─── */
  const create = async (data) => {
    requireOnline();
    const payload = {
      type: data.type,
      name: data.name.trim(),
      tradeName: data.tradeName?.trim() || "",
      contactName: data.contactName?.trim() || "",
      rfc: data.rfc?.trim().toUpperCase() || "",
      phone: data.phone?.trim() || "",
      email: data.email?.trim().toLowerCase() || "",
      address: data.address?.trim() || "",
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
    await logAudit("client.create", doc.$id, {
      name: payload.name,
      type: payload.type,
    });
    await fetchItems();
    return doc;
  };

  const update = async (id, data) => {
    requireOnline();
    const allowed = [
      "type",
      "name",
      "tradeName",
      "contactName",
      "rfc",
      "phone",
      "email",
      "address",
      "notes",
    ];
    const payload = { updatedBy: user.$id };
    for (const key of allowed) {
      if (data[key] !== undefined) {
        let val = data[key];
        if (typeof val === "string") {
          val = val.trim();
          if (key === "rfc") val = val.toUpperCase();
          if (key === "email") val = val.toLowerCase();
        }
        payload[key] = val;
      }
    }

    await databases.updateDocument(DATABASE_ID, COLLECTION, id, payload);
    await logAudit("client.update", id, { fields: Object.keys(payload) });
    await fetchItems();
  };

  const toggleActive = async (id, currentActive) => {
    requireOnline();
    const newActive = !currentActive;
    await databases.updateDocument(DATABASE_ID, COLLECTION, id, {
      active: newActive,
      updatedBy: user.$id,
    });
    await logAudit(newActive ? "client.activate" : "client.disable", id, {
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
    filterType,
    setFilterType,
    fetchItems,
    create,
    update,
    toggleActive,
  };
}
