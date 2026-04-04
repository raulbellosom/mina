import { useState, useEffect, useCallback } from "react";
import {
  databases,
  functions,
  DATABASE_ID,
  APP_IDS,
} from "../../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  fetchWithCache,
  requireOnline,
} from "../../../shared/lib/catalogCache";

/**
 * Hook para gestión de usuarios internos.
 *
 * Operaciones:
 *   fetchUsers()            — lista profiles con búsqueda/filtro opcionales
 *   createUser(data)        — llama Function create-user (Auth + profile + audit)
 *   updateUser(id, data)    — actualiza users_profile + audit
 *   toggleActive(id, active)— activa/desactiva lógicamente + audit
 *   fetchRoles()            — lista roles disponibles para el selector
 */
export function useUsuarios() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'active' | 'inactive'

  const logAudit = async (action, docId, details = {}) => {
    if (!user) return;
    try {
      await databases.createDocument(
        DATABASE_ID,
        APP_IDS.collections.AUDIT_LOGS,
        ID.unique(),
        {
          action,
          collection: APP_IDS.collections.USERS_PROFILE,
          docId,
          userId: user.$id,
          details: JSON.stringify(details),
        },
      );
    } catch (err) {
      console.warn("Audit log failed:", err.message);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const queries = [Query.orderDesc("$createdAt"), Query.limit(200)];

      if (filterStatus === "active") queries.push(Query.equal("active", true));
      if (filterStatus === "inactive")
        queries.push(Query.equal("active", false));

      const cacheKey = `users_profile_${filterStatus}`;
      const res = await fetchWithCache(cacheKey, () =>
        databases.listDocuments(
          DATABASE_ID,
          APP_IDS.collections.USERS_PROFILE,
          queries,
        ),
      );

      let docs = res.documents;

      // Filtro de búsqueda en cliente (nombre, email, código)
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        docs = docs.filter(
          (u) =>
            (u.name || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            (u.employeeCode || "").toLowerCase().includes(q) ||
            (u.firstName || "").toLowerCase().includes(q) ||
            (u.lastName || "").toLowerCase().includes(q),
        );
      }

      setUsers(docs);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  /**
   * Crea un usuario vía Appwrite Function (server-side).
   * La función crea el Auth user, asigna label y crea el profile.
   */
  const createUser = async (data) => {
    requireOnline();
    const execution = await functions.createExecution(
      APP_IDS.functions.CREATE_USER,
      JSON.stringify({ ...data, createdBy: user.$id }),
      false, // synchronous
      "/",
      "POST",
      { "Content-Type": "application/json" },
    );

    const response = JSON.parse(execution.responseBody || "{}");
    if (!response.success) {
      throw new Error(response.error || "Error al crear el usuario");
    }

    await fetchUsers();
    return response;
  };

  /**
   * Edita datos operativos del perfil.
   * Si firstName o lastName cambian, sincroniza el nombre con Auth via Function.
   */
  const updateUser = async (id, data) => {
    requireOnline();
    const allowed = ["firstName", "lastName", "phone", "employeeCode", "notes"];
    const payload = {};
    for (const key of allowed) {
      if (data[key] !== undefined) payload[key] = data[key];
    }

    // Siempre recomputar name si firstName o lastName están presentes
    if (data.firstName !== undefined || data.lastName !== undefined) {
      const firstName = data.firstName || "";
      const lastName = data.lastName || "";
      payload.name = `${firstName} ${lastName}`.trim();

      // Sincronizar nombre con Appwrite Auth via server-side Function
      try {
        const execution = await functions.createExecution(
          APP_IDS.functions.SYNC_USER_NAME,
          JSON.stringify({ userId: id, firstName, lastName }),
          false,
          "/",
          "POST",
          { "Content-Type": "application/json" },
        );
        const syncResult = JSON.parse(execution.responseBody || "{}");
        if (!syncResult.success) {
          console.warn("sync-user-name warning:", syncResult.error);
        }
      } catch (syncErr) {
        console.warn("sync-user-name failed:", syncErr.message);
        // Aún así actualizar el profile localmente
        await databases.updateDocument(
          DATABASE_ID,
          APP_IDS.collections.USERS_PROFILE,
          id,
          payload,
        );
      }
    } else {
      await databases.updateDocument(
        DATABASE_ID,
        APP_IDS.collections.USERS_PROFILE,
        id,
        payload,
      );
    }

    await logAudit("user.update", id, { fields: Object.keys(payload) });
    await fetchUsers();
  };

  /**
   * Activa o desactiva lógicamente al usuario.
   * No borra — solo cambia active y status.
   */
  const toggleActive = async (id, currentActive) => {
    requireOnline();
    const newActive = !currentActive;
    const newStatus = newActive ? "active" : "inactive";

    await databases.updateDocument(
      DATABASE_ID,
      APP_IDS.collections.USERS_PROFILE,
      id,
      {
        active: newActive,
        status: newStatus,
      },
    );

    await logAudit(newActive ? "user.activate" : "user.disable", id, {
      active: newActive,
    });
    await fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    fetchUsers,
    createUser,
    updateUser,
    toggleActive,
  };
}
