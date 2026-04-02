import { useState, useEffect, useCallback } from "react";
import { databases, DATABASE_ID, storage } from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";

const COLLECTION = "materials";
const BUCKET = "material_images";

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
      await databases.createDocument(DATABASE_ID, "audit_logs", ID.unique(), {
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

  /* ─── Load categories for selectors ─── */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        "material_categories",
        [
          Query.equal("active", true),
          Query.orderAsc("sortOrder"),
          Query.limit(200),
        ],
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

      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION,
        queries,
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

  /* ─── CRUD ─── */
  const create = async (data, imageFile) => {
    let imageFileId = "";
    if (imageFile) {
      imageFileId = await uploadImage(imageFile);
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

    // Handle image replacement
    if (imageFile) {
      // Delete old image if exists
      if (data._oldImageFileId) {
        await deleteImage(data._oldImageFileId);
      }
      payload.referenceImageFileId = await uploadImage(imageFile);
    } else if (data._removeImage && data._oldImageFileId) {
      // User explicitly removed the image
      await deleteImage(data._oldImageFileId);
      payload.referenceImageFileId = "";
    }

    payload.updatedBy = user.$id;

    await databases.updateDocument(DATABASE_ID, COLLECTION, id, payload);
    await logAudit("material.update", id, { fields: Object.keys(payload) });
    await fetchItems();
  };

  const toggleActive = async (id, currentActive) => {
    const newActive = !currentActive;
    await databases.updateDocument(DATABASE_ID, COLLECTION, id, {
      active: newActive,
      updatedBy: user.$id,
    });
    await logAudit(newActive ? "material.activate" : "material.disable", id, {
      active: newActive,
    });
    await fetchItems();
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
