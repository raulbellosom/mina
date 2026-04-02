import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { ShieldOff } from 'lucide-react';

/**
 * Protege rutas requiriendo autenticación y, opcionalmente, un permiso específico.
 * Los permisos se evalúan solo por labels de Appwrite — sin queries a DB.
 *
 * Props:
 *   requiredPermission {string} — código de permiso requerido, ej: "users.view"
 */
export default function ProtectedRoute({ requiredPermission }) {
    const { user, loading } = useAuth();
    const { can } = usePermissions();

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Cargando sesión...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredPermission && !can(requiredPermission)) {
        return <AccessDenied />;
    }

    return <Outlet />;
}

function AccessDenied() {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-8">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 mb-4">
                <ShieldOff size={36} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-sm">
                No tienes permisos para acceder a esta sección. Contacta al administrador si crees que esto es un error.
            </p>
            <a href="/" className="mt-6 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Volver al inicio
            </a>
        </div>
    );
}
