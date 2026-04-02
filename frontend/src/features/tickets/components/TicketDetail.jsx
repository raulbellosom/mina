import { QRCodeSVG } from "qrcode.react";
import {
  X,
  FileText,
  User,
  Package,
  MapPin,
  Truck,
  Ticket,
  Pencil,
  Ban,
  ArrowRightCircle,
  Printer,
  RotateCcw,
  Eye,
  Download,
} from "lucide-react";
import { TICKET_STATUSES } from "../hooks/useTickets";
import PrintHistoryPanel from "./PrintHistoryPanel";

const STATUS_COLORS = {
  generated:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  ready_to_print:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  printed: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  loading:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  loaded:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  pending_exit_validation:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  completed:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  blocked: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const UNIT_LABELS = {
  viaje: "Viaje",
  tonelada: "Ton",
  m3: "m³",
  kg: "kg",
  pieza: "Pza",
};

export { STATUS_COLORS };

export default function TicketDetail({
  ticket,
  onClose,
  clientMap = {},
  driverMap = {},
  truckMap = {},
  materialMap = {},
  plantMap = {},
  can,
  onMarkReadyToPrint,
  onCancel,
  onOpenPrintView,
  onExportPdf,
  onOpenReprintDialog,
  printHistory = [],
  loadingHistory = false,
  fetchPrintHistory,
}) {
  if (!ticket) return null;

  const resolveName = (map, id, field = "name") => map[id]?.[field] || "—";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Detalle de ticket
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status + Ticket Number */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status] || STATUS_COLORS.generated}`}
            >
              {TICKET_STATUSES[ticket.status]?.label || ticket.status}
            </span>
            <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">
              {ticket.ticketNumber}
            </span>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center bg-white rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <QRCodeSVG
              value={ticket.qrData}
              size={180}
              level="M"
              includeMargin={false}
            />
            <p className="mt-3 text-xs text-slate-400 font-mono break-all text-center max-w-[220px]">
              {ticket.qrData}
            </p>
          </div>

          {/* Voucher link */}
          {ticket.voucherId && (
            <DetailRow
              icon={Ticket}
              label="Voucher origen"
              value={ticket.voucherId}
              mono
            />
          )}

          {/* Catalog data */}
          <DetailRow
            icon={User}
            label="Cliente"
            value={resolveName(clientMap, ticket.clientId)}
          />
          <DetailRow
            icon={Package}
            label="Material"
            value={resolveName(materialMap, ticket.materialId)}
          />
          <DetailRow
            icon={MapPin}
            label="Planta / Origen"
            value={resolveName(plantMap, ticket.plantId)}
          />

          {ticket.driverId && (
            <DetailRow
              icon={User}
              label="Chofer"
              value={resolveName(driverMap, ticket.driverId, "fullName")}
            />
          )}
          {ticket.truckId && (
            <DetailRow
              icon={Truck}
              label="Camión"
              value={
                truckMap[ticket.truckId]
                  ? `${truckMap[ticket.truckId].plates}${truckMap[ticket.truckId].alias ? ` — ${truckMap[ticket.truckId].alias}` : ""}`
                  : "—"
              }
            />
          )}

          {/* Commercial quantity */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              Cantidad comercial
            </span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {ticket.commercialQty}{" "}
              <span className="text-base font-normal text-slate-400">
                {UNIT_LABELS[ticket.commercialUnit] || ticket.commercialUnit}
              </span>
            </p>
          </div>

          {/* Print summary */}
          {(ticket.printCount > 0 || ticket.firstPrintedAt) && (
            <div className="bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <Printer
                  size={14}
                  className="text-cyan-600 dark:text-cyan-400"
                />
                <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                  Información de impresión
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Total impresiones:{" "}
                <span className="font-semibold">{ticket.printCount || 0}</span>
                {ticket.reprintCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-[10px] font-bold">
                    {ticket.reprintCount} reimp.
                  </span>
                )}
              </p>
              {ticket.firstPrintedAt && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Primera:{" "}
                  {new Date(ticket.firstPrintedAt).toLocaleString("es-MX")}
                </p>
              )}
              {ticket.lastPrintedAt &&
                ticket.lastPrintedAt !== ticket.firstPrintedAt && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Última:{" "}
                    {new Date(ticket.lastPrintedAt).toLocaleString("es-MX")}
                  </p>
                )}
            </div>
          )}

          {ticket.notes && (
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">
                Observaciones
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">
                {ticket.notes}
              </p>
            </div>
          )}

          {ticket.cancelReason && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <span className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wider">
                Motivo de cancelación
              </span>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {ticket.cancelReason}
              </p>
            </div>
          )}

          {/* Print history */}
          <PrintHistoryPanel
            ticketId={ticket.$id}
            printHistory={printHistory}
            loadingHistory={loadingHistory}
            fetchPrintHistory={fetchPrintHistory}
          />

          {/* Metadata */}
          <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
            <p>
              Emitido: {new Date(ticket.$createdAt).toLocaleString("es-MX")}
            </p>
            {ticket.$updatedAt !== ticket.$createdAt && (
              <p>
                Actualizado:{" "}
                {new Date(ticket.$updatedAt).toLocaleString("es-MX")}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            {/* View print preview */}
            {can("tickets.print") &&
              !["cancelled", "blocked"].includes(ticket.status) &&
              onOpenPrintView && (
                <button
                  onClick={() => onOpenPrintView(ticket)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700"
                >
                  <Eye size={14} /> Ver impresión
                </button>
              )}
            {/* Export PDF */}
            {can("tickets.print") &&
              !["cancelled", "blocked"].includes(ticket.status) &&
              onExportPdf && (
                <button
                  onClick={() => onExportPdf(ticket)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
                >
                  <Download size={14} /> Exportar PDF
                </button>
              )}
            {/* Reprint */}
            {can("tickets.reprint") &&
              ticket.printCount > 0 &&
              !["cancelled", "blocked"].includes(ticket.status) &&
              onOpenReprintDialog && (
                <button
                  onClick={() => onOpenReprintDialog(ticket)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-amber-400 dark:border-amber-600 text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  <RotateCcw size={14} /> Reimprimir
                </button>
              )}
            {can("tickets.generate") &&
              ticket.status === "generated" &&
              onMarkReadyToPrint && (
                <button
                  onClick={() => onMarkReadyToPrint(ticket.$id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                  <ArrowRightCircle size={14} /> Marcar listo para imprimir
                </button>
              )}
            {can("tickets.cancel") &&
              !["completed", "cancelled", "blocked"].includes(ticket.status) &&
              onCancel && (
                <button
                  onClick={() => onCancel(ticket)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-300 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Ban size={14} /> Cancelar
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Helper component ─── */
function DetailRow({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-slate-500 dark:text-slate-400" />
      </div>
      <div className="min-w-0">
        <span className="text-xs text-slate-500">{label}</span>
        <p
          className={`text-sm font-medium text-slate-900 dark:text-slate-100 break-words ${mono ? "font-mono text-xs" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
