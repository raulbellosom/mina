import { Component } from "react";
import { AlertTriangle } from "lucide-react";

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

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
          <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-8 text-center shadow-lg dark:border-red-800 dark:bg-slate-800">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
              Algo salió mal
            </h1>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              Ocurrió un error inesperado. Por favor, recarga la página para
              intentar de nuevo.
            </p>
            <button
              onClick={this.handleReload}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
