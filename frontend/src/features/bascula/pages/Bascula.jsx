import { useState, useEffect, useCallback } from "react";
import {
  Scale,
  Search,
  X,
  Loader2,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  Package,
  User,
  MapPin,
  Hash,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useBascula } from "../hooks/useBascula";
import { usePermissions } from "../../../shared/hooks/usePermissions";

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_LABELS = {
  issued: "Emitido",
  ready_to_print: "Listo para imprimir",
  printed: "Impreso",
  loading: "En carga",
  loaded: "Cargado",
  pending_exit_validation: "Pendiente de salida",
  completed: "Completado",
  cancelled: "Cancelado",
  rejected: "Rechazado",
  blocked: "Bloqueado",
};

const STATUS_COLORS = {
  issued: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  ready_to_print:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  printed:
    "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400",
  loading:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  loaded:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  pending_exit_validation:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  completed:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  blocked: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const ACTIVE_STATES = [
  "issued",
  "ready_to_print",
  "printed",
  "loading",
  "loaded",
];

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || STATUS_COLORS.issued}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ─── Weight Log Entry ────────────────────────────────────────────────────────

function WeightLogEntry({ log }) {
  const isEntry = log.type === "entry";
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg ${isEntry ? "bg-primary-50 dark:bg-primary-900/20" : "bg-green-50 dark:bg-green-900/20"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isEntry ? "bg-primary-100 dark:bg-primary-900/40" : "bg-green-100 dark:bg-green-900/40"}`}
      >
        <Scale
          size={14}
          className={
            isEntry
              ? "text-primary-600 dark:text-primary-400"
              : "text-green-600 dark:text-green-400"
          }
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-sm font-semibold ${isEntry ? "text-primary-700 dark:text-primary-300" : "text-green-700 dark:text-green-300"}`}
          >
            {isEntry ? "Peso de entrada" : "Peso de salida"}
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {log.weight} {log.unit}
          </span>
        </div>
        {log.operatorName && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operador: {log.operatorName}
          </p>
        )}
        {log.notes && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {log.notes}
          </p>
        )}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          {new Date(log.$createdAt).toLocaleString("es-MX", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </p>
      </div>
    </div>
  );
}

// ─── Ticket Summary Card ─────────────────────────────────────────────────────

function TicketCard({ ticket, onClick, selected }) {
  const canWork = ACTIVE_STATES.includes(ticket.status);
  return (
    <button
      onClick={() => canWork && onClick(ticket)}
      disabled={!canWork}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        selected
          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500"
          : canWork
            ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer"
            : "border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50 opacity-60 cursor-default"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
            {ticket.ticketNumber}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {ticket.type === "counter" ? "Venta mostrador" : "Vale prepago"}
          </p>
        </div>
        <StatusBadge status={ticket.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
        {ticket.commercialQty && (
          <span className="flex items-center gap-1">
            <Package size={11} />
            {ticket.commercialQty} {ticket.commercialUnit}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {new Date(ticket.$createdAt).toLocaleDateString("es-MX")}
        </span>
      </div>
    </button>
  );
}

// ─── Weight Registration Form ────────────────────────────────────────────────

function WeightForm({ type, onSubmit, submitting, disabled }) {
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("ton");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(weight, unit, notes);
    setWeight("");
    setNotes("");
  };

  const isEntry = type === "entry";
  const labelCls =
    "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
  const inputCls =
    "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>
            Peso {isEntry ? "de entrada" : "de salida"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0.000"
            required
            disabled={disabled}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Unidad</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            disabled={disabled}
            className={`${inputCls} bg-white dark:bg-slate-800`}
          >
            <option value="ton">ton</option>
            <option value="kg">kg</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Observaciones</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas del pesaje (opcional)"
          disabled={disabled}
          className={inputCls}
        />
      </div>
      <button
        type="submit"
        disabled={submitting || disabled || !weight}
        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isEntry
            ? "bg-primary-600 hover:bg-primary-700 text-white"
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
      >
        {submitting && <Loader2 size={14} className="animate-spin" />}
        Registrar peso {isEntry ? "de entrada" : "de salida"}
      </button>
    </form>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Bascula() {
  const { can } = usePermissions();
  const {
    operations,
    loading,
    filterStatus,
    setFilterStatus,
    fetchOperations,
    searchResult,
    searchLoading,
    searchError,
    searchTicket,
    clearSearch,
    registerEntryWeight,
    registerExitWeight,
    fetchWeightLogs,
    refreshTicket,
  } = useBascula();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [weightLogs, setWeightLogs] = useState([]);
  const [weightLogsLoading, setWeightLogsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const canView = can("bascula.view");
  const canRegisterWeight = can("bascula.register_weight");

  // Load operations on mount and when filter changes
  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  // Load weight logs when a ticket is selected
  useEffect(() => {
    if (!selectedTicket) {
      setWeightLogs([]);
      return;
    }
    setWeightLogsLoading(true);
    fetchWeightLogs(selectedTicket.$id)
      .then((logs) => setWeightLogs(logs))
      .finally(() => setWeightLogsLoading(false));
  }, [selectedTicket?.$id]);

  // When searchResult changes, auto-select it
  useEffect(() => {
    if (searchResult) {
      setSelectedTicket(searchResult);
    }
  }, [searchResult]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    await searchTicket(searchQuery.trim());
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setActionError(null);
    setActionSuccess(null);
  };

  const showMessage = (msg, isError = false) => {
    if (isError) {
      setActionError(msg);
      setActionSuccess(null);
    } else {
      setActionSuccess(msg);
      setActionError(null);
    }
    setTimeout(() => {
      setActionError(null);
      setActionSuccess(null);
    }, 5000);
  };

  const handleEntryWeight = async (weight, unit, notes) => {
    setSubmitting(true);
    setActionError(null);
    try {
      const result = await registerEntryWeight(
        selectedTicket.$id,
        weight,
        unit,
        notes,
      );
      if (result.offline) {
        showMessage(
          `⚠️ Peso de entrada guardado localmente (${weight} ${unit}). Se sincronizará al restaurar conexión.`,
        );
      } else {
        const refreshed = await refreshTicket(selectedTicket.$id);
        if (refreshed) setSelectedTicket(refreshed);
        const logs = await fetchWeightLogs(selectedTicket.$id);
        setWeightLogs(logs);
        showMessage(`Peso de entrada registrado: ${weight} ${unit}`);
      }
    } catch (err) {
      showMessage(err.message || "Error al registrar peso de entrada", true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExitWeight = async (weight, unit, notes) => {
    setSubmitting(true);
    setActionError(null);
    try {
      const result = await registerExitWeight(
        selectedTicket.$id,
        weight,
        unit,
        notes,
      );
      if (result.offline) {
        showMessage(
          `⚠️ Peso de salida guardado localmente (${weight} ${unit}). Se sincronizará al restaurar conexión.`,
        );
      } else {
        const refreshed = await refreshTicket(selectedTicket.$id);
        if (refreshed) setSelectedTicket(refreshed);
        const logs = await fetchWeightLogs(selectedTicket.$id);
        setWeightLogs(logs);
        showMessage(
          `Báscula completada. Neto: ${result.netWeight} ${result.unit}. Ticket avanzado a validación de salida.`,
        );
      }
    } catch (err) {
      showMessage(err.message || "Error al registrar peso de salida", true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedTicket(null);
    clearSearch();
    setSearchQuery("");
    setActionError(null);
    setActionSuccess(null);
  };

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 animate-in fade-in duration-500">
        <Scale size={48} className="text-slate-300 dark:text-slate-700" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
            Acceso Denegado
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            No tienes permiso para acceder al módulo de báscula.
          </p>
        </div>
      </div>
    );
  }

  // Determine which weight form to show based on current ticket status
  const showEntryForm =
    selectedTicket &&
    ACTIVE_STATES.includes(selectedTicket.status) &&
    selectedTicket.status !== "loading" &&
    selectedTicket.status !== "loaded";
  const showExitForm = selectedTicket && selectedTicket.status === "loading";
  const ticketCompleted =
    selectedTicket &&
    [
      "pending_exit_validation",
      "completed",
      "cancelled",
      "rejected",
      "blocked",
    ].includes(selectedTicket.status);

  const entryWeight = parseFloat(selectedTicket?.weightIn) || 0;
  const exitWeight = parseFloat(selectedTicket?.weightOut) || 0;
  const tara = parseFloat(selectedTicket?.tare) || 0;
  const netWeight = parseFloat(selectedTicket?.netWeight) || 0;

  const FILTER_OPTIONS = [
    { value: "active", label: "Activos" },
    { value: "pending", label: "Pend. salida" },
    { value: "all", label: "Todos" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <header>
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
            <span>Operación</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 dark:text-slate-100">Báscula</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Scale size={24} className="text-primary-500" />
            Báscula
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Registro de pesos y control operativo de cargas
          </p>
        </header>
        <button
          onClick={() => fetchOperations()}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {/* Messages */}
      {actionError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">
            {actionError}
          </p>
        </div>
      )}
      {actionSuccess && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
          <p className="text-sm text-green-700 dark:text-green-400">
            {actionSuccess}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Operations List ─────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Search size={15} />
              Buscar operación
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Folio de ticket o placas..."
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={searchLoading || !searchQuery.trim()}
                className="px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {searchLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Search size={15} />
                )}
              </button>
            </form>
            {searchError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                {searchError}
              </p>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  filterStatus === opt.value
                    ? "bg-primary-600 text-white"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Ticket list */}
          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            ) : operations.length === 0 ? (
              <div className="text-center py-8">
                <Scale
                  size={32}
                  className="mx-auto text-slate-300 dark:text-slate-700 mb-2"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Sin operaciones
                </p>
              </div>
            ) : (
              operations.map((ticket) => (
                <TicketCard
                  key={ticket.$id}
                  ticket={ticket}
                  onClick={handleSelectTicket}
                  selected={selectedTicket?.$id === ticket.$id}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right: Operation Detail & Weight Entry ────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedTicket ? (
            <div className="flex flex-col items-center justify-center min-h-64 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <Scale
                size={40}
                className="text-slate-300 dark:text-slate-700 mb-3"
              />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Selecciona una operación
              </p>
              <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">
                Busca por folio o elige de la lista
              </p>
            </div>
          ) : (
            <>
              {/* Ticket info header */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                        {selectedTicket.ticketNumber}
                      </h2>
                      <StatusBadge status={selectedTicket.status} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedTicket.type === "counter"
                        ? "Venta en mostrador"
                        : "Vale prepago"}{" "}
                      ·{" "}
                      {new Date(selectedTicket.$createdAt).toLocaleString(
                        "es-MX",
                        { dateStyle: "medium", timeStyle: "short" },
                      )}
                    </p>
                  </div>
                  <button
                    onClick={handleClearSelection}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Package
                      size={14}
                      className="text-slate-400 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Cantidad comercial
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {selectedTicket.commercialQty}{" "}
                        {selectedTicket.commercialUnit}
                      </p>
                    </div>
                  </div>
                  {selectedTicket.weightIn > 0 && (
                    <div className="flex items-start gap-2">
                      <Scale
                        size={14}
                        className="text-primary-400 mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Peso entrada
                        </p>
                        <p className="font-medium text-primary-700 dark:text-primary-400">
                          {entryWeight} {selectedTicket.weightUnit || "ton"}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedTicket.weightOut > 0 && (
                    <div className="flex items-start gap-2">
                      <Scale
                        size={14}
                        className="text-green-400 mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Peso salida
                        </p>
                        <p className="font-medium text-green-700 dark:text-green-400">
                          {exitWeight} {selectedTicket.weightUnit || "ton"}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedTicket.netWeight > 0 && (
                    <div className="flex items-start gap-2">
                      <ChevronRight
                        size={14}
                        className="text-slate-400 mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Peso neto
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {netWeight} {selectedTicket.weightUnit || "ton"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Neto warning */}
                {tara < 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                    <AlertTriangle size={13} />
                    Peso neto negativo detectado — verificar registros de pesaje
                  </div>
                )}

                {/* Completed state message */}
                {ticketCompleted && (
                  <div
                    className={`mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                      selectedTicket.status === "pending_exit_validation"
                        ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                        : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    }`}
                  >
                    <CheckCircle2 size={15} />
                    {selectedTicket.status === "pending_exit_validation"
                      ? "Operación de báscula completada — pendiente de validación de salida"
                      : `Operación ${STATUS_LABELS[selectedTicket.status]?.toLowerCase()}`}
                  </div>
                )}
              </div>

              {/* Weight registration */}
              {canRegisterWeight && (showEntryForm || showExitForm) && (
                <div
                  className={`bg-white dark:bg-slate-900 rounded-xl border p-5 ${
                    showEntryForm
                      ? "border-primary-200 dark:border-primary-800"
                      : "border-green-200 dark:border-green-800"
                  }`}
                >
                  <h3
                    className={`text-sm font-semibold mb-4 flex items-center gap-2 ${
                      showEntryForm
                        ? "text-primary-700 dark:text-primary-400"
                        : "text-green-700 dark:text-green-400"
                    }`}
                  >
                    <Scale size={15} />
                    {showEntryForm
                      ? "Registrar peso de entrada (camión vacío)"
                      : "Registrar peso de salida (camión cargado)"}
                  </h3>
                  <WeightForm
                    type={showEntryForm ? "entry" : "exit"}
                    onSubmit={
                      showEntryForm ? handleEntryWeight : handleExitWeight
                    }
                    submitting={submitting}
                    disabled={submitting}
                  />
                  {showExitForm && entryWeight > 0 && (
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      Peso de entrada registrado:{" "}
                      <strong>
                        {entryWeight} {selectedTicket.weightUnit || "ton"}
                      </strong>{" "}
                      — el neto se calculará automáticamente
                    </p>
                  )}
                </div>
              )}

              {!canRegisterWeight && (showEntryForm || showExitForm) && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle
                    size={16}
                    className="text-amber-500 shrink-0"
                  />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    No tienes permiso para registrar pesos en esta operación
                  </p>
                </div>
              )}

              {/* Weight history */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Scale size={15} />
                  Historial de pesajes
                </h3>
                {weightLogsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2
                      size={20}
                      className="animate-spin text-slate-400"
                    />
                  </div>
                ) : weightLogs.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-600 text-center py-4">
                    Sin registros de pesaje aún
                  </p>
                ) : (
                  <div className="space-y-2">
                    {weightLogs.map((log) => (
                      <WeightLogEntry key={log.$id} log={log} />
                    ))}

                    {/* Net weight summary */}
                    {weightLogs.length === 2 && netWeight !== 0 && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <ArrowRight size={13} />
                            Peso neto calculado
                          </span>
                          <span
                            className={`font-bold text-base ${netWeight < 0 ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}
                          >
                            {netWeight} {selectedTicket.weightUnit || "ton"}
                            {netWeight < 0 && " ⚠"}
                          </span>
                        </div>
                        <div className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                          {exitWeight} − {entryWeight} = {tara}{" "}
                          {selectedTicket.weightUnit || "ton"}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Observations */}
              {selectedTicket.scaleNotes && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Observaciones del operador
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                    {selectedTicket.scaleNotes}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
