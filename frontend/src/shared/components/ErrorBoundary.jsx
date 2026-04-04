import { Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary capturó un error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
          <div className="w-full max-w-md text-center">
            {/* Logo + error indicator */}
            <div className="relative inline-flex mb-6">
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
                <img
                  src="/ore_logo.png"
                  alt="MinaPRO"
                  className="w-12 h-12 object-contain opacity-40 grayscale"
                />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center ring-1 ring-red-200 dark:ring-red-500/30">
                <AlertTriangle
                  size={14}
                  className="text-red-600 dark:text-red-400"
                />
              </div>
            </div>

            {/* Card */}
            <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Algo salió mal
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Ocurrió un error inesperado en la aplicación. Intenta recargar
                la página o vuelve al inicio.
              </p>

              {this.state.error && (
                <div className="mb-6 px-3 py-2.5 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20 text-left">
                  <p className="text-xs font-mono text-red-600 dark:text-red-400 truncate">
                    {this.state.error.message || "Error desconocido"}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReload}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 px-5 py-2.5 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex-1"
                >
                  <RotateCcw size={16} />
                  Recargar página
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex-1"
                >
                  Ir al inicio
                </button>
              </div>
            </div>

            {/* Footer brand */}
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-6">
              Mina
              <span className="text-primary-500 dark:text-primary-400">
                PRO
              </span>
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
