import { useState, useEffect, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Printer, RotateCcw, Download } from "lucide-react";
import { databases, DATABASE_ID, APP_IDS } from "../../../shared/lib/appwrite";
import { DEFAULT_COPIES } from "../hooks/usePrintTicket";

const UNIT_LABELS = {
  viaje: "Viaje",
  tonelada: "Tonelada",
  m3: "m³",
  kg: "Kilogramo",
  pieza: "Pieza",
};

/* 80mm thermal paper — Epson TM-m30III */
const PAPER_WIDTH_MM = 80;
const PAPER_WIDTH_PX = 302; // 80mm at 96 CSS dpi

/**
 * Professional ticket print view optimized for Epson TM-m30III
 * thermal receipt printer (80mm paper rolls).
 *
 * Renders 3 labeled copies:
 *   1. Báscula / Caseta
 *   2. Operador de Grúa
 *   3. Cliente
 *
 * Screen: shows 1:1 preview at real paper width.
 * Print:  outputs 3 copies with page breaks, sized for 80mm paper.
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
  const [config, setConfig] = useState({
    companyName: "",
    companyAddress: "",
    companyPhone: "",
  });
  const [downloading, setDownloading] = useState(false);
  const printAreaRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const doc = await databases.getDocument(
          DATABASE_ID,
          APP_IDS.collections.SYSTEM_CONFIG,
          APP_IDS.docs.SYSTEM_CONFIG_SINGLETON,
        );
        setConfig({
          companyName: doc.companyName || "",
          companyAddress: doc.companyAddress || "",
          companyPhone: doc.companyPhone || "",
        });
      } catch (_) {
        /* keep defaults */
      }
    })();
  }, []);

  if (!ticket) return null;

  const resolveName = (map, id, field = "name") => map[id]?.[field] || "—";

  const isFirstPrint = !ticket.firstPrintedAt && ticket.printCount === 0;
  const hasBeenPrinted = ticket.printCount > 0;
  const showReprint = isReprinted || ticket.reprintCount > 0;

  const handlePrintClick = async () => {
    if (isFirstPrint && onPrint) {
      await onPrint(ticket);
    }
    window.print();
  };

  /**
   * Generate a PDF by opening a new window with only the ticket copies,
   * then triggering the browser's native Save-as-PDF print dialog.
   */
  const handleDownloadPdf = useCallback(async () => {
    if (!printAreaRef.current) return;
    setDownloading(true);

    try {
      // Clone the print area HTML
      const ticketHtml = printAreaRef.current.innerHTML;

      // Build a self-contained HTML document for the PDF
      const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${ticket.ticketNumber} - Ticket</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: ${PAPER_WIDTH_MM}mm auto; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  .tkt-copy { width: ${PAPER_WIDTH_MM}mm; padding: 2mm 4mm 4mm; page-break-after: always; }
  .tkt-copy:last-child { page-break-after: auto; }
  ${thermalBaseStyles}
</style>
</head>
<body>${ticketHtml}</body></html>`;

      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (win) {
        win.addEventListener("afterprint", () => win.close());
        win.onload = () => {
          setTimeout(() => win.print(), 300);
          URL.revokeObjectURL(url);
        };
      } else {
        // Fallback: download as HTML if popup blocked
        const a = document.createElement("a");
        a.href = url;
        a.download = `${ticket.ticketNumber}.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [ticket]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truckDisplay =
    ticket.truckId && truckMap[ticket.truckId]
      ? `${truckMap[ticket.truckId].plateNumber}${truckMap[ticket.truckId].economicNumber ? ` / ${truckMap[ticket.truckId].economicNumber}` : ""}`
      : null;

  const copyLabels = ["BÁSCULA / CASETA", "OPERADOR DE GRÚA", "CLIENTE"];

  const brandName = config.companyName || "MINAPRO";

  /* ─────────────────── Ticket copy ─────────────────── */
  const TicketCopy = ({ copyIndex }) => (
    <div className="tkt-copy">
      <div className="tkt-body">
        {/* ═══ LETTERHEAD ═══ */}
        <div className="tkt-header">
          <div className="tkt-double-line" />
          <img src="/ore_logo.png" alt="" className="tkt-logo" />
          <div className="tkt-brand">{brandName}</div>
          {config.companyAddress && (
            <div className="tkt-company-detail">{config.companyAddress}</div>
          )}
          {config.companyPhone && (
            <div className="tkt-company-detail">Tel. {config.companyPhone}</div>
          )}
          <div className="tkt-double-line" />
        </div>

        {/* DOCUMENT TITLE */}
        <div className="tkt-title-section">
          <div className="tkt-doc-title">TICKET DE SALIDA</div>
          {showReprint && (
            <div className="tkt-reprint-badge">★ REIMPRESIÓN ★</div>
          )}
        </div>

        <div className="tkt-divider" />

        {/* FOLIO + DATE */}
        <div className="tkt-folio-section">
          <div className="tkt-label">FOLIO</div>
          <div className="tkt-folio">{ticket.ticketNumber}</div>
          <div className="tkt-date">{formatDate(ticket.$createdAt)}</div>
        </div>

        <div className="tkt-divider" />

        {/* QR CODE — centered, prominent */}
        <div className="tkt-qr-section">
          <QRCodeSVG
            value={ticket.qrData}
            size={130}
            level="H"
            includeMargin={false}
          />
          <div className="tkt-qr-label">{ticket.ticketNumber}</div>
        </div>

        <div className="tkt-divider" />

        {/* DATA ROWS */}
        <div className="tkt-data-section">
          <div className="tkt-section-title">DATOS DE OPERACIÓN</div>
          <DataRow
            label="Cliente"
            value={resolveName(clientMap, ticket.clientId)}
          />
          <DataRow
            label="Material"
            value={resolveName(materialMap, ticket.materialId)}
          />
          <DataRow
            label="Planta"
            value={resolveName(plantMap, ticket.plantId)}
          />
          {ticket.driverId && (
            <DataRow
              label="Chofer"
              value={resolveName(driverMap, ticket.driverId, "fullName")}
            />
          )}
          {truckDisplay && <DataRow label="Camión" value={truckDisplay} />}
        </div>

        <div className="tkt-divider" />

        {/* QUANTITY — highlighted box */}
        <div className="tkt-qty-box">
          <div className="tkt-qty-label">CANTIDAD</div>
          <div className="tkt-qty-value">
            {ticket.commercialQty}{" "}
            <span className="tkt-qty-unit">
              {UNIT_LABELS[ticket.commercialUnit] || ticket.commercialUnit}
            </span>
          </div>
        </div>

        <div className="tkt-divider" />

        {/* REFERENCES */}
        <div className="tkt-refs">
          {ticket.voucherId && (
            <div className="tkt-ref-row">
              Ref. Voucher:{" "}
              <span className="tkt-mono">
                {ticket.voucherId.substring(0, 16)}
              </span>
            </div>
          )}
          {ticket.notes && <div className="tkt-notes">Obs: {ticket.notes}</div>}
          {ticket.printCount > 0 && (
            <div className="tkt-print-count">
              Impresiones: {ticket.printCount}
              {ticket.reprintCount > 0
                ? ` (${ticket.reprintCount} reimp.)`
                : ""}
            </div>
          )}
        </div>

        {/* ═══ FOOTER ═══ */}
        <div className="tkt-footer">
          <div className="tkt-double-line" />
          <div className="tkt-copy-label">
            {copyLabels[copyIndex] || `COPIA ${copyIndex + 1}`}
          </div>
          <div className="tkt-double-line" />
          <div className="tkt-legal">Documento de control interno</div>
        </div>
      </div>
    </div>
  );

  /* ─────────────────── Render ─────────────────── */
  return (
    <>
      {/* Embedded styles — self-contained for print reliability */}
      <style>{thermalPrintStyles}</style>

      <div
        id="ticket-print-root"
        className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 overflow-y-auto"
      >
        {/* ─── Screen toolbar (hidden on print) ─── */}
        <div className="tkt-toolbar sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Vista de impresión
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {ticket.ticketNumber} — Papel térmico {PAPER_WIDTH_MM}mm ·{" "}
              {copies} copias
            </p>
          </div>
          <div className="flex items-center gap-2">
            {can("tickets.print") && (
              <button
                onClick={handlePrintClick}
                disabled={isPrinting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                <Printer size={16} />
                {isPrinting
                  ? "Procesando..."
                  : isFirstPrint
                    ? "Imprimir ticket"
                    : "Imprimir"}
              </button>
            )}
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              <Download size={16} />
              {downloading ? "Generando..." : "Descargar PDF"}
            </button>
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

        {/* ─── Screen preview: 1:1 at real paper width ─── */}
        <div className="tkt-toolbar p-4 sm:p-8 flex justify-center">
          <div>
            <div
              className="bg-white shadow-2xl border border-slate-200 overflow-hidden"
              style={{ width: `${PAPER_WIDTH_PX}px` }}
            >
              <TicketCopy copyIndex={0} />
            </div>
            <div className="mt-3 text-center space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vista previa a escala real ({PAPER_WIDTH_MM}mm) — Se imprimirán{" "}
                <b>{copies} copias</b>
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                1. Báscula/Caseta · 2. Operador de Grúa · 3. Cliente
              </p>
            </div>
          </div>
        </div>

        {/* ─── All copies for print — always in DOM, hidden on screen via CSS ─── */}
        <div ref={printAreaRef} className="tkt-copies-area">
          {Array.from({ length: copies }, (_, i) => (
            <TicketCopy key={i} copyIndex={i} />
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Data row sub-component ─── */
function DataRow({ label, value }) {
  return (
    <div className="tkt-row">
      <span className="tkt-row-label">{label}</span>
      <span className="tkt-row-dots" />
      <span className="tkt-row-value">{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CSS — Base styles shared between screen preview & print/PDF.
   ═══════════════════════════════════════════════════════════════ */
const thermalBaseStyles = `
  .tkt-body {
    font-family: Arial, Helvetica, 'Segoe UI', sans-serif;
    color: #000;
    background: #fff;
    line-height: 1.3;
  }
  .tkt-header {
    text-align: center;
    padding-bottom: 1mm;
  }
  .tkt-double-line {
    border-top: 1.5pt solid #000;
    border-bottom: 1.5pt solid #000;
    height: 2pt;
    margin: 1.5mm 0;
  }
  .tkt-logo {
    display: block;
    margin: 1.5mm auto 1mm;
    width: 12mm;
    height: 12mm;
    object-fit: contain;
  }
  .tkt-brand {
    font-size: 13pt;
    font-weight: 900;
    letter-spacing: 3pt;
    text-transform: uppercase;
  }
  .tkt-company-detail {
    font-size: 6pt;
    color: #444;
    line-height: 1.4;
  }
  .tkt-title-section {
    text-align: center;
    padding: 1.5mm 0 1mm;
  }
  .tkt-doc-title {
    font-size: 10pt;
    font-weight: 800;
    letter-spacing: 1.5pt;
  }
  .tkt-reprint-badge {
    display: inline-block;
    margin-top: 1mm;
    padding: 0.5mm 4mm;
    border: 1.5pt solid #000;
    font-size: 7pt;
    font-weight: 800;
    letter-spacing: 0.5pt;
  }
  .tkt-divider {
    border-top: 0.5pt dashed #666;
    margin: 2mm 0;
  }
  .tkt-folio-section {
    text-align: center;
    padding: 0.5mm 0;
  }
  .tkt-label {
    font-size: 6pt;
    color: #555;
    letter-spacing: 2pt;
    text-transform: uppercase;
    font-weight: 600;
  }
  .tkt-folio {
    font-size: 14pt;
    font-weight: 900;
    font-family: 'Consolas', 'Courier New', monospace;
    letter-spacing: 1pt;
    margin: 0.5mm 0;
  }
  .tkt-date {
    font-size: 7pt;
    color: #333;
  }
  .tkt-qr-section {
    text-align: center;
    padding: 2mm 0 1mm;
  }
  .tkt-qr-section svg {
    display: inline-block;
  }
  .tkt-qr-label {
    font-size: 5.5pt;
    color: #777;
    font-family: 'Consolas', 'Courier New', monospace;
    margin-top: 1mm;
  }
  .tkt-data-section {
    padding: 0.5mm 0;
  }
  .tkt-section-title {
    font-size: 6.5pt;
    font-weight: 800;
    color: #333;
    letter-spacing: 1pt;
    text-transform: uppercase;
    margin-bottom: 1mm;
    border-bottom: 0.5pt solid #ccc;
    padding-bottom: 0.5mm;
  }
  .tkt-row {
    display: flex;
    align-items: baseline;
    padding: 0.4mm 0;
    font-size: 7.5pt;
    gap: 1mm;
  }
  .tkt-row-label {
    color: #555;
    flex-shrink: 0;
    font-size: 6.5pt;
    font-weight: 600;
    min-width: 14mm;
  }
  .tkt-row-dots {
    flex: 1;
    border-bottom: 0.5pt dotted #bbb;
    margin-bottom: 1.5pt;
    min-width: 3mm;
  }
  .tkt-row-value {
    font-weight: 700;
    text-align: right;
    flex-shrink: 0;
    max-width: 38mm;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tkt-qty-box {
    border: 2pt solid #000;
    padding: 2mm 3mm;
    text-align: center;
    margin: 0.5mm 0;
  }
  .tkt-qty-label {
    font-size: 6pt;
    color: #444;
    letter-spacing: 2pt;
    text-transform: uppercase;
    font-weight: 600;
  }
  .tkt-qty-value {
    font-size: 16pt;
    font-weight: 900;
    line-height: 1.2;
  }
  .tkt-qty-unit {
    font-size: 8pt;
    font-weight: 400;
  }
  .tkt-refs {
    padding: 0.5mm 0;
    font-size: 6pt;
    color: #555;
  }
  .tkt-ref-row { margin-bottom: 0.3mm; }
  .tkt-mono {
    font-family: 'Consolas', 'Courier New', monospace;
  }
  .tkt-notes {
    font-style: italic;
    margin-bottom: 0.3mm;
  }
  .tkt-print-count {
    color: #888;
  }
  .tkt-footer {
    text-align: center;
    padding-top: 1mm;
  }
  .tkt-copy-label {
    font-size: 8pt;
    font-weight: 900;
    letter-spacing: 2pt;
    text-transform: uppercase;
    padding: 0.5mm 0;
  }
  .tkt-legal {
    font-size: 5pt;
    color: #999;
    margin-top: 0.5mm;
  }
`;

/* ═══════════════════════════════════════════════════════════════
   CSS — Print + screen layout rules.
   Screen: toolbar visible, copies area hidden. Only preview shown.
   Print: toolbar hidden, copies area visible with page breaks.
   ═══════════════════════════════════════════════════════════════ */
const thermalPrintStyles = `
  ${thermalBaseStyles}

  /* ─── Screen: hide the print copies area ─── */
  .tkt-copies-area {
    position: absolute;
    left: -9999px;
    top: 0;
    visibility: hidden;
    width: ${PAPER_WIDTH_MM}mm;
  }

  /* ─── Screen: preview copy padding ─── */
  @media screen {
    .tkt-copy {
      padding: 3mm 4mm;
    }
  }

  /* ─── Print media: 80mm thermal paper ─── */
  @media print {
    /* Reset everything */
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Page size for 80mm thermal */
    @page {
      size: ${PAPER_WIDTH_MM}mm auto;
      margin: 0;
    }

    /* Hide everything in the document except our root */
    body > * {
      display: none !important;
    }
    body > #ticket-print-root,
    #ticket-print-root {
      display: block !important;
      position: static !important;
      overflow: visible !important;
      background: white !important;
      width: ${PAPER_WIDTH_MM}mm !important;
      height: auto !important;
      inset: auto !important;
    }

    /* Hide toolbar and screen preview */
    .tkt-toolbar {
      display: none !important;
    }

    /* Show the copies area */
    .tkt-copies-area {
      position: static !important;
      left: auto !important;
      visibility: visible !important;
      width: ${PAPER_WIDTH_MM}mm !important;
    }

    /* Each copy fills a page */
    .tkt-copy {
      width: ${PAPER_WIDTH_MM}mm;
      padding: 2mm 4mm 4mm;
      box-sizing: border-box;
      page-break-after: always;
    }
    .tkt-copy:last-child {
      page-break-after: auto;
    }
  }
`;
