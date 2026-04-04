import { useState, useMemo } from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  Ban,
  Printer,
  Loader2,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  QrCode,
  CheckCircle2,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMostrador } from "../hooks/useMostrador";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import MostradorForm from "../components/MostradorForm";
import TicketPrintView from "../../tickets/components/TicketPrintView";
import { usePrintTicket } from "../../tickets/hooks/usePrintTicket";
import { databases, DATABASE_ID, APP_IDS } from "../../../shared/lib/appwrite";
import { useToast } from "../../../shared/components/Toast";

const SALE_STATUSES = {
  confirmed: {
    label: "Confirmada",
    classes:
      "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400",
  },
  ticket_generated: {
    label: "Ticket generado",
    classes:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  cancelled: {
    label: "Cancelada",
    classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  blocked: {
    label: "Bloqueada",
    classes:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
};

const PAYMENT_LABELS = {
  cash: "Efectivo",
  transfer: "Transferencia",
  card: "Tarjeta",
  check: "Cheque",
  other: "Otro",
};

const UNIT_LABELS = {
  viaje: "Viaje",
  tonelada: "Ton",
  m3: "m³",
  kg: "kg",
  pieza: "Pza",
};

export default function Mostrador() {
  const { can } = usePermissions();
  const toast = useToast();
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
    fetchItems,
    create,
    cancel,
  } = useMostrador();

  const {
    printing,
    printHistory,
    loadingHistory,
    printTicket,
    reprintTicket,
    fetchPrintHistory,
  } = usePrintTicket();

  const [formOpen, setFormOpen] = useState(false);
  const [detailSale, setDetailSale] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [printViewTicket, setPrintViewTicket] = useState(null);
  const [reprintDialog, setReprintDialog] = useState(null);
  const [reprintReason, setReprintReason] = useState("");
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [actionError, setActionError] = useState(null);

  /* ── Lookup maps ─────────────────────────────────── */
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

  /* ── Guards ──────────────────────────────────────── */
  if (!can("counter_sales.view") && !can("tickets.view")) {
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

  /* ── Helpers ─────────────────────────────────────── */
  const clientName = (sale) => {
    if (sale.clientId && clientMap[sale.clientId])
      return clientMap[sale.clientId].name;
    if (sale.clientName) return sale.clientName;
    return "Sin cliente";
  };

  const resolveName = (map, id, field = "name") => map[id]?.[field] || "—";

  /* ── Handlers ────────────────────────────────────── */
  const handleCreate = async (data) => {
    const result = await create(data);
    if (result?.offline) {
      setActionError(null);
      // Show a temporary success message for offline
      setFormOpen(false);
      toast({
        type: "warning",
        message:
          "Venta guardada localmente. El ticket se generará al restaurar conexión.",
      });
      return;
    }
    // Auto-open print view after creation
    if (result?.ticketId) {
      openTicketPrintView(result.ticketId);
    }
  };

  const openTicketPrintView = async (ticketId) => {
    setLoadingTicket(true);
    try {
      const ticket = await databases.getDocument(
        DATABASE_ID,
        APP_IDS.collections.TICKETS,
        ticketId,
      );
      setPrintViewTicket(ticket);
    } catch (err) {
      setActionError("No se pudo cargar el ticket: " + err.message);
    } finally {
      setLoadingTicket(false);
    }
  };

  const handleInitialPrint = async (ticket) => {
    try {
      await printTicket(ticket);
      await fetchItems();
      if (printViewTicket?.$id === ticket.$id) {
        setPrintViewTicket((prev) => ({
          ...prev,
          printCount: (prev.printCount || 0) + 1,
          firstPrintedAt: prev.firstPrintedAt || new Date().toISOString(),
          lastPrintedAt: new Date().toISOString(),
          status: ["generated", "ready_to_print"].includes(prev.status)
            ? "printed"
            : prev.status,
        }));
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleReprint = async () => {
    if (!reprintDialog || !reprintReason.trim()) return;
    try {
      await reprintTicket(reprintDialog, reprintReason);
      await fetchItems();
      setReprintDialog(null);
      setReprintReason("");
      window.print();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleCancel = async () => {
    if (!cancelDialog) return;
    try {
      await cancel(cancelDialog.$id, cancelReason);
      setCancelDialog(null);
      setCancelReason("");
      if (detailSale?.$id === cancelDialog.$id) setDetailSale(null);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const activeSaleStatuses = ["confirmed", "ticket_generated"];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <header>
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
            <span>Operación</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 dark:text-slate-100">
              Venta en Mostrador
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Venta en Mostrador
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
            Ventas directas sin vale previo — genera ticket operativo al
            confirmar.
          </p>
        </header>
        {can("counter_sales.create") && (
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 h-10 px-4 text-sm font-medium transition-colors shrink-0"
          >
            <Plus size={16} /> Nueva venta
          </button>
        )}
      </div>

      {/* Error banner */}
      {actionError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400 flex-1">
            {actionError}
          </p>
          <button
            onClick={() => setActionError(null)}
            className="text-red-400 hover:text-red-600 text-xs underline shrink-0"
          >
            Cerrar
          </button>
        </div>
      )}

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
            placeholder="Buscar por folio o nombre de cliente..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
          >
            <option value="all">Todos</option>
            {Object.entries(SALE_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
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
                  Cantidad
                </th>
                <th className="px-4 sm:px-6 py-3 font-semibold hidden md:table-cell">
                  Pago
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
                    Cargando ventas...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    <ShoppingCart className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    {search
                      ? "Sin resultados."
                      : "No hay ventas en mostrador registradas."}
                  </td>
                </tr>
              ) : (
                items.map((sale) => {
                  const statusCfg =
                    SALE_STATUSES[sale.status] || SALE_STATUSES.confirmed;
                  return (
                    <tr
                      key={sale.$id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 sm:px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                            <ShoppingCart
                              size={14}
                              className="text-green-600 dark:text-green-400"
                            />
                          </div>
                          <div>
                            <div className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
                              {sale.internalNumber}
                            </div>
                            <div className="text-xs text-slate-400">
                              {new Date(sale.$createdAt).toLocaleDateString(
                                "es-MX",
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-slate-900 dark:text-slate-100 max-w-[160px] truncate">
                        {clientName(sale)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 hidden md:table-cell text-slate-700 dark:text-slate-300">
                        {resolveName(materialMap, sale.materialId)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 hidden lg:table-cell">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {sale.commercialQty}
                        </span>{" "}
                        <span className="text-xs text-slate-400">
                          {UNIT_LABELS[sale.commercialUnit] ||
                            sale.commercialUnit}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 hidden md:table-cell text-slate-600 dark:text-slate-400 text-xs">
                        {PAYMENT_LABELS[sale.paymentMethod] ||
                          sale.paymentMethod}
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.classes}`}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailSale(sale)}
                            title="Ver detalle"
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
                          >
                            <ChevronRight size={16} />
                          </button>
                          {sale.ticketId && can("tickets.print") && (
                            <button
                              onClick={() => openTicketPrintView(sale.ticketId)}
                              title="Imprimir ticket"
                              disabled={loadingTicket}
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-cyan-600 disabled:opacity-40"
                            >
                              <Printer size={16} />
                            </button>
                          )}
                          {activeSaleStatuses.includes(sale.status) &&
                            can("counter_sales.cancel") && (
                              <button
                                onClick={() => {
                                  setCancelDialog(sale);
                                  setCancelReason("");
                                }}
                                title="Cancelar venta"
                                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-600"
                              >
                                <Ban size={16} />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulario nueva venta */}
      <MostradorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        clients={clients}
        drivers={drivers}
        trucks={trucks}
        materials={materials}
        plants={plants}
        onSubmit={handleCreate}
      />

      {/* Panel de detalle */}
      {detailSale && (
        <SaleDetail
          sale={detailSale}
          clientMap={clientMap}
          driverMap={driverMap}
          truckMap={truckMap}
          materialMap={materialMap}
          plantMap={plantMap}
          onClose={() => setDetailSale(null)}
          onPrint={
            can("tickets.print") && detailSale.ticketId
              ? () => openTicketPrintView(detailSale.ticketId)
              : null
          }
          onCancel={
            can("counter_sales.cancel") &&
            activeSaleStatuses.includes(detailSale.status)
              ? () => {
                  setDetailSale(null);
                  setCancelDialog(detailSale);
                  setCancelReason("");
                }
              : null
          }
        />
      )}

      {/* Vista de impresión */}
      {printViewTicket && (
        <TicketPrintView
          ticket={printViewTicket}
          clientMap={clientMap}
          driverMap={driverMap}
          truckMap={truckMap}
          materialMap={materialMap}
          plantMap={plantMap}
          onClose={() => setPrintViewTicket(null)}
          onPrint={handleInitialPrint}
          onReprint={(t) => {
            setReprintDialog(t);
            setReprintReason("");
          }}
          isPrinting={printing}
          isReprinted={printViewTicket.reprintCount > 0}
          can={can}
        />
      )}

      {/* Diálogo reimpresión */}
      <Dialog.Root
        open={Boolean(reprintDialog)}
        onOpenChange={(v) => {
          if (!v) setReprintDialog(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[110]" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[111] w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6"
          >
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Reimprimir ticket
            </Dialog.Title>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Ticket{" "}
              <span className="font-mono">{reprintDialog?.ticketNumber}</span> —
              Indique el motivo.
            </p>
            <textarea
              value={reprintReason}
              onChange={(e) => setReprintReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Motivo de la reimpresión..."
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-white resize-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={handleReprint}
                disabled={!reprintReason.trim() || printing}
                className="px-4 py-2 text-sm rounded-md bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
              >
                Reimprimir
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Diálogo cancelación */}
      <Dialog.Root
        open={Boolean(cancelDialog)}
        onOpenChange={(v) => {
          if (!v) setCancelDialog(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle
                  size={20}
                  className="text-red-600 dark:text-red-400"
                />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
                  Cancelar venta
                </Dialog.Title>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Venta{" "}
                  <span className="font-mono">
                    {cancelDialog?.internalNumber}
                  </span>{" "}
                  — su ticket vinculado también será cancelado.
                </p>
              </div>
            </div>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Motivo de cancelación..."
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white resize-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                  No, regresar
                </button>
              </Dialog.Close>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white"
              >
                Sí, cancelar venta
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

/* ── Panel de detalle ─────────────────────────────────────── */
function SaleDetail({
  sale,
  clientMap,
  driverMap,
  truckMap,
  materialMap,
  plantMap,
  onClose,
  onPrint,
  onCancel,
}) {
  const statusCfg = SALE_STATUSES[sale.status] || SALE_STATUSES.confirmed;
  const resolveName = (map, id, field = "name") => map[id]?.[field] || "—";
  const displayClient = () => {
    if (sale.clientId && clientMap[sale.clientId])
      return clientMap[sale.clientId].name;
    if (sale.clientName) return sale.clientName;
    return "Sin cliente";
  };

  return (
    <Dialog.Root
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-xl flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
              Detalle de venta
            </Dialog.Title>
            <div className="flex items-center gap-2">
              {onPrint && (
                <button
                  onClick={onPrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-100"
                >
                  <Printer size={13} /> Imprimir ticket
                </button>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100"
                >
                  <Ban size={13} /> Cancelar
                </button>
              )}
              <Dialog.Close asChild>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                  <ChevronRight size={20} className="rotate-180" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart
                    size={16}
                    className="text-green-600 dark:text-green-400"
                  />
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {sale.internalNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {new Date(sale.$createdAt).toLocaleString("es-MX", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${statusCfg.classes}`}
              >
                {statusCfg.label}
              </span>
            </div>

            {sale.ticketId && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <CheckCircle2
                  size={16}
                  className="text-green-600 dark:text-green-400 shrink-0"
                />
                <QrCode
                  size={14}
                  className="text-green-600 dark:text-green-400"
                />
                <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                  Ticket operativo generado
                </span>
              </div>
            )}

            <DetailSection title="Cliente">
              <DetailRow label="Cliente" value={displayClient()} />
            </DetailSection>
            <DetailSection title="Transporte">
              <DetailRow
                label="Chofer"
                value={resolveName(driverMap, sale.driverId, "fullName")}
              />
              <DetailRow
                label="Camión"
                value={
                  truckMap[sale.truckId]
                    ? `${truckMap[sale.truckId].plateNumber}${truckMap[sale.truckId].economicNumber ? ` — ${truckMap[sale.truckId].economicNumber}` : ""}`
                    : "—"
                }
              />
            </DetailSection>
            <DetailSection title="Material">
              <DetailRow
                label="Material"
                value={resolveName(materialMap, sale.materialId)}
              />
              <DetailRow
                label="Planta / Origen"
                value={resolveName(plantMap, sale.plantId)}
              />
              <DetailRow
                label="Cantidad"
                value={`${sale.commercialQty} ${UNIT_LABELS[sale.commercialUnit] || sale.commercialUnit}`}
              />
            </DetailSection>
            <DetailSection title="Pago referencial">
              <DetailRow
                label="Método"
                value={PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod}
              />
              {sale.paymentReference && (
                <DetailRow label="Referencia" value={sale.paymentReference} />
              )}
            </DetailSection>
            {sale.notes && (
              <DetailSection title="Observaciones">
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {sale.notes}
                </p>
              </DetailSection>
            )}
            {sale.cancelReason && (
              <DetailSection title="Motivo de cancelación">
                <p className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
                  {sale.cancelReason}
                </p>
              </DetailSection>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DetailSection({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
        {label}
      </span>
      <span className="text-sm text-slate-900 dark:text-slate-100 text-right">
        {value || "—"}
      </span>
    </div>
  );
}
