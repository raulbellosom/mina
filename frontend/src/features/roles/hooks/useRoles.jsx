import { useState, useEffect, useCallback } from "react";
import { databases, DATABASE_ID, APP_IDS } from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";

/**
 * Hook para gestión de roles funcionales y permisos.
 *
 * Operaciones:
 *   fetchRoles()                — lista roles con búsqueda/filtro
 *   createRole(data)            — crea un rol nuevo
 *   updateRole(id, data)        — actualiza datos del rol
 *   toggleEnabled(id, enabled)  — habilita/deshabilita rol
 *   fetchPermissionsCatalog()   — carga catálogo completo de permisos
 *   fetchRolePermissions(roleId)— carga permisos asignados a un rol
 *   saveRolePermissions(roleId, codes) — sobreescribe permisos de un rol
 */
export function useRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Catálogo de permisos
  const [permissionsCatalog, setPermissionsCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Permisos asignados al rol seleccionado
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loadingRolePerms, setLoadingRolePerms] = useState(false);

  // Conteo de permisos por rol (roleId -> count)
  const [permCounts, setPermCounts] = useState({});

  const logAudit = async (action, docId, details = {}) => {
    if (!user) return;
    try {
      await databases.createDocument(DATABASE_ID, APP_IDS.collections.AUDIT_LOGS, ID.unique(), {
        action,
        collection: APP_IDS.collections.ROLES,
        docId,
        userId: user.$id,
        details: JSON.stringify(details),
      });
    } catch (err) {
      console.warn("Audit log failed:", err.message);
    }
  };

  // ─── Roles ──────────────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const queries = [Query.orderDesc("$createdAt"), Query.limit(100)];

      if (filterStatus === "enabled")
        queries.push(Query.equal("enabled", true));
      if (filterStatus === "disabled")
        queries.push(Query.equal("enabled", false));

      const res = await databases.listDocuments(DATABASE_ID, APP_IDS.collections.ROLES, queries);
      let docs = res.documents;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        docs = docs.filter(
          (r) =>
            (r.name || "").toLowerCase().includes(q) ||
            (r.code || "").toLowerCase().includes(q) ||
            (r.description || "").toLowerCase().includes(q),
        );
      }

      setRoles(docs);
    } catch (err) {
      console.error("Error cargando roles:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  const createRole = async (data) => {
    const payload = {
      name: data.name,
      code: data.code,
      description: data.description || "",
      enabled: true,
      isSystem: false,
      createdBy: user.$id,
    };

    const doc = await databases.createDocument(
      DATABASE_ID,
      APP_IDS.collections.ROLES,
      ID.unique(),
      payload,
    );
    await logAudit("role.create", doc.$id, {
      name: data.name,
      code: data.code,
    });
    await fetchRoles();
    return doc;
  };

  const updateRole = async (id, data) => {
    const allowed = ["name", "code", "description"];
    const payload = {};
    for (const key of allowed) {
      if (data[key] !== undefined) payload[key] = data[key];
    }

    await databases.updateDocument(DATABASE_ID, APP_IDS.collections.ROLES, id, payload);
    await logAudit("role.update", id, { fields: Object.keys(payload) });
    await fetchRoles();
  };

  const toggleEnabled = async (id, currentEnabled) => {
    const newEnabled = !currentEnabled;
    await databases.updateDocument(DATABASE_ID, APP_IDS.collections.ROLES, id, {
      enabled: newEnabled,
    });
    await logAudit(newEnabled ? "role.enable" : "role.disable", id, {
      enabled: newEnabled,
    });
    await fetchRoles();
  };

  // ─── Catálogo de permisos ───────────────────────────────────────
  const fetchPermissionsCatalog = useCallback(async () => {
    try {
      setLoadingCatalog(true);
      const all = [];
      let offset = 0;
      const batchSize = 100;
      while (true) {
        const res = await databases.listDocuments(
          DATABASE_ID,
          APP_IDS.collections.PERMISSIONS_CATALOG,
          [
            Query.equal("enabled", true),
            Query.orderAsc("module"),
            Query.limit(batchSize),
            Query.offset(offset),
          ],
        );
        all.push(...res.documents);
        if (res.documents.length < batchSize) break;
        offset += batchSize;
      }
      setPermissionsCatalog(all);
    } catch (err) {
      console.error("Error cargando catálogo de permisos:", err);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  // ─── Permisos de un rol ─────────────────────────────────────────
  const fetchRolePermissions = async (roleId) => {
    try {
      setLoadingRolePerms(true);
      const all = [];
      let offset = 0;
      const batchSize = 100;
      while (true) {
        const res = await databases.listDocuments(
          DATABASE_ID,
          APP_IDS.collections.ROLE_PERMISSIONS,
          [
            Query.equal("roleId", roleId),
            Query.equal("enabled", true),
            Query.limit(batchSize),
            Query.offset(offset),
          ],
        );
        all.push(...res.documents);
        if (res.documents.length < batchSize) break;
        offset += batchSize;
      }
      setRolePermissions(all.map((d) => d.permissionCode));
      return all.map((d) => d.permissionCode);
    } catch (err) {
      console.error("Error cargando permisos del rol:", err);
      setRolePermissions([]);
      return [];
    } finally {
      setLoadingRolePerms(false);
    }
  };

  /**
   * Guarda la lista de permisos de un rol.
   * Estrategia: obtener existentes, calcular diff, crear nuevos y eliminar removidos.
   */
  const saveRolePermissions = async (roleId, newCodes) => {
    // Obtener documentos existentes (habilitados y deshabilitados)
    const existingDocs = [];
    let offset = 0;
    const batchSize = 100;
    while (true) {
      const res = await databases.listDocuments(
        DATABASE_ID,
        APP_IDS.collections.ROLE_PERMISSIONS,
        [
          Query.equal("roleId", roleId),
          Query.limit(batchSize),
          Query.offset(offset),
        ],
      );
      existingDocs.push(...res.documents);
      if (res.documents.length < batchSize) break;
      offset += batchSize;
    }

    const existingByCode = {};
    for (const doc of existingDocs) {
      existingByCode[doc.permissionCode] = doc;
    }

    const newCodesSet = new Set(newCodes);
    const existingCodesSet = new Set(Object.keys(existingByCode));

    // Crear nuevos que no existen
    const toCreate = newCodes.filter((c) => !existingCodesSet.has(c));
    // Habilitar los que existían deshabilitados
    const toEnable = newCodes.filter(
      (c) => existingByCode[c] && !existingByCode[c].enabled,
    );
    // Deshabilitar los que ya no están seleccionados
    const toDisable = [...existingCodesSet].filter(
      (c) => !newCodesSet.has(c) && existingByCode[c].enabled,
    );

    const promises = [];

    for (const code of toCreate) {
      promises.push(
        databases.createDocument(DATABASE_ID, APP_IDS.collections.ROLE_PERMISSIONS, ID.unique(), {
          roleId,
          permissionCode: code,
          enabled: true,
        }),
      );
    }

    for (const code of toEnable) {
      promises.push(
        databases.updateDocument(
          DATABASE_ID,
          APP_IDS.collections.ROLE_PERMISSIONS,
          existingByCode[code].$id,
          {
            enabled: true,
          },
        ),
      );
    }

    for (const code of toDisable) {
      promises.push(
        databases.updateDocument(
          DATABASE_ID,
          APP_IDS.collections.ROLE_PERMISSIONS,
          existingByCode[code].$id,
          {
            enabled: false,
          },
        ),
      );
    }

    await Promise.all(promises);

    await logAudit("role.permissions_update", roleId, {
      added: toCreate.length + toEnable.length,
      removed: toDisable.length,
      total: newCodes.length,
    });

    setRolePermissions(newCodes);
    // Re-cargar conteos
    await loadPermCounts();
  };

  // ─── Conteo de permisos por rol ─────────────────────────────────
  const loadPermCounts = useCallback(async () => {
    try {
      const all = [];
      let offset = 0;
      const batchSize = 100;
      while (true) {
        const res = await databases.listDocuments(
          DATABASE_ID,
          APP_IDS.collections.ROLE_PERMISSIONS,
          [
            Query.equal("enabled", true),
            Query.limit(batchSize),
            Query.offset(offset),
          ],
        );
        all.push(...res.documents);
        if (res.documents.length < batchSize) break;
        offset += batchSize;
      }

      const counts = {};
      for (const doc of all) {
        counts[doc.roleId] = (counts[doc.roleId] || 0) + 1;
      }
      setPermCounts(counts);
    } catch (err) {
      console.warn("Error cargando conteo de permisos:", err.message);
    }
  }, []);

  // ─── Carga inicial ──────────────────────────────────────────────
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);
  useEffect(() => {
    fetchPermissionsCatalog();
  }, [fetchPermissionsCatalog]);
  useEffect(() => {
    loadPermCounts();
  }, [loadPermCounts]);

  return {
    // Roles
    roles,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    fetchRoles,
    createRole,
    updateRole,
    toggleEnabled,
    // Catálogo de permisos
    permissionsCatalog,
    loadingCatalog,
    // Permisos del rol seleccionado
    rolePermissions,
    loadingRolePerms,
    fetchRolePermissions,
    saveRolePermissions,
    // Conteo
    permCounts,
  };
}
