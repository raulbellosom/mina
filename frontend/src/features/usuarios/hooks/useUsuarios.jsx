import { useState, useEffect, useCallback } from 'react';
import { databases, functions, DATABASE_ID } from '../../../shared/lib/appwrite';
import { Query, ID } from 'appwrite';
import { useAuth } from '../../auth/hooks/useAuth';

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
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'inactive'

    const logAudit = async (action, docId, details = {}) => {
        if (!user) return;
        try {
            await databases.createDocument(DATABASE_ID, 'audit_logs', ID.unique(), {
                action,
                collection: 'users_profile',
                docId,
                userId: user.$id,
                details: JSON.stringify(details)
            });
        } catch (err) {
            console.warn('Audit log failed:', err.message);
        }
    };

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const queries = [
                Query.orderDesc('$createdAt'),
                Query.limit(200)
            ];

            if (filterStatus === 'active') queries.push(Query.equal('active', true));
            if (filterStatus === 'inactive') queries.push(Query.equal('active', false));

            const res = await databases.listDocuments(DATABASE_ID, 'users_profile', queries);

            let docs = res.documents;

            // Filtro de búsqueda en cliente (nombre, email, código)
            if (search.trim()) {
                const q = search.trim().toLowerCase();
                docs = docs.filter(u =>
                    (u.name || '').toLowerCase().includes(q) ||
                    (u.email || '').toLowerCase().includes(q) ||
                    (u.employeeCode || '').toLowerCase().includes(q) ||
                    (u.firstName || '').toLowerCase().includes(q) ||
                    (u.lastName || '').toLowerCase().includes(q)
                );
            }

            setUsers(docs);
        } catch (err) {
            console.error('Error cargando usuarios:', err);
        } finally {
            setLoading(false);
        }
    }, [search, filterStatus]);

    /**
     * Crea un usuario vía Appwrite Function (server-side).
     * La función crea el Auth user, asigna label y crea el profile.
     */
    const createUser = async (data) => {
        const execution = await functions.createExecution(
            'create-user',
            JSON.stringify({ ...data, createdBy: user.$id }),
            false,        // synchronous
            '/',
            'POST',
            { 'Content-Type': 'application/json' }
        );

        const response = JSON.parse(execution.responseBody || '{}');
        if (!response.success) {
            throw new Error(response.error || 'Error al crear el usuario');
        }

        await fetchUsers();
        return response;
    };

    /**
     * Edita datos operativos del perfil (no toca Appwrite Auth).
     */
    const updateUser = async (id, data) => {
        const allowed = ['firstName', 'lastName', 'phone', 'employeeCode', 'notes', 'name'];
        const payload = {};
        for (const key of allowed) {
            if (data[key] !== undefined) payload[key] = data[key];
        }

        await databases.updateDocument(DATABASE_ID, 'users_profile', id, payload);
        await logAudit('user.update', id, { fields: Object.keys(payload) });
        await fetchUsers();
    };

    /**
     * Activa o desactiva lógicamente al usuario.
     * No borra — solo cambia active y status.
     */
    const toggleActive = async (id, currentActive) => {
        const newActive = !currentActive;
        const newStatus = newActive ? 'active' : 'inactive';

        await databases.updateDocument(DATABASE_ID, 'users_profile', id, {
            active: newActive,
            status: newStatus
        });

        await logAudit(newActive ? 'user.activate' : 'user.disable', id, { active: newActive });
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
        toggleActive
    };
}
