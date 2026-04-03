import { useState, useEffect } from "react";
import { Settings, Save, Loader2 } from "lucide-react";
import { databases, DATABASE_ID } from "../../../shared/lib/appwrite";
import { useToast } from "../../../shared/components/Toast";

const COLLECTION = "system_config";
const DOC_ID = "singleton";

const DEFAULTS = {
  companyName: "",
  companyAddress: "",
  companyPhone: "",
  defaultWeightUnit: "ton",
  ticketPrefix: "MF",
};

export default function Configuracion() {
  const toast = useToast();
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const doc = await databases.getDocument(DATABASE_ID, COLLECTION, DOC_ID);
      setForm({
        companyName: doc.companyName || "",
        companyAddress: doc.companyAddress || "",
        companyPhone: doc.companyPhone || "",
        defaultWeightUnit: doc.defaultWeightUnit || "ton",
        ticketPrefix: doc.ticketPrefix || "MF",
      });
    } catch (err) {
      if (err.code === 404) {
        setForm(DEFAULTS);
      } else {
        console.error("Error loading config:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await databases.updateDocument(DATABASE_ID, COLLECTION, DOC_ID, {
        companyName: form.companyName,
        companyAddress: form.companyAddress,
        companyPhone: form.companyPhone,
        defaultWeightUnit: form.defaultWeightUnit,
        ticketPrefix: form.ticketPrefix,
      });
      setSaved(true);
    } catch (err) {
      console.error("Error saving config:", err);
      toast({ type: "error", message: "Error al guardar la configuración" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Configuración General
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Parámetros globales del sistema y preferencias operativas.
        </p>
      </header>

      <form
        onSubmit={handleSave}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Settings size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Datos de la empresa
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nombre de la empresa / mina
            </label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej. Mina El Progreso"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Teléfono
            </label>
            <input
              type="text"
              value={form.companyPhone}
              onChange={(e) => handleChange("companyPhone", e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej. (614) 555-0123"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Dirección
          </label>
          <input
            type="text"
            value={form.companyAddress}
            onChange={(e) => handleChange("companyAddress", e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dirección completa"
          />
        </div>

        <hr className="border-slate-200 dark:border-slate-700" />

        <div className="flex items-center gap-2 mb-4">
          <Settings size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Operación
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Unidad de peso por defecto
            </label>
            <select
              value={form.defaultWeightUnit}
              onChange={(e) =>
                handleChange("defaultWeightUnit", e.target.value)
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="kg">Kilogramos (kg)</option>
              <option value="ton">Toneladas (ton)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Prefijo de tickets
            </label>
            <input
              type="text"
              value={form.ticketPrefix}
              onChange={(e) =>
                handleChange("ticketPrefix", e.target.value.toUpperCase())
              }
              maxLength={10}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="MF"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Guardar
          </button>
          {saved && (
            <span className="text-sm text-green-600 dark:text-green-400">
              Configuración guardada correctamente.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
