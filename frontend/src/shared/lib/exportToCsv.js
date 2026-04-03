import { databases, DATABASE_ID } from "./appwrite";
import { ID } from "appwrite";

/**
 * Reusable CSV export utility for MinaFlow.
 *
 * @param {Object} options
 * @param {string} options.filename — name of the downloaded file (without .csv)
 * @param {string[]} options.headers — column header labels
 * @param {Array<Array<string|number>>} options.rows — 2D array of cell values
 * @param {Object} [options.audit] — if provided, logs the export to audit_logs
 * @param {string} options.audit.action — e.g. 'export.reports_csv'
 * @param {string} options.audit.collection — source collection name
 * @param {string} options.audit.userId — the exporting user's ID
 * @param {Object} [options.audit.details] — extra details to log
 * @param {number} [options.maxRows=5000] — max rows to export
 * @returns {boolean} — true if export succeeded
 */
export async function exportToCsv({
  filename,
  headers,
  rows,
  audit,
  maxRows = 5000,
  truncated = false,
}) {
  try {
    const limited = rows.slice(0, maxRows);

    const escape = (val) => {
      const s = String(val ?? "");
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? '"' + s.replace(/"/g, '""') + '"'
        : s;
    };

    const headerLine = headers.map(escape).join(",");
    const dataLines = limited.map((row) => row.map(escape).join(","));

    // Add metadata footer
    const footerLines = [];
    footerLines.push("");
    footerLines.push(`Total registros:,${limited.length}`);
    if (truncated) {
      footerLines.push(
        `AVISO:,Exportación limitada a ${maxRows} registros. Ajuste los filtros para datos más específicos.`,
      );
    }

    const csv =
      "\uFEFF" +
      headerLine +
      "\n" +
      dataLines.join("\n") +
      "\n" +
      footerLines.join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    // Log to audit if requested
    if (audit?.userId) {
      try {
        await databases.createDocument(DATABASE_ID, "audit_logs", ID.unique(), {
          action: audit.action || "export.csv",
          collection: audit.collection || "unknown",
          docId: "bulk_export",
          userId: audit.userId,
          details: JSON.stringify({
            rowCount: limited.length,
            filename: link.download,
            ...audit.details,
          }),
        });
      } catch (err) {
        console.warn("Audit log for export failed:", err.message);
      }
    }

    return true;
  } catch (err) {
    console.error("Error en exportación CSV:", err);
    return false;
  }
}
