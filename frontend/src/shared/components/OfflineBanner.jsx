import { WifiOff, Wifi, CloudOff, RefreshCw, Loader2 } from "lucide-react";
import { useSyncQueue } from "../hooks/useSyncQueue";

/**
 * Banner global que muestra el estado de conectividad y operaciones pendientes.
 * Se monta en MainLayout, visible en toda la aplicación.
 */
export default function OfflineBanner() {
  const {
    isOnline,
    pendingCount,
    wasOffline,
    clearWasOffline,
    syncing,
    syncProgress,
    syncAll,
  } = useSyncQueue();

  // Offline banner
  if (!isOnline) {
    return (
      <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between gap-3 text-sm font-medium">
        <div className="flex items-center gap-2">
          <WifiOff size={16} className="shrink-0" />
          <span>Sin conexión — las operaciones se guardarán localmente</span>
        </div>
        {pendingCount > 0 && (
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
            {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    );
  }

  // Syncing in progress
  if (syncing) {
    return (
      <div className="bg-primary-500 text-white px-4 py-2 flex items-center justify-between gap-3 text-sm font-medium">
        <div className="flex items-center gap-2">
          <Loader2 size={16} className="shrink-0 animate-spin" />
          <span>
            Sincronizando {syncProgress.current} de {syncProgress.total}…
          </span>
        </div>
      </div>
    );
  }

  // Sync completed with results
  if (syncProgress.lastResult) {
    const r = syncProgress.lastResult;
    return (
      <div
        className={`${r.failed > 0 ? "bg-amber-500" : "bg-green-500"} text-white px-4 py-2 flex items-center justify-between gap-3 text-sm font-medium`}
      >
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="shrink-0" />
          <span>
            Sincronización completada: {r.synced} exitosa
            {r.synced !== 1 ? "s" : ""}
            {r.failed > 0 ? `, ${r.failed} con error` : ""}
          </span>
        </div>
        <button
          onClick={clearWasOffline}
          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors"
        >
          Cerrar
        </button>
      </div>
    );
  }

  // Reconnected with pending operations
  if (wasOffline && pendingCount > 0) {
    return (
      <div className="bg-primary-500 text-white px-4 py-2 flex items-center justify-between gap-3 text-sm font-medium">
        <div className="flex items-center gap-2">
          <Wifi size={16} className="shrink-0" />
          <span>
            Conexión restaurada — {pendingCount} operación
            {pendingCount !== 1 ? "es" : ""} pendiente
            {pendingCount !== 1 ? "s" : ""} de sincronizar
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={syncAll}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors font-semibold"
          >
            Sincronizar ahora
          </button>
          <button
            onClick={clearWasOffline}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Online with pending ops (from a previous session)
  if (pendingCount > 0) {
    return (
      <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-between gap-3 text-sm font-medium">
        <div className="flex items-center gap-2">
          <CloudOff size={16} className="shrink-0" />
          <span>
            {pendingCount} operación{pendingCount !== 1 ? "es" : ""} pendiente
            {pendingCount !== 1 ? "s" : ""} de sincronizar
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={syncAll}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors font-semibold"
          >
            Sincronizar
          </button>
          <a
            href="/operaciones-pendientes"
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors"
          >
            Ver detalle
          </a>
        </div>
      </div>
    );
  }

  return null;
}
