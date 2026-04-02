import { useMemo } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { PERMISSIONS_BY_LABEL } from '../config/permissions-config';

/**
 * Permisos basados exclusivamente en labels de Appwrite Auth.
 *
 * Jerarquía:
 *   owner, root  → bypass total (can() siempre true, sin DB)
 *   admin        → permisos según PERMISSIONS_BY_LABEL.admin
 *   operador     → permisos según PERMISSIONS_BY_LABEL.operador
 *   capturista   → permisos según PERMISSIONS_BY_LABEL.capturista
 *   pending      → sin acceso
 *
 * Sin queries a base de datos. Sin role_permissions. Solo labels.
 */
export function usePermissions() {
    const { user } = useAuth();

    const role = useMemo(() => {
        if (!user) return 'pending';
        const labels = user.labels || [];
        if (labels.includes('owner'))      return 'owner';
        if (labels.includes('root'))       return 'root';
        if (labels.includes('admin'))      return 'admin';
        if (labels.includes('operador'))   return 'operador';
        if (labels.includes('capturista')) return 'capturista';
        if (labels.includes('user'))       return 'operador'; // legacy
        return 'pending';
    }, [user]);

    const permissions = useMemo(() => {
        return PERMISSIONS_BY_LABEL[role] || [];
    }, [role]);

    const can = (code) => {
        if (!code) return true;
        if (role === 'owner' || role === 'root') return true;
        if (role === 'pending') return false;
        return permissions.includes(code);
    };

    return { can, permissions, role, loadingPermissions: false };
}
