import { useState, useEffect, useMemo } from 'react';
import { databases, DATABASE_ID } from '../lib/appwrite';
import { Query } from 'appwrite';
import { useAuth } from '../../features/auth/hooks/useAuth';

/**
 * Evalúa los permisos del usuario autenticado.
 *
 * Lógica de evaluación:
 *   owner  → acceso total, can() siempre true
 *   admin  → carga role_permissions por roleId del perfil
 *   user   → carga role_permissions por roleId del perfil
 *   pending → sin permisos, can() siempre false
 *
 * Uso:
 *   const { can, loadingPermissions } = usePermissions();
 *   if (can('users.create')) { ... }
 */
export function usePermissions() {
    const { user, profile } = useAuth();
    const [permissions, setPermissions] = useState([]);
    const [loadingPermissions, setLoadingPermissions] = useState(true);

    const role = useMemo(() => {
        if (!user) return 'pending';
        const labels = user.labels || [];
        if (labels.includes('owner')) return 'owner';
        if (labels.includes('admin')) return 'admin';
        if (labels.includes('user')) return 'user';
        return 'pending';
    }, [user]);

    useEffect(() => {
        // owner siempre tiene acceso total — no necesitamos cargar nada
        if (role === 'owner') {
            setLoadingPermissions(false);
            return;
        }

        // pending no tiene acceso
        if (role === 'pending' || !profile?.roleId) {
            setPermissions([]);
            setLoadingPermissions(false);
            return;
        }

        // admin y user: cargar permisos asignados al rol funcional
        const loadPermissions = async () => {
            try {
                setLoadingPermissions(true);
                const res = await databases.listDocuments(
                    DATABASE_ID,
                    'role_permissions',
                    [
                        Query.equal('roleId', profile.roleId),
                        Query.equal('enabled', true),
                        Query.limit(200)
                    ]
                );
                setPermissions(res.documents.map(doc => doc.permissionCode));
            } catch (err) {
                console.error('Error cargando permisos:', err);
                setPermissions([]);
            } finally {
                setLoadingPermissions(false);
            }
        };

        loadPermissions();
    }, [role, profile?.roleId]);

    /**
     * Verifica si el usuario puede ejecutar una acción.
     * @param {string} code - Código del permiso: 'users.create', 'tickets.print', etc.
     * @returns {boolean}
     */
    const can = (code) => {
        if (!code) return true;
        if (role === 'owner') return true;
        if (role === 'pending') return false;
        return permissions.includes(code);
    };

    return { can, permissions, loadingPermissions };
}
