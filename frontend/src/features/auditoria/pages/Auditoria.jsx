import { useEffect, useState, useMemo } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Calendar,
  User,
  FileText,
  AlertCircle,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuditoria } from "../hooks/useAuditoria";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import { useAuth } from "../../auth/hooks/useAuth";
import ExportButton from "../../../shared/components/ExportButton";

/* ─── Action category → color mapping ─── */
const ACTION_COLORS = {
  user: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
  },
  role: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
  },
  ticket: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
  },
  print: {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-700 dark:text-cyan-300",
  },
  bascula: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
  },
  exit: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
  },
  voucher: {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-700 dark:text-pink-300",
  },
  catalog: {
    bg: "bg-teal-100 dark:bg-teal-900/30",
    text: "text-teal-700 dark:text-teal-300",
  },
  counter_sales: {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-700 dark:text-indigo-300",
  },
};

const DEFAULT_COLOR = {
  bg: "bg-slate-100 dark:bg-slate-800",
  text: "text-slate-700 dark:text-slate-300",
};

function getActionColor(action) {
  if (!action) return DEFAULT_COLOR;
  const prefix = action.split(".")[0];
  return ACTION_COLORS[prefix] || DEFAULT_COLOR;
}

/* ─── Action Badge ─── */
function ActionBadge({ action }) {
  const color = getActionColor(action);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color.bg} ${color.text}`}
    >
      {action}
    </span>
  );
}

/* ─── Collection label mapping ─── */
const COLLECTION_LABELS = {
  users_profile: "Usuarios",
  roles: "Roles",
  role_permissions: "Permisos de rol",
  permissions_catalog: "Catálogo permisos",
  material_categories: "Categorías",
  materials: "Materiales",
  clients: "Clientes",
  drivers: "Choferes",
  trucks: "Camiones",
  plants: "Plantas",
  vouchers: "Vouchers",
  tickets: "Tickets",
  print_logs: "Impresiones",
  weight_logs: "Pesos",
  scan_logs: "Escaneos",
  counter_sales: "Ventas mostrador",
  audit_logs: "Auditoría",
};

function getCollectionLabel(col) {
  return COLLECTION_LABELS[col] || col;
}

/* ─── Detail Modal ─── */
function DetailModal({ log, open, onClose, userName }) {
  if (!log) return null;

  let detailsParsed = null;
  try {
    if (log.details) detailsParsed = JSON.parse(log.details);
  } catch {
    detailsParsed = log.details;
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-200 dark:border-zinc-700 max-h-[85vh] overflow-y-auto">
          <div className="p-6 space-y-4">
            <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye size={18} />
              Detalle del evento
            </Dialog.Title>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 dark:text-slate-400">
                  Fecha
                </span>
                <span className="col-span-2 text-slate-900 dark:text-white">
                  {new Date(log.$createdAt).toLocaleString("es-MX", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 dark:text-slate-400">
                  Acción
                </span>
                <span className="col-span-2">
                  <ActionBadge action={log.action} />
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 dark:text-slate-400">
                  Módulo
                </span>
                <span className="col-span-2 text-slate-900 dark:text-white">
                  {getCollectionLabel(log.collection)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 dark:text-slate-400">
                  ID Documento
                </span>
                <span className="col-span-2 text-slate-900 dark:text-white font-mono text-xs break-all">
                  {log.docId}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 dark:text-slate-400">
                  Usuario
                </span>
                <span className="col-span-2 text-slate-900 dark:text-white">
                  {userName || log.userId}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 dark:text-slate-400">
                  ID Usuario
                </span>
                <span className="col-span-2 text-slate-900 dark:text-white font-mono text-xs break-all">
                  {log.userId}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 dark:text-slate-400">
                  ID Evento
                </span>
                <span className="col-span-2 text-slate-900 dark:text-white font-mono text-xs break-all">
                  {log.$id}
                </span>
              </div>
            </div>

            {/* Details JSON */}
            {detailsParsed && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Detalles
                </h3>
                <pre className="bg-slate-50 dark:bg-zinc-800 rounded-lg p-3 text-xs text-slate-700 dark:text-slate-300 overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap break-words font-mono">
                  {typeof detailsParsed === "string"
                    ? detailsParsed
                    : JSON.stringify(detailsParsed, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 transition-colors">
                  Cerrar
                </button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ─── Filters Bar ─── */
function FiltersBar({
  filters,
  knownActions,
  knownCollections,
  onApply,
  onClear,
}) {
  const [local, setLocal] = useState({ ...filters });

  useEffect(() => {
    setLocal({ ...filters });
  }, [filters]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(local);
  };

  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Filter size={16} className="text-slate-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Filtros
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Action */}
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
            Acción
          </label>
          <select
            value={local.action}
            onChange={(e) => setLocal({ ...local, action: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white px-3 py-2"
          >
            <option value="">Todas</option>
            {knownActions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        {/* Collection */}
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
            Módulo
          </label>
          <select
            value={local.collection}
            onChange={(e) => setLocal({ ...local, collection: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white px-3 py-2"
          >
            <option value="">Todos</option>
            {knownCollections.map((c) => (
              <option key={c} value={c}>
                {getCollectionLabel(c)}
              </option>
            ))}
          </select>
        </div>
        {/* User ID */}
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
            ID Usuario
          </label>
          <input
            type="text"
            value={local.userId}
            onChange={(e) => setLocal({ ...local, userId: e.target.value })}
            placeholder="ID del usuario"
            className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white px-3 py-2"
          />
        </div>
        {/* Date from */}
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={local.dateFrom}
            onChange={(e) => setLocal({ ...local, dateFrom: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white px-3 py-2"
          />
        </div>
        {/* Date to */}
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={local.dateTo}
            onChange={(e) => setLocal({ ...local, dateTo: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white px-3 py-2"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Search size={14} />
          Buscar
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>
    </form>
  );
}

/* ─── Pagination ─── */
function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  PAGE_SIZE_OPTIONS,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <span>
          {total} resultado{total !== 1 ? "s" : ""}
        </span>
        <span>·</span>
        <span>
          Página {page} de {totalPages}
        </span>
        <span>·</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-2 py-1 text-slate-700 dark:text-slate-300"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s} por página
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {/* Page numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (page <= 3) {
            pageNum = i + 1;
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = page - 2 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                pageNum === page
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Auditoria() {
  const { can, loadingPermissions } = usePermissions();
  const { user } = useAuth();
  const {
    logs,
    loading,
    total,
    page,
    pageSize,
    filters,
    usersMap,
    knownActions,
    knownCollections,
    PAGE_SIZE_OPTIONS,
    fetchLogs,
    applyFilters,
    clearFilters,
    goToPage,
    changePageSize,
    exportCSV,
    loadFilterOptions,
  } = useAuditoria();

  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    if (!loadingPermissions && can("audit.view")) {
      fetchLogs();
      loadFilterOptions();
    }
  }, [loadingPermissions]);

  const handleExport = async () => {
    await exportCSV(user?.$id);
  };

  /* Permission gate */
  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!can("audit.view")) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Auditoría / Bitácoras
          </h1>
        </header>
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center">
          <AlertCircle size={40} className="mx-auto text-red-400 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            No tienes permisos para acceder a este módulo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Administración / Auditoría
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList size={24} />
            Auditoría y Bitácoras
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registro de eventos sensibles y trazabilidad de acciones del
            sistema.
          </p>
        </div>
        <ExportButton
          permission="audit.export"
          onExport={handleExport}
          disabled={loading}
          className="self-start"
        />
      </header>

      {/* Filters */}
      <FiltersBar
        filters={filters}
        knownActions={knownActions}
        knownCollections={knownCollections}
        onApply={applyFilters}
        onClear={clearFilters}
      />

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
              Cargando eventos...
            </span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <FileText
              size={36}
              className="mx-auto text-slate-300 dark:text-slate-700 mb-3"
            />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              No se encontraron eventos con los filtros actuales.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50">
                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                      Fecha
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                      Acción
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                      Módulo
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                      ID Documento
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                      Usuario
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.$id}
                      className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar
                            size={13}
                            className="text-slate-400 shrink-0"
                          />
                          {new Date(log.$createdAt).toLocaleString("es-MX", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {getCollectionLabel(log.collection)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 max-w-[180px] truncate">
                        {log.docId}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {usersMap[log.userId] || log.userId}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-zinc-800">
              {logs.map((log) => (
                <button
                  key={log.$id}
                  onClick={() => setSelectedLog(log)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <ActionBadge action={log.action} />
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(log.$createdAt).toLocaleString("es-MX", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    {getCollectionLabel(log.collection)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <User size={11} />
                    {usersMap[log.userId] || log.userId}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
          PAGE_SIZE_OPTIONS={PAGE_SIZE_OPTIONS}
        />
      )}

      {/* Detail modal */}
      <DetailModal
        log={selectedLog}
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        userName={selectedLog ? usersMap[selectedLog.userId] : ""}
      />
    </div>
  );
}
