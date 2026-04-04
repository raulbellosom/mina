import { useEffect } from "react";
import { Printer, RotateCcw, Loader2, Clock } from "lucide-react";

const TYPE_CONFIG = {
  initial_print: {
    label: "Impresión inicial",
    icon: Printer,
    color: "text-primary-600 dark:text-primary-400",
    bg: "bg-primary-50 dark:bg-primary-900/20",
  },
  reprint: {
    label: "Reimpresión",
    icon: RotateCcw,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
};

/**
 * Panel that displays print history for a ticket.
 * Shows a timeline of print/reprint events with details.
 */
export default function PrintHistoryPanel({
  ticketId,
  printHistory = [],
  loadingHistory = false,
  fetchPrintHistory,
}) {
  useEffect(() => {
    if (ticketId && fetchPrintHistory) {
      fetchPrintHistory(ticketId);
    }
  }, [ticketId, fetchPrintHistory]);

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        <span className="ml-2 text-sm text-slate-400">
          Cargando historial...
        </span>
      </div>
    );
  }

  if (printHistory.length === 0) {
    return (
      <div className="text-center py-6">
        <Printer
          size={24}
          className="mx-auto text-slate-300 dark:text-slate-700 mb-2"
        />
        <p className="text-sm text-slate-400">Sin impresiones registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Historial de impresión ({printHistory.length})
      </h4>
      <div className="space-y-2">
        {printHistory.map((log) => {
          const config =
            TYPE_CONFIG[log.printType] || TYPE_CONFIG.initial_print;
          const Icon = config.icon;

          return (
            <div
              key={log.$id}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800"
            >
              <div
                className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}
              >
                <Icon size={14} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-semibold ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {log.copiesCount}{" "}
                    {log.copiesCount === 1 ? "copia" : "copias"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock size={10} />
                  {new Date(log.$createdAt).toLocaleString("es-MX", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {log.printedByName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Por: {log.printedByName}
                  </p>
                )}
                {log.reason && (
                  <div className="mt-1.5 px-2 py-1 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      <span className="font-medium">Motivo:</span> {log.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
