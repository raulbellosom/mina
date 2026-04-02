import { QRCodeSVG } from "qrcode.react";
import { X, Printer, RotateCcw } from "lucide-react";
import { DEFAULT_COPIES } from "../hooks/usePrintTicket";

const UNIT_LABELS = {
  viaje: "Viaje",
  tonelada: "Tonelada",
  m3: "Metro cúbico (m³)",
  kg: "Kilogramo",
  pieza: "Pieza",
};

/**
 * Full-screen print preview for a ticket.
 * Contains:
 *   - On-screen header with Print / Reprint / Close buttons
 *   - 3 copies of the ticket laid out for @media print
 *   - Each copy has QR, ticket data, and copy label
 *
 * The component renders N copies (default 3) within a hidden-on-screen
 * but visible-in-print container. The screen preview shows one copy.
 */
export default function TicketPrintView({
  ticket,
  clientMap = {},
  driverMap = {},
  truckMap = {},
  materialMap = {},
  plantMap = {},
  copies = DEFAULT_COPIES,
  onClose,
  onPrint,
  onReprint,
  isPrinting = false,
  isReprinted = false,
  can,
}) {
  if (!ticket) return null;

  const resolveName = (map, id, field = "name") => map[id]?.[field] || "—";

  const isFirstPrint = !ticket.firstPrintedAt && ticket.printCount === 0;
  const hasBeenPrinted = ticket.printCount > 0;

  const handlePrintClick = async () => {
    if (isFirstPrint && onPrint) {
      await onPrint(ticket);
    }
    window.print();
  };

  const copyLabels = [
    "Copia Báscula / Mostrador",
    "Copia Operador de Carga",
    "Copia Chofer",
  ];

  const TicketCopy = ({ copyIndex }) => (
    <div
      className="ticket-copy"
      style={{ pageBreakAfter: copyIndex < copies - 1 ? "always" : "auto" }}
    >
      <div className="border-2 border-slate-800 rounded-lg p-5 max-w-[380px] mx-auto">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-800 pb-3 mb-3">
          <h1 className="text-lg font-bold tracking-wider uppercase">
            MinaFlow
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Ticket de Salida de Material
          </p>
          {(isReprinted || ticket.reprintCount > 0) && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded border border-amber-300">
              ★ Reimpresión ★
            </span>
          )}
        </div>

        {/* Ticket Number + QR */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 space-y-1.5">
            <div>
              <span className="text-[10px] uppercase text-slate-500 tracking-wider">
                Folio
              </span>
              <p className="text-base font-bold font-mono tracking-wide">
                {ticket.ticketNumber}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 tracking-wider">
                Fecha/Hora Emisión
              </span>
              <p className="text-xs font-medium">
                {new Date(ticket.$createdAt).toLocaleString("es-MX", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 tracking-wider">
                Estado
              </span>
              <p className="text-xs font-medium uppercase">{ticket.status}</p>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-center">
            <QRCodeSVG
              value={ticket.qrData}
              size={90}
              level="M"
              includeMargin={false}
            />
            <p className="text-[8px] text-slate-400 mt-1 font-mono">
              {ticket.ticketNumber}
            </p>
          </div>
        </div>

        {/* Voucher ref */}
        {ticket.voucherId && (
          <div className="text-[10px] text-slate-500 mb-2">
            Ref. Voucher:{" "}
            <span className="font-mono">
              {ticket.voucherId.substring(0, 12)}…
            </span>
          </div>
        )}

        {/* Data grid */}
        <div className="border-t border-slate-300 pt-2 space-y-1.5 text-xs">
          <PrintRow
            label="Cliente"
            value={resolveName(clientMap, ticket.clientId)}
          />
          <PrintRow
            label="Material"
            value={resolveName(materialMap, ticket.materialId)}
          />
          <PrintRow
            label="Planta / Origen"
            value={resolveName(plantMap, ticket.plantId)}
          />
          {ticket.driverId && (
            <PrintRow
              label="Chofer"
              value={resolveName(driverMap, ticket.driverId, "fullName")}
            />
          )}
          {ticket.truckId && (
            <PrintRow
              label="Camión"
              value={
                truckMap[ticket.truckId]
                  ? `${truckMap[ticket.truckId].plates}${truckMap[ticket.truckId].alias ? ` — ${truckMap[ticket.truckId].alias}` : ""}`
                  : "—"
              }
            />
          )}
        </div>

        {/* Commercial quantity — prominent */}
        <div className="mt-3 border-2 border-slate-800 rounded p-2 text-center">
          <span className="text-[10px] uppercase text-slate-500 tracking-wider block">
            Cantidad
          </span>
          <p className="text-xl font-bold">
            {ticket.commercialQty}{" "}
            <span className="text-sm font-normal">
              {UNIT_LABELS[ticket.commercialUnit] || ticket.commercialUnit}
            </span>
          </p>
        </div>

        {/* Notes */}
        {ticket.notes && (
          <div className="mt-2 text-[10px] text-slate-500">
            <span className="uppercase tracking-wider">Obs:</span>{" "}
            {ticket.notes}
          </div>
        )}

        {/* Print info */}
        {ticket.printCount > 0 && (
          <div className="mt-2 text-[10px] text-slate-400">
            Impresiones: {ticket.printCount}
            {ticket.reprintCount > 0 ? ` (${ticket.reprintCount} reimp.)` : ""}
          </div>
        )}

        {/* Copy label */}
        <div className="mt-3 pt-2 border-t border-dashed border-slate-400 text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
            {copyLabels[copyIndex] || `Copia ${copyIndex + 1}`}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body > *:not(#ticket-print-root) { display: none !important; }
          #ticket-print-root { position: static !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .ticket-copy { margin: 0; padding: 10mm 5mm; }
          @page { size: letter; margin: 10mm; }
        }
      `}</style>

      <div
        id="ticket-print-root"
        className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 overflow-y-auto"
      >
        {/* Screen-only toolbar */}
        <div className="no-print sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Vista de impresión — {ticket.ticketNumber}
          </h2>
          <div className="flex items-center gap-2">
            {/* Initial print button */}
            {can("tickets.print") && (
              <button
                onClick={handlePrintClick}
                disabled={isPrinting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                <Printer size={16} />
                {isPrinting
                  ? "Procesando..."
                  : isFirstPrint
                    ? "Imprimir ticket"
                    : "Imprimir"}
              </button>
            )}

            {/* Reprint button — only if already printed */}
            {can("tickets.reprint") && hasBeenPrinted && onReprint && (
              <button
                onClick={() => onReprint(ticket)}
                disabled={isPrinting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50"
              >
                <RotateCcw size={16} />
                Reimprimir
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Preview single copy on screen */}
        <div className="no-print p-4 sm:p-8 flex justify-center">
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-[420px] w-full">
            <TicketCopy copyIndex={0} />
            <p className="text-center text-xs text-slate-400 mt-4">
              Se imprimirán {copies} copias: Báscula/Mostrador, Operador de
              carga y Chofer.
            </p>
          </div>
        </div>

        {/* All copies — visible only when printing */}
        <div className="print-only hidden">
          {Array.from({ length: copies }, (_, i) => (
            <TicketCopy key={i} copyIndex={i} />
          ))}
        </div>
      </div>
    </>
  );
}

function PrintRow({ label, value }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-500 shrink-0">{label}:</span>
      <span className="font-medium text-right text-slate-900">{value}</span>
    </div>
  );
}
