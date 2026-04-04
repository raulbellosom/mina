import { useState, useMemo } from "react";
import {
  FileText,
  Search,
  Filter,
  Eye,
  Ban,
  ArrowRightCircle,
  Loader2,
  ShieldAlert,
  AlertTriangle,
  QrCode,
  Printer,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { databases, DATABASE_ID, APP_IDS } from "../../../shared/lib/appwrite";
import { ID } from "appwrite";
import { useAuth } from "../../auth/hooks/useAuth";
import SearchableSelect from "../../../shared/components/SearchableSelect";
import * as Dialog from "@radix-ui/react-dialog";
import { useTickets, TICKET_STATUSES } from "../hooks/useTickets";
import { usePrintTicket } from "../hooks/usePrintTicket";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import { useToast } from "../../../shared/components/Toast";
import TicketDetail, { STATUS_COLORS } from "../components/TicketDetail";
import TicketPrintView from "../components/TicketPrintView";

const UNIT_LABELS = {
  viaje: "Viaje",
  tonelada: "Ton",
  m3: "m³",
  kg: "kg",
  pieza: "Pza",
};

export default function Tickets() {
  const { can } = usePermissions();
  const toast = useToast();
  const { user } = useAuth();
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
    cancel,
    markReadyToPrint,
    fetchItems,
  } = useTickets();

  const {
    printing,
    printHistory,
    loadingHistory,
    printTicket,
    reprintTicket,
    fetchPrintHistory,
  } = usePrintTicket();

  const [detailItem, setDetailItem] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [printViewTicket, setPrintViewTicket] = useState(null);
  const [reprintDialog, setReprintDialog] = useState(null);
  const [reprintReason, setReprintReason] = useState("");

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
  if (!can("tickets.view")) {
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
  const handleCancel = async () => {
    if (!cancelDialog) return;
    await cancel(cancelDialog.$id, cancelReason);
    setCancelDialog(null);
    setCancelReason("");
    if (detailItem?.$id === cancelDialog.$id) setDetailItem(null);
  };

  const handleMarkReadyToPrint = async (id) => {
    await markReadyToPrint(id);
    if (detailItem?.$id === id)
      setDetailItem((prev) => ({ ...prev, status: "ready_to_print" }));
  };

  const openCancelFromDetail = (t) => {
    setCancelDialog(t);
    setCancelReason("");
  };

  /* ─── Print handlers ─── */
  const handleOpenPrintView = (ticket) => {
    setPrintViewTicket(ticket);
  };

  const handleExportPdf = async (ticket) => {
    // Log export to audit, then open print view (browser Save as PDF)
    try {
      await databases.createDocument(
        DATABASE_ID,
        APP_IDS.collections.AUDIT_LOGS,
        ID.unique(),
        {
          action: "export.ticket_pdf",
          collection: APP_IDS.collections.TICKETS,
          docId: ticket.$id,
          userId: user?.$id || "unknown",
          details: JSON.stringify({
            ticketNumber: ticket.ticketNumber,
            clientId: ticket.clientId,
            materialId: ticket.materialId,
          }),
        },
      );
    } catch (err) {
      console.warn("Audit log for PDF export failed:", err.message);
    }
    setPrintViewTicket(ticket);
  };

  const handleInitialPrint = async (ticket) => {
    try {
      await printTicket(ticket);
      await fetchItems();
      // Refresh detail if open
      if (detailItem?.$id === ticket.$id) {
        setDetailItem((prev) => ({
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
      console.error("Error al imprimir:", err);
      toast({ type: "error", message: err.message || "Error al imprimir" });
    }
  };

  const handleOpenReprintDialog = (ticket) => {
    setReprintDialog(ticket);
    setReprintReason("");
  };

  const handleReprint = async () => {
    if (!reprintDialog || !reprintReason.trim()) return;
    try {
      await reprintTicket(reprintDialog, reprintReason);
      await fetchItems();
      // Refresh detail if open
      if (detailItem?.$id === reprintDialog.$id) {
        setDetailItem((prev) => ({
          ...prev,
          printCount: (prev.printCount || 0) + 1,
          reprintCount: (prev.reprintCount || 0) + 1,
          lastPrintedAt: new Date().toISOString(),
        }));
      }
      setReprintDialog(null);
      setReprintReason("");
      // Trigger browser print after reprint registration
      window.print();
    } catch (err) {
      console.error("Error al reimprimir:", err);
      toast({ type: "error", message: err.message || "Error al reimprimir" });
    }
  };

  /* ─── Resolve helper ─── */
  const resolveName = (map, id, field = "name") => map[id]?.[field] || "—";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <header>
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
            <span>Documentos</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 dark:text-slate-100">
              Tickets Operativos
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Tickets Operativos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
            Tickets generados desde vouchers con QR para trazabilidad operativa.
          </p>
        </header>
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
            placeholder="Buscar por número de ticket..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={16} className="text-slate-400" />
          <SearchableSelect
            value={filterStatus}
            onChange={(v) => setFilterStatus(v)}
            options={[
              { value: "all", label: "Todos los estados" },
              ...Object.entries(TICKET_STATUSES).map(([key, val]) => ({
                value: key,
                label: val.label,
              })),
            ]}
            placeholder="Estado"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-semibold">Ticket</th>
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
                    Cargando tickets...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    <FileText className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    {search
                      ? "Sin resultados para la búsqueda."
                      : "No hay tickets generados."}
                  </td>
                </tr>
              ) : (
                items.map((t) => (
                  <tr
                    key={t.$id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    {/* Ticket number */}
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                          <QrCode
                            size={14}
                            className="text-primary-600 dark:text-primary-400"
                          />
                        </div>
                        <div>
                          <div className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
                            {t.ticketNumber}
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(t.$createdAt).toLocaleDateString("es-MX")}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Cliente */}
                    <td className="px-4 sm:px-6 py-3">
                      <div className="text-slate-900 dark:text-slate-100 truncate max-w-[160px]">
                        {resolveName(clientMap, t.clientId)}
                      </div>
                    </td>
                    {/* Material */}
                    <td className="px-4 sm:px-6 py-3 hidden md:table-cell">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px] inline-block">
                        {resolveName(materialMap, t.materialId)}
                      </span>
                    </td>
                    {/* Planta */}
                    <td className="px-4 sm:px-6 py-3 hidden lg:table-cell">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px] inline-block">
                        {resolveName(plantMap, t.plantId)}
                      </span>
                    </td>
                    {/* Cantidad */}
                    <td className="px-4 sm:px-6 py-3 hidden md:table-cell">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {t.commercialQty}
                      </span>{" "}
                      <span className="text-xs text-slate-400">
                        {UNIT_LABELS[t.commercialUnit] || t.commercialUnit}
                      </span>
                    </td>
                    {/* Estado */}
                    <td className="px-4 sm:px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[t.status] || STATUS_COLORS.generated}`}
                      >
                        {TICKET_STATUSES[t.status]?.label || t.status}
                      </span>
                    </td>
                    {/* Acciones */}
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Ver detalle"
                          onClick={() => setDetailItem(t)}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600"
                        >
                          <Eye size={15} />
                        </button>
                        {can("tickets.print") &&
                          !["cancelled", "blocked"].includes(t.status) && (
                            <button
                              title="Ver impresión"
                              onClick={() => handleOpenPrintView(t)}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-cyan-600"
                            >
                              <Printer size={15} />
                            </button>
                          )}
                        {can("tickets.reprint") &&
                          t.printCount > 0 &&
                          !["cancelled", "blocked"].includes(t.status) && (
                            <button
                              title="Reimprimir"
                              onClick={() => handleOpenReprintDialog(t)}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-600"
                            >
                              <RotateCcw size={15} />
                            </button>
                          )}
                        {can("tickets.generate") &&
                          t.status === "generated" && (
                            <button
                              title="Marcar listo para imprimir"
                              onClick={() => handleMarkReadyToPrint(t.$id)}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600"
                            >
                              <ArrowRightCircle size={15} />
                            </button>
                          )}
                        {can("tickets.cancel") &&
                          !["completed", "cancelled", "blocked"].includes(
                            t.status,
                          ) && (
                            <button
                              title="Cancelar ticket"
                              onClick={() => {
                                setCancelDialog(t);
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

      {/* Detail panel with QR */}
      {detailItem && (
        <TicketDetail
          ticket={detailItem}
          onClose={() => setDetailItem(null)}
          clientMap={clientMap}
          driverMap={driverMap}
          truckMap={truckMap}
          materialMap={materialMap}
          plantMap={plantMap}
          can={can}
          onMarkReadyToPrint={handleMarkReadyToPrint}
          onCancel={openCancelFromDetail}
          onOpenPrintView={handleOpenPrintView}
          onExportPdf={handleExportPdf}
          onOpenReprintDialog={handleOpenReprintDialog}
          printHistory={printHistory}
          loadingHistory={loadingHistory}
          fetchPrintHistory={fetchPrintHistory}
        />
      )}

      {/* Print preview full-screen */}
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
          onReprint={handleOpenReprintDialog}
          isPrinting={printing}
          isReprinted={printViewTicket.reprintCount > 0}
          can={can}
        />
      )}

      {/* Reprint confirmation dialog */}
      <Dialog.Root
        open={Boolean(reprintDialog)}
        onOpenChange={(open) => {
          if (!open) setReprintDialog(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[110]" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[111] w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <RotateCcw
                  size={20}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
                  Reimprimir ticket
                </Dialog.Title>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Ticket{" "}
                  <span className="font-mono font-medium">
                    {reprintDialog?.ticketNumber}
                  </span>{" "}
                  — La reimpresión es una acción auditada. Indique el motivo.
                </p>
                {reprintDialog?.reprintCount > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Este ticket ya ha sido reimpreso{" "}
                    {reprintDialog.reprintCount} vez(es).
                  </p>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Motivo de reimpresión <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reprintReason}
                onChange={(e) => setReprintReason(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Indique el motivo de la reimpresión..."
                className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-white resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={handleReprint}
                disabled={!reprintReason.trim() || printing}
                className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium disabled:opacity-50"
              >
                {printing ? "Procesando..." : "Reimprimir ticket"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Cancel confirmation dialog */}
      <Dialog.Root
        open={Boolean(cancelDialog)}
        onOpenChange={(open) => {
          if (!open) setCancelDialog(null);
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
                  Cancelar ticket
                </Dialog.Title>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  El ticket{" "}
                  <span className="font-mono font-medium">
                    {cancelDialog?.ticketNumber}
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
                Sí, cancelar ticket
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
