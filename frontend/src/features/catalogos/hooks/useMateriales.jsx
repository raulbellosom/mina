import { useState, useEffect, useCallback } from "react";
import {
  databases,
  DATABASE_ID,
  storage,
  APP_IDS,
} from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  fetchWithCache,
  isNetworkError,
} from "../../../shared/lib/catalogCache";
import { addToQueue } from "../../../shared/lib/offlineStorage";

const COLLECTION = APP_IDS.collections.MATERIALS;
const BUCKET = APP_IDS.buckets.MATERIAL_IMAGES;

/**
 * Hook para gestión de materiales.
 *
 * Operaciones:
 *   fetchItems()             — lista materiales con búsqueda/filtro
 *   create(data, imageFile)  — crea un material nuevo (con imagen opcional)
 *   update(id, data, imageFile) — actualiza datos del material
 *   toggleActive(id, active) — activa/desactiva lógicamente
 *   getImageUrl(fileId)      — obtiene la URL de preview de una imagen
 */
export function useMateriales() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [categories, setCategories] = useState([]);

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

  /* ─── Load categories for selectors ─── */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetchWithCache("material_categories_active", () =>
        databases.listDocuments(
          DATABASE_ID,
          APP_IDS.collections.MATERIAL_CATEGORIES,
          [
            Query.equal("active", true),
            Query.orderAsc("sortOrder"),
            Query.limit(200),
          ],
        ),
      );
      setCategories(res.documents);
    } catch (err) {
      console.error("Error cargando categorías:", err);
    }
  }, []);

  /* ─── Load materials ─── */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const queries = [
        Query.orderAsc("sortOrder"),
        Query.orderDesc("$createdAt"),
        Query.limit(200),
      ];

      if (filterStatus === "active") queries.push(Query.equal("active", true));
      if (filterStatus === "inactive")
        queries.push(Query.equal("active", false));
      if (filterCategory !== "all")
        queries.push(Query.equal("categoryId", filterCategory));

      const cacheKey = `materials_${filterStatus}_${filterCategory}`;
      const res = await fetchWithCache(cacheKey, () =>
        databases.listDocuments(DATABASE_ID, COLLECTION, queries),
      );
      let docs = res.documents;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        docs = docs.filter(
          (m) =>
            (m.name || "").toLowerCase().includes(q) ||
            (m.code || "").toLowerCase().includes(q) ||
            (m.description || "").toLowerCase().includes(q),
        );
      }

      setItems(docs);
    } catch (err) {
      console.error("Error cargando materiales:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterCategory]);

  /* ─── Image helpers ─── */
  const uploadImage = async (file) => {
    const result = await storage.createFile(BUCKET, ID.unique(), file);
    return result.$id;
  };

  const deleteImage = async (fileId) => {
    if (!fileId) return;
    try {
      await storage.deleteFile(BUCKET, fileId);
    } catch (err) {
      console.warn("Delete image failed (may not exist):", err.message);
    }
  };

  const getImageUrl = (fileId) => {
    if (!fileId) return null;
    return storage.getFilePreview(BUCKET, fileId, 400, 400);
  };

  const getImageThumbnail = (fileId) => {
    if (!fileId) return null;
    return storage.getFilePreview(BUCKET, fileId, 80, 80);
  };

  /* ─── CRUD (with offline queue fallback) ─── */
  const create = async (data, imageFile) => {
    let imageFileId = "";
    if (imageFile) {
      try {
        imageFileId = await uploadImage(imageFile);
      } catch (imgErr) {
        if (!isNetworkError(imgErr)) throw imgErr;
        // Skip image upload when offline — document will be created without it
      }
    }

    const payload = {
      name: data.name.trim(),
      code: data.code.trim(),
      categoryId: data.categoryId,
      description: data.description?.trim() || "",
      referenceImageFileId: imageFileId,
      defaultCommercialUnit: data.defaultCommercialUnit?.trim() || "viaje",
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
      await logAudit("material.create", doc.$id, {
        name: payload.name,
        code: payload.code,
        categoryId: payload.categoryId,
      });
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
            description: `Crear material: ${payload.name}`,
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

  const update = async (id, data, imageFile) => {
    const payload = {};
    const allowed = [
      "name",
      "code",
      "categoryId",
      "description",
      "defaultCommercialUnit",
      "sortOrder",
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        payload[key] =
          key === "sortOrder"
            ? parseInt(data[key], 10) || 0
            : typeof data[key] === "string"
              ? data[key].trim()
              : data[key];
      }
    }

    // Handle image replacement (requires online)
    if (imageFile) {
      try {
        if (data._oldImageFileId) {
          await deleteImage(data._oldImageFileId);
        }
        payload.referenceImageFileId = await uploadImage(imageFile);
      } catch (imgErr) {
        if (!isNetworkError(imgErr)) throw imgErr;
        // Skip image update when offline
      }
    } else if (data._removeImage && data._oldImageFileId) {
      try {
        await deleteImage(data._oldImageFileId);
        payload.referenceImageFileId = "";
      } catch (imgErr) {
        if (!isNetworkError(imgErr)) throw imgErr;
      }
    }

    payload.updatedBy = user.$id;

    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION, id, payload);
      await logAudit("material.update", id, { fields: Object.keys(payload) });
      await fetchItems();
    } catch (err) {
      if (isNetworkError(err)) {
        await addToQueue({
          collection: COLLECTION,
          action: "update",
          documentId: id,
          data: payload,
          meta: { module: "catalogos", description: `Editar material: ${id}` },
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
      await logAudit(newActive ? "material.activate" : "material.disable", id, {
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
            description: `${newActive ? "Activar" : "Desactivar"} material: ${id}`,
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

  /* ─── Init ─── */
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    categories,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    fetchItems,
    create,
    update,
    toggleActive,
    getImageUrl,
    getImageThumbnail,
  };
}
