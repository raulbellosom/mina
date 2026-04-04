import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Loader2,
  Palette,
  Check,
  ChevronRight,
} from "lucide-react";
import { databases, DATABASE_ID, APP_IDS } from "../../../shared/lib/appwrite";
import { useToast } from "../../../shared/components/Toast";
import { useTheme } from "../../../shared/context/ThemeContext";
import PALETTES from "../../../shared/config/palettes";
import SearchableSelect from "../../../shared/components/SearchableSelect";

const COLLECTION = APP_IDS.collections.SYSTEM_CONFIG;
const DOC_ID = APP_IDS.docs.SYSTEM_CONFIG_SINGLETON;

const DEFAULTS = {
  companyName: "",
  companyAddress: "",
  companyPhone: "",
  defaultWeightUnit: "ton",
  ticketPrefix: "MF",
  colorTheme: "",
};

export default function Configuracion() {
  const toast = useToast();
  const { paletteId, setPaletteId } = useTheme();
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
        colorTheme: doc.colorTheme || "",
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
        colorTheme: form.colorTheme || null,
      });
      // Apply palette globally
      if (form.colorTheme) {
        setPaletteId(form.colorTheme);
      }
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
        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
          <span>Administración</span>
          <ChevronRight size={14} />
          <span className="text-slate-900 dark:text-slate-100">
            Configuración
          </span>
        </div>
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
          <Settings size={20} className="text-primary-600" />
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
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Dirección completa"
          />
        </div>

        <hr className="border-slate-200 dark:border-slate-700" />

        <div className="flex items-center gap-2 mb-4">
          <Settings size={20} className="text-primary-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Operación
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Unidad de peso por defecto
            </label>
            <SearchableSelect
              value={form.defaultWeightUnit}
              onChange={(v) => handleChange("defaultWeightUnit", v)}
              options={[
                { value: "kg", label: "Kilogramos (kg)" },
                { value: "ton", label: "Toneladas (ton)" },
              ]}
              placeholder="Unidad de peso"
            />
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
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="MF"
            />
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-700" />

        <div className="flex items-center gap-2 mb-4">
          <Palette size={20} className="text-primary-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Tema de color
          </h2>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2 mb-4">
          Selecciona la paleta de colores para toda la plataforma. El cambio se
          aplica para todos los usuarios.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PALETTES.map((p) => {
            const selected = form.colorTheme === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  handleChange("colorTheme", p.id);
                  // Live preview
                  setPaletteId(p.id);
                }}
                className={`relative rounded-xl border-2 p-3 transition-all text-left ${
                  selected
                    ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 ring-1 ring-primary-500/30"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {selected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
                {/* Color swatches */}
                <div className="flex gap-1 mb-2.5">
                  {[400, 500, 600, 700].map((shade) => (
                    <div
                      key={shade}
                      className="w-6 h-6 rounded-md first:rounded-l-lg last:rounded-r-lg"
                      style={{ backgroundColor: p.colors[shade] }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
