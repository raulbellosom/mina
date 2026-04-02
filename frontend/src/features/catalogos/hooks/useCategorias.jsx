import { useState, useEffect, useCallback } from "react";
import { databases, DATABASE_ID } from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";

/**
 * Hook para gestión de categorías de materiales.
 *
 * Operaciones:
 *   fetchItems()             — lista categorías con búsqueda/filtro
 *   create(data)             — crea una categoría nueva
 *   update(id, data)         — actualiza datos de la categoría
 *   toggleActive(id, active) — activa/desactiva lógicamente
 */
export function useCategorias() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'active' | 'inactive'

  const logAudit = async (action, docId, details = {}) => {
    if (!user) return;
    try {
      await databases.createDocument(DATABASE_ID, "audit_logs", ID.unique(), {
        action,
        collection: "material_categories",
        docId,
        userId: user.$id,
        details: JSON.stringify(details),
      });
    } catch (err) {
      console.warn("Audit log failed:", err.message);
    }
  };

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const queries = [
        Query.orderAsc("sortOrder"),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ];

      if (filterStatus === "active") queries.push(Query.equal("active", true));
      if (filterStatus === "inactive")
        queries.push(Query.equal("active", false));

      const res = await databases.listDocuments(
        DATABASE_ID,
        "material_categories",
        queries,
      );
      let docs = res.documents;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        docs = docs.filter(
          (c) =>
            (c.name || "").toLowerCase().includes(q) ||
            (c.code || "").toLowerCase().includes(q) ||
            (c.description || "").toLowerCase().includes(q),
        );
      }

      setItems(docs);
    } catch (err) {
      console.error("Error cargando categorías:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  const create = async (data) => {
    const payload = {
      name: data.name.trim(),
      code: data.code.trim(),
      description: data.description?.trim() || "",
      sortOrder: data.sortOrder ? parseInt(data.sortOrder, 10) : 0,
      active: true,
      createdBy: user.$id,
    };

    const doc = await databases.createDocument(
      DATABASE_ID,
      "material_categories",
      ID.unique(),
      payload,
    );
    await logAudit("category.create", doc.$id, {
      name: payload.name,
      code: payload.code,
    });
    await fetchItems();
    return doc;
  };

  const update = async (id, data) => {
    const allowed = ["name", "code", "description", "sortOrder"];
    const payload = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        payload[key] =
          key === "sortOrder" ? parseInt(data[key], 10) || 0 : data[key].trim();
      }
    }

    await databases.updateDocument(
      DATABASE_ID,
      "material_categories",
      id,
      payload,
    );
    await logAudit("category.update", id, { fields: Object.keys(payload) });
    await fetchItems();
  };

  const toggleActive = async (id, currentActive) => {
    const newActive = !currentActive;
    await databases.updateDocument(DATABASE_ID, "material_categories", id, {
      active: newActive,
    });
    await logAudit(newActive ? "category.activate" : "category.disable", id, {
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
