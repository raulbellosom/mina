import { useState, useEffect } from "react";
import {
  CloudOff,
  Trash2,
  RefreshCw,
  Loader2,
  WifiOff,
  Wifi,
  Scale,
  ShieldCheck,
  ShoppingBag,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { useSyncQueue } from "../../../shared/hooks/useSyncQueue";

const MODULE_ICONS = {
  bascula: Scale,
  validacion: ShieldCheck,
  mostrador: ShoppingBag,
};

const MODULE_LABELS = {
  bascula: "Báscula",
  validacion: "Validación de salida",
  mostrador: "Venta mostrador",
};

const STATUS_CONFIG = {
  pending: {
    label: "Pendiente",
    classes:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: Clock,
  },
  syncing: {
    label: "Sincronizando...",
    classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: RefreshCw,
  },
  synced: {
    label: "Sincronizado",
    classes:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle2,
  },
  error: {
    label: "Error",
    classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function OperationCard({ entry, onRemove, onRetry, retrying }) {
  const ModuleIcon = MODULE_ICONS[entry.meta?.module] || CloudOff;
  const moduleLabel = MODULE_LABELS[entry.meta?.module] || entry.collection;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
          <ModuleIcon
            size={16}
            className="text-slate-500 dark:text-slate-400"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {entry.meta?.description ||
                `${entry.action} en ${entry.collection}`}
            </span>
            <StatusBadge status={entry.status} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {moduleLabel} ·{" "}
            {new Date(entry.createdAt).toLocaleString("es-MX", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
          {entry.meta?.ticketNumber && (
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
              Ticket: {entry.meta.ticketNumber}
            </p>
          )}
          {entry.lastError && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 truncate">
              Error: {entry.lastError}
            </p>
          )}
        </div>
        <ChevronRight
          size={14}
          className={`text-slate-400 transition-transform shrink-0 mt-2 ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mt-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Datos de la operación
            </p>
            <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap break-words max-h-48">
              {JSON.stringify(entry.data, null, 2)}
            </pre>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <p className="text-xs text-slate-400 flex-1">
              ID: <span className="font-mono">{entry.id.slice(0, 8)}…</span> ·
              Intentos: {entry.attempts}
            </p>
            {["pending", "error"].includes(entry.status) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetry(entry.id);
                  }}
                  disabled={retrying}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={12} /> Reintentar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(entry.id);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={12} /> Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OperacionesPendientes() {
  const {
    entries,
    pendingCount,
    loading,
    syncing,
    syncProgress,
    refreshQueue,
    clearCompleted,
    remove,
    syncAll,
    syncOne,
    isOnline,
  } = useSyncQueue();
  const [filter, setFilter] = useState("all");
  const [retryingId, setRetryingId] = useState(null);

  const handleRetry = async (id) => {
    setRetryingId(id);
    await syncOne(id);
    setRetryingId(null);
  };

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  const filtered =
    filter === "all" ? entries : entries.filter((e) => e.status === filter);

  const counts = {
    all: entries.length,
    pending: entries.filter((e) => e.status === "pending").length,
    error: entries.filter((e) => e.status === "error").length,
    synced: entries.filter((e) => e.status === "synced").length,
  };

  const FILTER_OPTIONS = [
    { value: "all", label: "Todas" },
    { value: "pending", label: "Pendientes" },
    { value: "error", label: "Errores" },
    { value: "synced", label: "Sincronizadas" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Administración
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CloudOff size={24} className="text-orange-500" />
            Operaciones Pendientes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Operaciones registradas sin conexión, pendientes de sincronizar
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Connection status */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
              isOnline
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isOnline ? "En línea" : "Sin conexión"}
          </span>
          {pendingCount > 0 && isOnline && (
            <button
              onClick={syncAll}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {syncing
                ? `Sincronizando ${syncProgress.current}/${syncProgress.total}`
                : "Sincronizar todo"}
            </button>
          )}
          <button
            onClick={refreshQueue}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RefreshCw size={14} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total" count={counts.all} color="slate" />
        <SummaryCard label="Pendientes" count={counts.pending} color="amber" />
        <SummaryCard label="Errores" count={counts.error} color="red" />
        <SummaryCard
          label="Sincronizadas"
          count={counts.synced}
          color="green"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              filter === opt.value
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {opt.label} ({counts[opt.value]})
          </button>
        ))}
      </div>

      {/* Actions */}
      {counts.synced > 0 && (
        <div className="flex justify-end">
          <button
            onClick={clearCompleted}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 size={12} /> Limpiar sincronizadas
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2
            size={40}
            className="text-slate-300 dark:text-slate-700 mb-3"
          />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {entries.length === 0
              ? "No hay operaciones en cola"
              : "No hay operaciones con ese filtro"}
          </p>
          <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">
            Las operaciones creadas sin conexión aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <OperationCard
              key={entry.id}
              entry={entry}
              onRemove={remove}
              onRetry={handleRetry}
              retrying={retryingId === entry.id}
            />
          ))}
        </div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
        <AlertTriangle size={16} className="text-slate-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p>
            Las operaciones pendientes se guardan en el navegador y no se
            pierden al cerrar la página.
          </p>
          <p>
            La sincronización se ejecuta automáticamente al restaurar la
            conexión. También puede sincronizar manualmente con el botón
            "Sincronizar todo".
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, count, color }) {
  const colors = {
    slate:
      "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white",
    amber:
      "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
    green:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold mt-1">{count}</p>
    </div>
  );
}
