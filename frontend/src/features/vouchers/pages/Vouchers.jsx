import { useState, useMemo } from "react";
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Pencil,
  Eye,
  Ban,
  ArrowRightCircle,
  Loader2,
  ShieldAlert,
  X,
  AlertTriangle,
  FileText,
  Truck,
  User,
  MapPin,
  Package,
  TicketPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import {
  useVouchers,
  VOUCHER_STATUSES,
  EDITABLE_STATUSES,
  CANCELLABLE_STATUSES,
} from "../hooks/useVouchers";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import { useTickets } from "../../tickets/hooks/useTickets";
import VoucherForm from "../components/VoucherForm";

const TICKET_GENERATABLE_STATUSES = ["issued", "ready_for_ticket"];

/* ─── Status badges ─── */
const STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  issued: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ready_for_ticket:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  consumed:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  blocked:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const UNIT_LABELS = {
  viaje: "Viaje",
  tonelada: "Ton",
  m3: "m³",
  kg: "kg",
  pieza: "Pza",
};

export default function Vouchers() {
  const { can } = usePermissions();
  const navigate = useNavigate();
  const {
    items,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    clients,
    drivers,
    trucks,
    materials,
    plants,
    create,
    update,
    cancel,
    issue,
    fetchItems,
  } = useVouchers();
  const { generateFromVoucher } = useTickets();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [generating, setGenerating] = useState(null);

  /* ─── Lookup maps ─── */
  const clientMap = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.$id, c])),
    [clients],
  );
  const driverMap = useMemo(
    () => Object.fromEntries(drivers.map((d) => [d.$id, d])),
    [drivers],
  );
  const truckMap = useMemo(
    () => Object.fromEntries(trucks.map((t) => [t.$id, t])),
    [trucks],
  );
  const materialMap = useMemo(
    () => Object.fromEntries(materials.map((m) => [m.$id, m])),
    [materials],
  );
  const plantMap = useMemo(
    () => Object.fromEntries(plants.map((p) => [p.$id, p])),
    [plants],
  );

  /* ─── Permission guard ─── */
  if (!can("vouchers.view")) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldAlert
          size={36}
          className="text-slate-300 dark:text-slate-700 mb-3"
        />
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          No tienes permiso para ver este módulo.
        </p>
      </div>
    );
  }

  /* ─── Handlers ─── */
  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (v) => {
    setEditing(v);
    setFormOpen(true);
  };
  const handleSubmit = async (data) => {
    if (editing) {
      await update(editing.$id, data, editing.status);
    } else {
      await create(data);
    }
  };
  const handleCancel = async () => {
    if (!cancelDialog) return;
    await cancel(cancelDialog.$id, cancelDialog.status, cancelReason);
    setCancelDialog(null);
    setCancelReason("");
    if (detailItem?.$id === cancelDialog.$id) setDetailItem(null);
  };
  const handleIssue = async (v) => {
    await issue(v.$id);
    if (detailItem?.$id === v.$id)
      setDetailItem((prev) => ({ ...prev, status: "issued" }));
  };
  const handleGenerateTicket = async (v) => {
    try {
      setGenerating(v.$id);
      await generateFromVoucher(v);
      await fetchItems();
      setDetailItem(null);
      navigate("/tickets");
    } catch (err) {
      alert(err.message || "Error al generar ticket");
    } finally {
      setGenerating(null);
    }
  };

  /* ─── Resolve helper ─── */
  const resolveName = (map, id, field = "name") => map[id]?.[field] || "—";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Vouchers / Referencias Prepago
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
            Registro y gestión de autorizaciones comerciales previas a la
            operación.
          </p>
        </header>
        {can("vouchers.create") && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 text-sm font-medium transition-colors shrink-0"
          >
            <Plus size={16} /> Nuevo voucher
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por folio interno o referencia externa..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
          >
            <option value="all">Todos los estados</option>
            {Object.entries(VOUCHER_STATUSES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-semibold">Folio</th>
                <th className="px-4 sm:px-6 py-3 font-semibold">Cliente</th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden md:table-cell">
                  Material
                </th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden lg:table-cell">
                  Planta
                </th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden md:table-cell">
                  Cantidad
                </th>
                <th className="px-4 sm:px-6 py-3 font-semibold">Estado</th>
                <th className="px-4 sm:px-6 py-3 font-semibold text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                    Cargando vouchers...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    <Ticket className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    {search
                      ? "Sin resultados para la búsqueda."
                      : "No hay vouchers registrados."}
                  </td>
                </tr>
              ) : (
                items.map((v) => (
                  <tr
                    key={v.$id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    {/* Folio */}
                    <td className="px-4 sm:px-6 py-3">
                      <div className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
                        {v.internalFolio}
                      </div>
                      {v.externalReference && (
                        <div className="text-xs text-slate-400 truncate max-w-[140px]">
                          Ref: {v.externalReference}
                        </div>
                      )}
                    </td>
                    {/* Cliente */}
                    <td className="px-4 sm:px-6 py-3">
                      <div className="text-slate-900 dark:text-slate-100 truncate max-w-[160px]">
                        {resolveName(clientMap, v.clientId)}
                      </div>
                    </td>
                    {/* Material */}
                    <td className="px-4 sm:px-6 py-3 hidden md:table-cell">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px] inline-block">
                        {resolveName(materialMap, v.materialId)}
                      </span>
                    </td>
                    {/* Planta */}
                    <td className="px-4 sm:px-6 py-3 hidden lg:table-cell">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px] inline-block">
                        {resolveName(plantMap, v.plantId)}
                      </span>
                    </td>
                    {/* Cantidad */}
                    <td className="px-4 sm:px-6 py-3 hidden md:table-cell">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {v.commercialQty}
                      </span>{" "}
                      <span className="text-xs text-slate-400">
                        {UNIT_LABELS[v.commercialUnit] || v.commercialUnit}
                      </span>
                    </td>
                    {/* Estado */}
                    <td className="px-4 sm:px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[v.status] || STATUS_COLORS.draft}`}
                      >
                        {VOUCHER_STATUSES[v.status]?.label || v.status}
                      </span>
                    </td>
                    {/* Acciones */}
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Ver detalle"
                          onClick={() => setDetailItem(v)}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600"
                        >
                          <Eye size={15} />
                        </button>
                        {can("vouchers.update") &&
                          EDITABLE_STATUSES.includes(v.status) && (
                            <button
                              title="Editar"
                              onClick={() => openEdit(v)}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-600"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                        {can("vouchers.update") && v.status === "draft" && (
                          <button
                            title="Emitir voucher"
                            onClick={() => handleIssue(v)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600"
                          >
                            <ArrowRightCircle size={15} />
                          </button>
                        )}
                        {can("tickets.generate") &&
                          TICKET_GENERATABLE_STATUSES.includes(v.status) && (
                            <button
                              title="Generar ticket"
                              disabled={generating === v.$id}
                              onClick={() => handleGenerateTicket(v)}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 disabled:opacity-50"
                            >
                              <TicketPlus size={15} />
                            </button>
                          )}
                        {can("vouchers.cancel") &&
                          CANCELLABLE_STATUSES.includes(v.status) && (
                            <button
                              title="Cancelar voucher"
                              onClick={() => {
                                setCancelDialog(v);
                                setCancelReason("");
                              }}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-600"
                            >
                              <Ban size={15} />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal form */}
      <VoucherForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSubmit={handleSubmit}
        clients={clients}
        drivers={drivers}
        trucks={trucks}
        materials={materials}
        plants={plants}
      />

      {/* Detail panel */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDetailItem(null)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Detalle de voucher
              </h2>
              <button
                onClick={() => setDetailItem(null)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Estado + Folio */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[detailItem.status] || STATUS_COLORS.draft}`}
                >
                  {VOUCHER_STATUSES[detailItem.status]?.label ||
                    detailItem.status}
                </span>
                <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {detailItem.internalFolio}
                </span>
              </div>

              {detailItem.externalReference && (
                <DetailRow
                  icon={FileText}
                  label="Referencia externa"
                  value={detailItem.externalReference}
                />
              )}

              <DetailRow
                icon={User}
                label="Cliente"
                value={resolveName(clientMap, detailItem.clientId)}
              />
              <DetailRow
                icon={Package}
                label="Material"
                value={resolveName(materialMap, detailItem.materialId)}
              />
              <DetailRow
                icon={MapPin}
                label="Planta / Origen"
                value={resolveName(plantMap, detailItem.plantId)}
              />

              {detailItem.driverId && (
                <DetailRow
                  icon={User}
                  label="Chofer"
                  value={resolveName(
                    driverMap,
                    detailItem.driverId,
                    "fullName",
                  )}
                />
              )}
              {detailItem.truckId && (
                <DetailRow
                  icon={Truck}
                  label="Camión"
                  value={
                    truckMap[detailItem.truckId]
                      ? `${truckMap[detailItem.truckId].plates}${truckMap[detailItem.truckId].alias ? ` — ${truckMap[detailItem.truckId].alias}` : ""}`
                      : "—"
                  }
                />
              )}

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <span className="text-xs text-slate-500 uppercase tracking-wider">
                  Cantidad comercial
                </span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {detailItem.commercialQty}{" "}
                  <span className="text-base font-normal text-slate-400">
                    {UNIT_LABELS[detailItem.commercialUnit] ||
                      detailItem.commercialUnit}
                  </span>
                </p>
                {detailItem.usedQty > 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    Usado: {detailItem.usedQty}{" "}
                    {UNIT_LABELS[detailItem.commercialUnit] ||
                      detailItem.commercialUnit}
                  </p>
                )}
              </div>

              {detailItem.notes && (
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">
                    Observaciones
                  </span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">
                    {detailItem.notes}
                  </p>
                </div>
              )}

              {detailItem.cancelReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <span className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wider">
                    Motivo de cancelación
                  </span>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {detailItem.cancelReason}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                <p>
                  Creado:{" "}
                  {new Date(detailItem.$createdAt).toLocaleString("es-MX")}
                </p>
                {detailItem.$updatedAt !== detailItem.$createdAt && (
                  <p>
                    Actualizado:{" "}
                    {new Date(detailItem.$updatedAt).toLocaleString("es-MX")}
                  </p>
                )}
              </div>

              {/* Detail actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {can("vouchers.update") &&
                  EDITABLE_STATUSES.includes(detailItem.status) && (
                    <button
                      onClick={() => {
                        openEdit(detailItem);
                        setDetailItem(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Pencil size={14} /> Editar
                    </button>
                  )}
                {can("vouchers.update") && detailItem.status === "draft" && (
                  <button
                    onClick={() => handleIssue(detailItem)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                  >
                    <ArrowRightCircle size={14} /> Emitir
                  </button>
                )}
                {can("tickets.generate") &&
                  TICKET_GENERATABLE_STATUSES.includes(detailItem.status) && (
                    <button
                      disabled={generating === detailItem.$id}
                      onClick={() => handleGenerateTicket(detailItem)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <TicketPlus size={14} /> Generar ticket
                    </button>
                  )}
                {can("vouchers.cancel") &&
                  CANCELLABLE_STATUSES.includes(detailItem.status) && (
                    <button
                      onClick={() => {
                        setCancelDialog(detailItem);
                        setCancelReason("");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-300 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Ban size={14} /> Cancelar
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirmation dialog */}
      <Dialog.Root
        open={Boolean(cancelDialog)}
        onOpenChange={(open) => {
          if (!open) setCancelDialog(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle
                  size={20}
                  className="text-red-600 dark:text-red-400"
                />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
                  Cancelar voucher
                </Dialog.Title>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  El voucher{" "}
                  <span className="font-mono font-medium">
                    {cancelDialog?.internalFolio}
                  </span>{" "}
                  será marcado como cancelado. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Motivo de cancelación
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Indique el motivo de la cancelación..."
                className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                  No, regresar
                </button>
              </Dialog.Close>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
              >
                Sí, cancelar voucher
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

/* ─── Helper component ─── */
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-slate-500 dark:text-slate-400" />
      </div>
      <div className="min-w-0">
        <span className="text-xs text-slate-500">{label}</span>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
