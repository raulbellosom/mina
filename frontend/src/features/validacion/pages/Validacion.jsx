import { useState, useEffect, useRef, useCallback } from "react";
import {
  QrCode,
  Keyboard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Camera,
  CameraOff,
  SwitchCamera,
  ShieldAlert,
  Package,
  Truck,
  User,
  MapPin,
  Scale,
  Hash,
  Clock,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useValidacion } from "../hooks/useValidacion";
import { usePermissions } from "../../../shared/hooks/usePermissions";

// ─── QR Scanner using html5-qrcode (cross-browser) ──────────────────────────

const SCANNER_REGION_ID = "qr-scanner-region";

function QrScannerCamera({ onResult, active }) {
  const scannerRef = useRef(null);
  const mountedRef = useRef(true);
  const [status, setStatus] = useState("idle"); // idle | requesting | scanning | denied | error
  const [errorMsg, setErrorMsg] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [activeCameraIdx, setActiveCameraIdx] = useState(0);

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        // 2 = SCANNING, 3 = PAUSED
        if (state === 2 || state === 3) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      }
    } catch {
      /* ignore cleanup errors */
    }
    scannerRef.current = null;
    if (mountedRef.current) setStatus("idle");
  }, []);

  const startScanner = useCallback(
    async (cameraIndex) => {
      // Clean up any previous instance
      await stopScanner();

      if (!mountedRef.current) return;
      setStatus("requesting");
      setErrorMsg(null);

      try {
        // Check for camera API support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setStatus("error");
          setErrorMsg(
            "Tu dispositivo no soporta acceso a cámara. Usa captura manual.",
          );
          return;
        }

        // Enumerate cameras
        let deviceList = cameras;
        if (deviceList.length === 0) {
          try {
            deviceList = await Html5Qrcode.getCameras();
          } catch {
            // On first denial, getCameras throws
            setStatus("denied");
            setErrorMsg(
              "Se necesita permiso de cámara para escanear códigos QR.",
            );
            return;
          }
          if (!mountedRef.current) return;
          setCameras(deviceList);
        }

        if (deviceList.length === 0) {
          setStatus("error");
          setErrorMsg("No se detectaron cámaras en este dispositivo.");
          return;
        }

        const idx = cameraIndex ?? 0;
        const cameraId = deviceList[idx]?.id;

        // Prefer facingMode on mobile for more reliable camera access
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const cameraConfig = isMobile
          ? { facingMode: idx === 0 ? "environment" : "user" }
          : cameraId;

        const scanner = new Html5Qrcode(SCANNER_REGION_ID, {
          verbose: false,
        });
        scannerRef.current = scanner;

        // Responsive qrbox: 60% of container width, clamped 150–250px
        const containerEl = document.getElementById(SCANNER_REGION_ID);
        const containerW = containerEl?.clientWidth || 300;
        const qrSide = Math.max(150, Math.min(250, Math.floor(containerW * 0.6)));

        await scanner.start(
          cameraConfig,
          {
            fps: 10,
            qrbox: { width: qrSide, height: qrSide },
          },
          (decodedText) => {
            // Success callback — stop and report
            stopScanner();
            onResult(decodedText);
          },
          () => {
            /* ignore scan failures (no QR in frame) */
          },
        );

        if (mountedRef.current) setStatus("scanning");
      } catch (err) {
        if (!mountedRef.current) return;
        if (
          err?.name === "NotAllowedError" ||
          err?.message?.includes("Permission")
        ) {
          setStatus("denied");
          setErrorMsg(
            "Permiso de cámara denegado. Otorga acceso en la configuración de tu navegador.",
          );
        } else {
          setStatus("error");
          setErrorMsg(
            err?.message || "No se pudo iniciar el escáner de cámara.",
          );
        }
      }
    },
    [cameras, onResult, stopScanner],
  );

  // Switch camera (front/back)
  const switchCamera = useCallback(async () => {
    if (cameras.length < 2) return;
    const next = (activeCameraIdx + 1) % cameras.length;
    setActiveCameraIdx(next);
    await startScanner(next);
  }, [cameras, activeCameraIdx, startScanner]);

  // Retry after denial (re-trigger permission prompt)
  const retryPermission = useCallback(async () => {
    setCameras([]); // Reset camera list to force re-prompt
    setActiveCameraIdx(0);
    await startScanner(0);
  }, [startScanner]);

  // Start/stop based on active prop
  useEffect(() => {
    mountedRef.current = true;
    if (active) {
      startScanner(activeCameraIdx);
    } else {
      stopScanner();
    }
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [active]);

  // ── Permission denied view ──
  if (status === "denied") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
        <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
          <ShieldAlert
            size={28}
            className="text-amber-600 dark:text-amber-400"
          />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Permiso de cámara requerido
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 max-w-xs">
            {errorMsg}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
          <button
            onClick={retryPermission}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            <Camera size={16} />
            Otorgar permiso
          </button>
        </div>
        <p className="text-[11px] text-amber-500 dark:text-amber-500/70 text-center max-w-xs leading-relaxed">
          Si el permiso fue denegado permanentemente, abre la configuración de
          tu navegador → Permisos del sitio → Cámara → Permitir, y recarga la
          página.
        </p>
      </div>
    );
  }

  // ── Error view ──
  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <CameraOff size={32} className="text-slate-400" />
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          {errorMsg}
        </p>
        <button
          onClick={() => startScanner(activeCameraIdx)}
          className="text-xs text-primary-600 dark:text-primary-400 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ── Requesting permission / loading ──
  if (status === "requesting") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <Loader2 size={32} className="animate-spin text-primary-500" />
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          Solicitando acceso a la cámara…
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          Acepta el permiso en el diálogo de tu navegador
        </p>
      </div>
    );
  }

  // ── Scanner active / idle ──
  return (
    <div className="relative rounded-xl overflow-hidden bg-black">
      {/* Force html5-qrcode internal video to be visible and fill container */}
      <style>{`
        #${SCANNER_REGION_ID} video {
          width: 100% !important;
          height: auto !important;
          object-fit: cover;
          display: block !important;
        }
        #${SCANNER_REGION_ID} img[alt="Scanner Paused"] {
          display: none !important;
        }
      `}</style>
      {/* html5-qrcode renders the video + canvas inside this div */}
      <div
        id={SCANNER_REGION_ID}
        className="w-full"
        style={{ minHeight: "280px" }}
      />

      {/* Camera switch button — only if >1 camera */}
      {status === "scanning" && cameras.length > 1 && (
        <button
          onClick={switchCamera}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
          title="Cambiar cámara"
        >
          <SwitchCamera size={18} />
        </button>
      )}

      {/* Instruction overlay */}
      {status === "scanning" && (
        <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
          <span className="text-xs text-white/90 bg-black/50 px-3 py-1.5 rounded-full">
            Apunta la cámara al código QR del ticket
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Ticket Result Card ───────────────────────────────────────────────────────

function TicketResultCard({ ticket, valid, reason }) {
  const isAlreadyCompleted = !valid && ticket?.status === "completed";

  const statusColor = valid
    ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
    : isAlreadyCompleted
      ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20"
      : "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20";

  const StatusIcon = valid
    ? CheckCircle2
    : isAlreadyCompleted
      ? AlertTriangle
      : XCircle;

  const iconColor = valid
    ? "text-green-500"
    : isAlreadyCompleted
      ? "text-amber-500"
      : "text-red-500";

  const textColor = valid
    ? "text-green-700 dark:text-green-400"
    : isAlreadyCompleted
      ? "text-amber-700 dark:text-amber-400"
      : "text-red-700 dark:text-red-400";

  const statusLabel = valid
    ? "Salida válida"
    : isAlreadyCompleted
      ? "Ticket ya utilizado"
      : "Salida no válida";

  return (
    <div className={`rounded-xl border-2 p-5 ${statusColor}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <StatusIcon size={20} className={`${iconColor} shrink-0`} />
            <span className={`text-base font-bold ${textColor}`}>
              {statusLabel}
            </span>
          </div>
          {reason && (
            <p
              className={`text-sm mt-1 ml-7 ${isAlreadyCompleted ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}
            >
              {reason}
            </p>
          )}
        </div>
        <span className="text-xs font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
          {ticket.ticketNumber}
        </span>
      </div>

      {/* Ticket details grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <Package size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cant. comercial
            </p>
            <p className="font-medium text-slate-900 dark:text-white">
              {ticket.commercialQty} {ticket.commercialUnit}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Hash size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tipo</p>
            <p className="font-medium text-slate-900 dark:text-white">
              {ticket.type === "counter" ? "Venta mostrador" : "Vale prepago"}
            </p>
          </div>
        </div>
        {ticket.netWeight > 0 && (
          <div className="flex items-start gap-2">
            <Scale size={14} className="text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Peso neto
              </p>
              <p className="font-medium text-slate-900 dark:text-white">
                {ticket.netWeight} {ticket.weightUnit || "ton"}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-2">
          <Clock size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Emitido
            </p>
            <p className="font-medium text-slate-900 dark:text-white">
              {new Date(ticket.$createdAt).toLocaleString("es-MX", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── History Row ──────────────────────────────────────────────────────────────

const RESULT_COLORS = {
  approved:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  blocked:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const RESULT_LABELS = {
  approved: "Aprobada",
  rejected: "Rechazada",
  blocked: "Bloqueada",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Validacion() {
  const { can } = usePermissions();
  const {
    history,
    historyLoading,
    filterResult,
    setFilterResult,
    fetchHistory,
    lookupTicket,
    approveExit,
    rejectExit,
  } = useValidacion();

  const canView = can("exit.view");
  const canValidate = can("exit.validate");
  const canReject = can("exit.reject");

  // Mode: 'scan' | 'manual'
  const [mode, setMode] = useState("scan");
  const [cameraActive, setCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState("");

  // Lookup state
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null); // { ticket, valid, blocked, reason, method }
  const [lookupError, setLookupError] = useState(null);

  // Action state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null); // { success, message }
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // History tab
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (showHistory) fetchHistory();
  }, [showHistory, fetchHistory]);

  useEffect(() => {
    if (mode === "scan" && !lookupResult && !actionResult) {
      setCameraActive(true);
    } else {
      setCameraActive(false);
    }
  }, [mode, lookupResult, actionResult]);

  const handleQrResult = async (value) => {
    setCameraActive(false);
    await performLookup(value, "qr_scan");
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    await performLookup(manualInput.trim(), "manual_entry");
  };

  const performLookup = async (query, method) => {
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);
    setActionResult(null);
    setShowRejectForm(false);
    try {
      const result = await lookupTicket(query, method);
      setLookupResult({ ...result, method });
    } catch (err) {
      setLookupError(err.message || "Error al buscar el ticket");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!lookupResult?.ticket) return;
    setActionLoading(true);
    try {
      const result = await approveExit(
        lookupResult.ticket,
        lookupResult.method || "manual_entry",
      );
      if (result?.offline) {
        setActionResult({
          success: true,
          message:
            "⚠️ Salida aprobada localmente. Se sincronizará al restaurar conexión.",
        });
      } else {
        setActionResult({
          success: true,
          message:
            "¡Salida aprobada! El ticket ha sido marcado como completado.",
        });
      }
      setLookupResult(null);
    } catch (err) {
      setActionResult({
        success: false,
        message: err.message || "Error al aprobar la salida",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!lookupResult?.ticket || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const result = await rejectExit(
        lookupResult.ticket,
        rejectReason,
        lookupResult.method || "manual_entry",
      );
      if (result?.offline) {
        setActionResult({
          success: false,
          message: `⚠️ Rechazo guardado localmente. Se sincronizará al restaurar conexión.`,
        });
      } else {
        setActionResult({
          success: false,
          message: `Salida rechazada. Motivo: ${rejectReason}`,
        });
      }
      setLookupResult(null);
      setShowRejectForm(false);
      setRejectReason("");
    } catch (err) {
      setActionResult({
        success: false,
        message: err.message || "Error al rechazar la salida",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const resetAll = () => {
    setLookupResult(null);
    setLookupError(null);
    setActionResult(null);
    setShowRejectForm(false);
    setRejectReason("");
    setManualInput("");
    if (mode === "scan") setCameraActive(true);
  };

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 animate-in fade-in duration-500">
        <QrCode size={48} className="text-slate-300 dark:text-slate-700" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
            Acceso Denegado
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            No tienes permiso para acceder a validación de salida.
          </p>
        </div>
      </div>
    );
  }

  const FILTER_OPTIONS = [
    { value: "all", label: "Todas" },
    { value: "approved", label: "Aprobadas" },
    { value: "rejected", label: "Rechazadas" },
    { value: "blocked", label: "Bloqueadas" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <header>
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
            <span>Operación</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 dark:text-slate-100">
              Validación de Salida
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode size={24} className="text-primary-500" />
            Validación de Salida
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Escanea el QR del ticket o captura el folio para autorizar la salida
          </p>
        </header>
        <button
          onClick={() => setShowHistory((h) => !h)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors self-start sm:self-auto ${
            showHistory
              ? "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
              : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <Clock size={14} />
          {showHistory ? "Ocultar historial" : "Ver historial"}
        </button>
      </div>

      {/* Action result banner */}
      {actionResult && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border ${
            actionResult.success
              ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
              : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
          }`}
        >
          {actionResult.success ? (
            <CheckCircle2
              size={18}
              className="text-green-500 shrink-0 mt-0.5"
            />
          ) : (
            <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          )}
          <p
            className={`text-sm font-medium ${actionResult.success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
          >
            {actionResult.message}
          </p>
        </div>
      )}

      {/* Main scan area — only when no result shown */}
      {!showHistory && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Mode toggle */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setMode("scan");
                resetAll();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                mode === "scan"
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Camera size={16} />
              Cámara QR
            </button>
            <button
              onClick={() => {
                setMode("manual");
                setCameraActive(false);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                mode === "manual"
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Keyboard size={16} />
              Captura manual
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Camera mode */}
            {mode === "scan" && !lookupResult && !actionResult && (
              <>
                <QrScannerCamera
                  onResult={handleQrResult}
                  active={cameraActive}
                />
                {!cameraActive && !lookupLoading && (
                  <button
                    onClick={() => setCameraActive(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Camera size={15} />
                    Activar cámara
                  </button>
                )}
              </>
            )}

            {/* Manual mode */}
            {mode === "manual" && !lookupResult && !actionResult && (
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Folio del ticket
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Ej: T-260101-ABCD o CT-260101-ABCD"
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white font-mono"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!manualInput.trim() || lookupLoading}
                      className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      {lookupLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Buscar"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Loading */}
            {lookupLoading && (
              <div className="flex items-center justify-center py-8 gap-3">
                <Loader2 size={20} className="animate-spin text-primary-500" />
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Buscando ticket...
                </span>
              </div>
            )}

            {/* Error */}
            {lookupError && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <AlertTriangle
                  size={16}
                  className="text-red-500 shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {lookupError}
                  </p>
                  <button
                    onClick={resetAll}
                    className="text-xs text-red-600 dark:text-red-400 underline mt-1"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              </div>
            )}

            {/* Lookup result */}
            {lookupResult && !actionResult && (
              <div className="space-y-4">
                <TicketResultCard
                  ticket={lookupResult.ticket}
                  valid={lookupResult.valid}
                  reason={lookupResult.reason}
                />

                {/* Actions — only when valid */}
                {lookupResult.valid && (
                  <div className="space-y-3">
                    {!showRejectForm ? (
                      <div className="flex gap-3">
                        {canValidate && (
                          <button
                            onClick={handleApprove}
                            disabled={actionLoading}
                            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                          >
                            {actionLoading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                            Aprobar salida
                          </button>
                        )}
                        {canReject && (
                          <button
                            onClick={() => setShowRejectForm(true)}
                            disabled={actionLoading}
                            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                          >
                            <XCircle size={16} />
                            Rechazar salida
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <label className="block text-sm font-semibold text-red-700 dark:text-red-400">
                          Motivo del rechazo{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={3}
                          placeholder="Describe el motivo del rechazo..."
                          className="w-full rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShowRejectForm(false);
                              setRejectReason("");
                            }}
                            className="flex-1 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleReject}
                            disabled={!rejectReason.trim() || actionLoading}
                            className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50"
                          >
                            {actionLoading && (
                              <Loader2 size={14} className="animate-spin" />
                            )}
                            Confirmar rechazo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reset button */}
                <button
                  onClick={resetAll}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <RefreshCw size={14} />
                  Escanear otro ticket
                </button>
              </div>
            )}

            {/* Post-action reset */}
            {actionResult && (
              <button
                onClick={resetAll}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                <RefreshCw size={15} />
                Siguiente validación
              </button>
            )}
          </div>
        </div>
      )}

      {/* History */}
      {showHistory && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Historial de validaciones
            </h2>
            <div className="flex gap-1">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterResult(opt.value)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    filterResult === opt.value
                      ? "bg-primary-600 text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {historyLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-10">
                <Clock
                  size={32}
                  className="mx-auto text-slate-300 dark:text-slate-700 mb-2"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Sin validaciones registradas
                </p>
              </div>
            ) : (
              history.map((log) => (
                <div
                  key={log.$id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono font-medium text-slate-900 dark:text-white truncate">
                      {log.ticketNumber || log.ticketId}
                    </p>
                    {log.reason && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {log.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${RESULT_COLORS[log.result] || ""}`}
                    >
                      {RESULT_LABELS[log.result] || log.result}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(log.$createdAt).toLocaleString("es-MX", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
