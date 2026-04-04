import { useState, useEffect, useCallback } from "react";
import { databases, DATABASE_ID, APP_IDS } from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";

const COLLECTION = APP_IDS.collections.DRIVERS;

/**
 * Hook para gestión de choferes.
 *
 * Operaciones:
 *   fetchItems()             — lista choferes con búsqueda/filtro
 *   create(data)             — crea un chofer nuevo
 *   update(id, data)         — actualiza datos del chofer
 *   toggleActive(id, active) — activa/desactiva lógicamente
 */
export function useChoferes() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'active' | 'inactive'
  const [clients, setClients] = useState([]);

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

  /* ─── Load active clients for selector ─── */
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

  /* ─── Load drivers ─── */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const queries = [Query.orderDesc("$createdAt"), Query.limit(200)];

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
            (d.fullName || "").toLowerCase().includes(q) ||
            (d.firstName || "").toLowerCase().includes(q) ||
            (d.lastName || "").toLowerCase().includes(q) ||
            (d.licenseNumber || "").toLowerCase().includes(q) ||
            (d.phone || "").toLowerCase().includes(q) ||
            (d.email || "").toLowerCase().includes(q),
        );
      }

      setItems(docs);
    } catch (err) {
      console.error("Error cargando choferes:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  /* ─── CRUD ─── */
  const create = async (data) => {
    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();
    const payload = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      phone: data.phone?.trim() || "",
      email: data.email?.trim().toLowerCase() || "",
      licenseNumber: data.licenseNumber?.trim().toUpperCase() || "",
      clientId: data.clientId || "",
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
    await logAudit("driver.create", doc.$id, {
      fullName: payload.fullName,
    });
    await fetchItems();
    return doc;
  };

  const update = async (id, data) => {
    const payload = { updatedBy: user.$id };

    const firstName = data.firstName?.trim();
    const lastName = data.lastName?.trim();
    if (firstName !== undefined) payload.firstName = firstName;
    if (lastName !== undefined) payload.lastName = lastName;
    if (firstName && lastName) {
      payload.fullName = `${firstName} ${lastName}`;
    }

    const stringFields = ["phone", "licenseNumber", "notes"];
    for (const key of stringFields) {
      if (data[key] !== undefined) {
        let val = data[key].trim();
        if (key === "licenseNumber") val = val.toUpperCase();
        payload[key] = val;
      }
    }
    if (data.email !== undefined) {
      payload.email = data.email.trim().toLowerCase();
    }
    if (data.clientId !== undefined) {
      payload.clientId = data.clientId || "";
    }

    await databases.updateDocument(DATABASE_ID, COLLECTION, id, payload);
    await logAudit("driver.update", id, { fields: Object.keys(payload) });
    await fetchItems();
  };

  const toggleActive = async (id, currentActive) => {
    const newActive = !currentActive;
    await databases.updateDocument(DATABASE_ID, COLLECTION, id, {
      active: newActive,
      updatedBy: user.$id,
    });
    await logAudit(newActive ? "driver.activate" : "driver.disable", id, {
      active: newActive,
    });
    await fetchItems();
  };

  useEffect(() => {
    fetchItems();
    fetchClients();
  }, [fetchItems, fetchClients]);

  return {
    items,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    clients,
    fetchItems,
    create,
    update,
    toggleActive,
  };
}
