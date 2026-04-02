import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";

/**
 * Reusable export button with permission control.
 *
 * @param {Object} props
 * @param {string} props.permission — permission code required (e.g. 'reports.export')
 * @param {Function} props.onExport — async function to call when export is triggered
 * @param {string} [props.label] — button text (default: 'Exportar CSV')
 * @param {boolean} [props.disabled] — force disabled state
 * @param {string} [props.className] — extra CSS classes
 */
export default function ExportButton({
  permission,
  onExport,
  label = "Exportar CSV",
  disabled = false,
  className = "",
}) {
  const { can } = usePermissions();
  const [exporting, setExporting] = useState(false);

  if (!can(permission)) return null;

  const handleClick = async () => {
    if (exporting || disabled) return;
    setExporting(true);
    try {
      await onExport();
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={exporting || disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-colors ${className}`}
    >
      {exporting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      {label}
    </button>
  );
}
