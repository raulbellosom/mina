import { useState, useEffect } from "react";
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
import SideModal from "../../../shared/components/SideModal";

const STATUS_COLORS = {
  generated:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  ready_to_print:
    "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400",
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
  open,
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
  const [lastTicket, setLastTicket] = useState(ticket);
  useEffect(() => {
    if (ticket) setLastTicket(ticket);
  }, [ticket]);
  const t = ticket || lastTicket;
  if (!t) return null;

  const resolveName = (map, id, field = "name") => map[id]?.[field] || "—";

  return (
    <SideModal
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
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

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Status + Ticket Number */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[t.status] || STATUS_COLORS.generated}`}
          >
            {TICKET_STATUSES[t.status]?.label || t.status}
          </span>
          <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t.ticketNumber}
          </span>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center bg-white rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <QRCodeSVG
            value={t.qrData}
            size={180}
            level="M"
            includeMargin={false}
          />
          <p className="mt-3 text-xs text-slate-400 font-mono break-all text-center max-w-[220px]">
            {t.qrData}
          </p>
        </div>

        {/* Voucher link */}
        {t.voucherId && (
          <DetailRow
            icon={Ticket}
            label="Voucher origen"
            value={t.voucherId}
            mono
          />
        )}

        {/* Catalog data */}
        <DetailRow
          icon={User}
          label="Cliente"
          value={resolveName(clientMap, t.clientId)}
        />
        <DetailRow
          icon={Package}
          label="Material"
          value={resolveName(materialMap, t.materialId)}
        />
        <DetailRow
          icon={MapPin}
          label="Planta / Origen"
          value={resolveName(plantMap, t.plantId)}
        />

        {t.driverId && (
          <DetailRow
            icon={User}
            label="Chofer"
            value={resolveName(driverMap, t.driverId, "fullName")}
          />
        )}
        {t.truckId && (
          <DetailRow
            icon={Truck}
            label="Camión"
            value={
              truckMap[t.truckId]
                ? `${truckMap[t.truckId].plateNumber}${truckMap[t.truckId].economicNumber ? ` — ${truckMap[t.truckId].economicNumber}` : ""}`
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
            {t.commercialQty}{" "}
            <span className="text-base font-normal text-slate-400">
              {UNIT_LABELS[t.commercialUnit] || t.commercialUnit}
            </span>
          </p>
        </div>

        {/* Print summary */}
        {(t.printCount > 0 || t.firstPrintedAt) && (
          <div className="bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Printer size={14} className="text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                Información de impresión
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Total impresiones:{" "}
              <span className="font-semibold">{t.printCount || 0}</span>
              {t.reprintCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-[10px] font-bold">
                  {t.reprintCount} reimp.
                </span>
              )}
            </p>
            {t.firstPrintedAt && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Primera: {new Date(t.firstPrintedAt).toLocaleString("es-MX")}
              </p>
            )}
            {t.lastPrintedAt && t.lastPrintedAt !== t.firstPrintedAt && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Última: {new Date(t.lastPrintedAt).toLocaleString("es-MX")}
              </p>
            )}
          </div>
        )}

        {t.notes && (
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              Observaciones
            </span>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">
              {t.notes}
            </p>
          </div>
        )}

        {t.cancelReason && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <span className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wider">
              Motivo de cancelación
            </span>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {t.cancelReason}
            </p>
          </div>
        )}

        {/* Print history */}
        <PrintHistoryPanel
          ticketId={t.$id}
          printHistory={printHistory}
          loadingHistory={loadingHistory}
          fetchPrintHistory={fetchPrintHistory}
        />

        {/* Metadata */}
        <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
          <p>Emitido: {new Date(t.$createdAt).toLocaleString("es-MX")}</p>
          {t.$updatedAt !== t.$createdAt && (
            <p>Actualizado: {new Date(t.$updatedAt).toLocaleString("es-MX")}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          {/* View print preview */}
          {can("tickets.print") &&
            !["cancelled", "blocked"].includes(t.status) &&
            onOpenPrintView && (
              <button
                onClick={() => onOpenPrintView(t)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700"
              >
                <Eye size={14} /> Ver impresión
              </button>
            )}
          {/* Export PDF */}
          {can("tickets.print") &&
            !["cancelled", "blocked"].includes(t.status) &&
            onExportPdf && (
              <button
                onClick={() => onExportPdf(t)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
              >
                <Download size={14} /> Exportar PDF
              </button>
            )}
          {/* Reprint */}
          {can("tickets.reprint") &&
            t.printCount > 0 &&
            !["cancelled", "blocked"].includes(t.status) &&
            onOpenReprintDialog && (
              <button
                onClick={() => onOpenReprintDialog(t)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-amber-400 dark:border-amber-600 text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                <RotateCcw size={14} /> Reimprimir
              </button>
            )}
          {can("tickets.generate") &&
            t.status === "generated" &&
            onMarkReadyToPrint && (
              <button
                onClick={() => onMarkReadyToPrint(t.$id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
              >
                <ArrowRightCircle size={14} /> Marcar listo para imprimir
              </button>
            )}
          {can("tickets.cancel") &&
            !["completed", "cancelled", "blocked"].includes(t.status) &&
            onCancel && (
              <button
                onClick={() => onCancel(t)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-300 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Ban size={14} /> Cancelar
              </button>
            )}
        </div>
      </div>
    </SideModal>
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
