import { useEffect, useState } from "react";
import {
  BarChart2,
  Loader2,
  Download,
  Search,
  X,
  FileText,
  AlertCircle,
  Users,
  Package,
  Truck,
  MapPin,
  UserCheck,
  ShoppingCart,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { useReportes } from "../hooks/useReportes";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import { useAuth } from "../../auth/hooks/useAuth";
import ExportButton from "../../../shared/components/ExportButton";

/* ─── Report type definitions ─── */
const REPORT_TYPES = [
  {
    key: "operations",
    label: "Operaciones",
    icon: FileText,
    desc: "Tickets por periodo",
  },
  {
    key: "byClient",
    label: "Por Cliente",
    icon: Users,
    desc: "Agrupado por cliente",
  },
  {
    key: "byMaterial",
    label: "Por Material",
    icon: Package,
    desc: "Agrupado por material",
  },
  {
    key: "byDriver",
    label: "Por Chofer",
    icon: UserCheck,
    desc: "Agrupado por chofer",
  },
  {
    key: "byTruck",
    label: "Por Camión",
    icon: Truck,
    desc: "Agrupado por camión",
  },
  {
    key: "byPlant",
    label: "Por Planta",
    icon: MapPin,
    desc: "Agrupado por planta",
  },
  {
    key: "byType",
    label: "Por Tipo Venta",
    icon: ShoppingCart,
    desc: "Voucher vs mostrador",
  },
];

const STATUS_LABELS = {
  generated: "Generado",
  ready_to_print: "Listo imprimir",
  printed: "Impreso",
  loading: "En carga",
  loaded: "Cargado",
  pending_exit_validation: "Pend. salida",
  completed: "Completado",
  cancelled: "Cancelado",
  rejected: "Rechazado",
  blocked: "Bloqueado",
};

const STATUS_COLORS = {
  completed:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  rejected: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  pending_exit_validation:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  loading:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  printed: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
};

const DEFAULT_STATUS_COLOR =
  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || DEFAULT_STATUS_COLOR;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function fmt(n) {
  return (n || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ─── Filters Panel ─── */
function FiltersPanel({
  filters,
  setFilters,
  catalogs,
  reportType,
  onGenerate,
  onClear,
}) {
  const showClient = reportType === "operations";
  const showMaterial = reportType === "operations";
  const showStatus = reportType === "operations";
  const showPlant = reportType === "operations" || reportType === "byPlant";
  const showType = reportType === "operations" || reportType === "byType";

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate();
  };

  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Date from */}
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters({ ...filters, dateFrom: e.target.value })
            }
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
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white px-3 py-2"
          />
        </div>
        {/* Client */}
        {showClient && (
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
              Cliente
            </label>
            <select
              value={filters.clientId}
              onChange={(e) =>
                setFilters({ ...filters, clientId: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white px-3 py-2"
            >
              <option value="">Todos</option>
              {catalogs.clients.map((c) => (
                <option key={c.$id} value={c.$id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Material */}
        {showMaterial && (
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
              Material
            </label>
            <select
              value={filters.materialId}
              onChange={(e) =>
                setFilters({ ...filters, materialId: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white px-3 py-2"
            >
              <option value="">Todos</option>
              {catalogs.materials.map((m) => (
                <option key={m.$id} value={m.$id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Status */}
        {showStatus && (
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white px-3 py-2"
            >
              <option value="">Todos</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Plant */}
        {showPlant && (
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
              Planta
            </label>
            <select
              value={filters.plantId}
              onChange={(e) =>
                setFilters({ ...filters, plantId: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white px-3 py-2"
            >
              <option value="">Todas</option>
              {catalogs.plants.map((p) => (
                <option key={p.$id} value={p.$id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Type */}
        {showType && (
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
              Tipo Venta
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="voucher">Voucher</option>
              <option value="counter_sale">Mostrador</option>
            </select>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors"
        >
          <Search size={14} />
          Generar Reporte
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

/* ─── Totals Bar ─── */
function TotalsBar({ totals, type }) {
  if (!totals) return null;

  const items = [];
  if (totals.total !== undefined)
    items.push({ label: "Total Operaciones", value: totals.total });
  if (totals.totalOps !== undefined)
    items.push({ label: "Total Operaciones", value: totals.totalOps });
  if (totals.completed !== undefined)
    items.push({ label: "Completadas", value: totals.completed });
  if (totals.cancelled !== undefined)
    items.push({ label: "Canceladas", value: totals.cancelled });
  if (totals.rejected !== undefined)
    items.push({ label: "Rechazadas", value: totals.rejected });
  if (totals.totalQty !== undefined)
    items.push({ label: "Cant. Comercial Total", value: fmt(totals.totalQty) });
  if (totals.totalNet !== undefined)
    items.push({ label: "Peso Neto Total", value: fmt(totals.totalNet) });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-center"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {item.label}
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─── Report Tables ─── */
function OperationsTable({ rows, gc, gd, gt, gm, gp }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50">
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Folio
            </th>
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Fecha
            </th>
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Cliente
            </th>
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Chofer
            </th>
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Camión
            </th>
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Material
            </th>
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Planta
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Cant.
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Peso Neto
            </th>
            <th className="text-center px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Estado
            </th>
            <th className="text-center px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Tipo
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr
              key={t.$id}
              className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors"
            >
              <td className="px-3 py-2 font-mono text-xs text-slate-700 dark:text-slate-300">
                {t.ticketNumber}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                {new Date(t.$createdAt).toLocaleDateString("es-MX", {
                  month: "short",
                  day: "numeric",
                  year: "2-digit",
                })}
              </td>
              <td className="px-3 py-2 text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                {gc(t.clientId)}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-400 max-w-[100px] truncate">
                {gd(t.driverId)}
              </td>
              <td className="px-3 py-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                {gt(t.truckId)}
              </td>
              <td className="px-3 py-2 text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                {gm(t.materialId)}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-400 max-w-[100px] truncate">
                {gp(t.plantId)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {fmt(t.commercialQty)} {t.commercialUnit || ""}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {t.netWeight ? fmt(t.netWeight) : "—"}
              </td>
              <td className="px-3 py-2 text-center">
                <StatusBadge status={t.status} />
              </td>
              <td className="px-3 py-2 text-center text-xs text-slate-500 dark:text-slate-400">
                {t.type === "voucher"
                  ? "Voucher"
                  : t.type === "counter_sale"
                    ? "Mostrador"
                    : t.type}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ByClientTable({ rows, gc, gm }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50">
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Cliente
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Operaciones
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Cant. Comercial
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Peso Neto
            </th>
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Materiales
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors"
            >
              <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">
                {gc(r.clientId)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {r.ops}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {fmt(r.qty)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {fmt(r.net)}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-xs">
                {r.materials.map((id) => gm(id)).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ByMaterialTable({ rows, gm, gc }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50">
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Material
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Operaciones
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Cant. Comercial
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Peso Neto
            </th>
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Clientes
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors"
            >
              <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">
                {gm(r.materialId)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {r.ops}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {fmt(r.qty)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {fmt(r.net)}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-xs">
                {r.clients.map((id) => gc(id)).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ByDriverTable({ rows, gd, gt }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50">
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Chofer
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Operaciones
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Cant. Total
            </th>
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Camiones usados
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors"
            >
              <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">
                {gd(r.driverId)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {r.ops}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {fmt(r.qty)}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-xs">
                {r.trucks.map((id) => gt(id)).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ByTruckTable({ rows, gt, gd, gm }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50">
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Camión
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Operaciones
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Cant. Total
            </th>
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Choferes
            </th>
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Materiales
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors"
            >
              <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium font-mono">
                {gt(r.truckId)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {r.ops}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {fmt(r.qty)}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-xs">
                {r.drivers.map((id) => gd(id)).join(", ")}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-xs">
                {r.materials.map((id) => gm(id)).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ByPlantTable({ rows, gp, gm }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50">
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Planta
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Operaciones
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Cant. Total
            </th>
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Materiales despachados
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors"
            >
              <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">
                {gp(r.plantId)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {r.ops}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {fmt(r.qty)}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-xs">
                {r.materials.map((id) => gm(id)).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ByTypeTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50">
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Tipo de Venta
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Operaciones
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              %
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Cant. Comercial
            </th>
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">
              Peso Neto
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors"
            >
              <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">
                {r.label}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {r.count}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-600 dark:text-slate-400">
                {r.pct}%
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {fmt(r.qty)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                {fmt(r.net)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Report Table Renderer ─── */
function ReportTable({ data, resolvers }) {
  if (!data || !data.rows) return null;
  const {
    getClientName: gc,
    getDriverName: gd,
    getTruckPlate: gt,
    getMaterialName: gm,
    getPlantName: gp,
  } = resolvers;

  switch (data.type) {
    case "operations":
      return (
        <OperationsTable
          rows={data.rows}
          gc={gc}
          gd={gd}
          gt={gt}
          gm={gm}
          gp={gp}
        />
      );
    case "byClient":
      return <ByClientTable rows={data.rows} gc={gc} gm={gm} />;
    case "byMaterial":
      return <ByMaterialTable rows={data.rows} gm={gm} gc={gc} />;
    case "byDriver":
      return <ByDriverTable rows={data.rows} gd={gd} gt={gt} />;
    case "byTruck":
      return <ByTruckTable rows={data.rows} gt={gt} gd={gd} gm={gm} />;
    case "byPlant":
      return <ByPlantTable rows={data.rows} gp={gp} gm={gm} />;
    case "byType":
      return <ByTypeTable rows={data.rows} />;
    default:
      return null;
  }
}

/* ─── Main Page ─── */
export default function Reportes() {
  const { can, loadingPermissions } = usePermissions();
  const { user } = useAuth();
  const {
    loading,
    data,
    reportType,
    filters,
    catalogs,
    setFilters,
    setReportType,
    loadCatalogs,
    generateReport,
    exportCSV,
    getClientName,
    getDriverName,
    getTruckPlate,
    getMaterialName,
    getPlantName,
  } = useReportes();

  useEffect(() => {
    if (!loadingPermissions && can("reports.view")) {
      loadCatalogs();
    }
  }, [loadingPermissions]);

  const handleGenerate = () => {
    generateReport(reportType, filters);
  };

  const handleClear = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      clientId: "",
      materialId: "",
      status: "",
      plantId: "",
      type: "",
    });
  };

  const handleExport = async () => {
    if (!data) return;
    const resolvers = {
      getClientName,
      getDriverName,
      getTruckPlate,
      getMaterialName,
      getPlantName,
      userId: user?.$id,
    };
    await exportCSV(data, resolvers);
  };

  /* Permission gate */
  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-primary-600" />
      </div>
    );
  }

  if (!can("reports.view")) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 p-4 sm:p-6 lg:p-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reportes
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
            Administración / Reportes
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 size={24} />
            Reportes
          </h1>
        </div>
        {data?.rows?.length > 0 && (
          <ExportButton
            permission="reports.export"
            onExport={handleExport}
            className="self-start"
          />
        )}
      </header>

      {/* Report type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {REPORT_TYPES.map((rt) => {
          const Icon = rt.icon;
          const isActive = reportType === rt.key;
          return (
            <button
              key={rt.key}
              onClick={() => setReportType(rt.key)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm transition-all ${
                isActive
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm"
                  : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-zinc-700"
              }`}
            >
              <Icon size={18} />
              <span className="font-medium text-xs sm:text-sm">{rt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <FiltersPanel
        filters={filters}
        setFilters={setFilters}
        catalogs={catalogs}
        reportType={reportType}
        onGenerate={handleGenerate}
        onClear={handleClear}
      />

      {/* Results */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary-600" />
          <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
            Generando reporte...
          </span>
        </div>
      ) : data ? (
        <>
          {/* Truncation warning */}
          {data.truncated && (
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
              ⚠️ El reporte está limitado a {data.maxRows?.toLocaleString()}{" "}
              registros. Ajusta los filtros de fecha o categoría para obtener
              datos más específicos.
            </div>
          )}

          {/* Totals */}
          <TotalsBar totals={data.totals} type={data.type} />

          {/* Table */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            {data.rows.length === 0 ? (
              <div className="py-16 text-center">
                <FileText
                  size={36}
                  className="mx-auto text-slate-300 dark:text-slate-700 mb-3"
                />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  No se encontraron operaciones con los filtros seleccionados.
                </p>
              </div>
            ) : (
              <ReportTable
                data={data}
                resolvers={{
                  getClientName,
                  getDriverName,
                  getTruckPlate,
                  getMaterialName,
                  getPlantName,
                }}
              />
            )}
          </div>

          {/* Row count */}
          {data.rows.length > 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-right">
              {data.rows.length} fila{data.rows.length !== 1 ? "s" : ""}
            </p>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-16 text-center">
          <Calendar
            size={36}
            className="mx-auto text-slate-300 dark:text-slate-700 mb-3"
          />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Selecciona un tipo de reporte y presiona "Generar Reporte" para ver
            resultados.
          </p>
        </div>
      )}
    </div>
  );
}
