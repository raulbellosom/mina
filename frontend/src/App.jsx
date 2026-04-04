import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./features/auth/hooks/useAuth";
import { ThemeProvider } from "./shared/context/ThemeContext";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import ErrorBoundary from "./shared/components/ErrorBoundary";
import NotFound from "./shared/components/NotFound";
import { ToastProvider } from "./shared/components/Toast";
import MainLayout from "./layouts/MainLayout";
import { Loader2 } from "lucide-react";

/**
 * Lazy import wrapper that auto-reloads the page once when a chunk fails to load.
 * This handles stale deployments where the browser has old HTML referencing
 * chunk hashes that no longer exist on the server.
 */
function lazyWithReload(importFn) {
  return lazy(() =>
    importFn().catch((err) => {
      // Only auto-reload once to avoid infinite loops
      const key = "minaflow_chunk_reload";
      const lastReload = sessionStorage.getItem(key);
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem(key, String(now));
        window.location.reload();
      }
      throw err;
    }),
  );
}

// Auth (keep eager — needed immediately)
import Login from "./features/auth/pages/Login";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import ResetPassword from "./features/auth/pages/ResetPassword";

// Dashboard (keep eager — first page users see)
import Dashboard from "./features/dashboard/pages/Dashboard";

// Lazy-loaded modules (with auto-reload on stale chunks)
const Usuarios = lazyWithReload(
  () => import("./features/usuarios/pages/Usuarios"),
);
const Roles = lazyWithReload(() => import("./features/roles/pages/Roles"));
const Auditoria = lazyWithReload(
  () => import("./features/auditoria/pages/Auditoria"),
);
const Configuracion = lazyWithReload(
  () => import("./features/configuracion/pages/Configuracion"),
);

const Catalogos = lazyWithReload(
  () => import("./features/catalogos/pages/Catalogos"),
);
const Categorias = lazyWithReload(
  () => import("./features/catalogos/pages/Categorias"),
);
const Materiales = lazyWithReload(
  () => import("./features/catalogos/pages/Materiales"),
);
const Clientes = lazyWithReload(
  () => import("./features/catalogos/pages/Clientes"),
);
const Choferes = lazyWithReload(
  () => import("./features/catalogos/pages/Choferes"),
);
const Camiones = lazyWithReload(
  () => import("./features/catalogos/pages/Camiones"),
);
const Plantas = lazyWithReload(
  () => import("./features/catalogos/pages/Plantas"),
);

const Vouchers = lazyWithReload(
  () => import("./features/vouchers/pages/Vouchers"),
);
const Tickets = lazyWithReload(
  () => import("./features/tickets/pages/Tickets"),
);

const Bascula = lazyWithReload(
  () => import("./features/bascula/pages/Bascula"),
);
const Mostrador = lazyWithReload(
  () => import("./features/mostrador/pages/Mostrador"),
);
const Validacion = lazyWithReload(
  () => import("./features/validacion/pages/Validacion"),
);

const Reportes = lazyWithReload(
  () => import("./features/reportes/pages/Reportes"),
);

const OperacionesPendientes = lazyWithReload(
  () => import("./features/offline/pages/OperacionesPendientes"),
);

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={28} className="animate-spin text-slate-400" />
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return null; // Avoid flicker during root load

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/forgot-password"
        element={user ? <Navigate to="/" /> : <ForgotPassword />}
      />
      <Route
        path="/reset-password"
        element={user ? <Navigate to="/" /> : <ResetPassword />}
      />

      {/* Rutas protegidas dentro del layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Operación */}
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/bascula"
            element={
              <Suspense fallback={<PageLoader />}>
                <Bascula />
              </Suspense>
            }
          />
          <Route
            path="/mostrador"
            element={
              <Suspense fallback={<PageLoader />}>
                <Mostrador />
              </Suspense>
            }
          />
          <Route
            path="/validacion"
            element={
              <Suspense fallback={<PageLoader />}>
                <Validacion />
              </Suspense>
            }
          />

          {/* Documentos */}
          <Route
            path="/vouchers"
            element={
              <Suspense fallback={<PageLoader />}>
                <Vouchers />
              </Suspense>
            }
          />
          <Route
            path="/tickets"
            element={
              <Suspense fallback={<PageLoader />}>
                <Tickets />
              </Suspense>
            }
          />

          {/* Catálogos */}
          <Route
            path="/catalogos"
            element={
              <Suspense fallback={<PageLoader />}>
                <Catalogos />
              </Suspense>
            }
          />
          <Route
            path="/catalogos/materiales"
            element={
              <Suspense fallback={<PageLoader />}>
                <Materiales />
              </Suspense>
            }
          />
          <Route
            path="/catalogos/categorias"
            element={
              <Suspense fallback={<PageLoader />}>
                <Categorias />
              </Suspense>
            }
          />
          <Route
            path="/catalogos/clientes"
            element={
              <Suspense fallback={<PageLoader />}>
                <Clientes />
              </Suspense>
            }
          />
          <Route
            path="/catalogos/choferes"
            element={
              <Suspense fallback={<PageLoader />}>
                <Choferes />
              </Suspense>
            }
          />
          <Route
            path="/catalogos/camiones"
            element={
              <Suspense fallback={<PageLoader />}>
                <Camiones />
              </Suspense>
            }
          />
          <Route
            path="/catalogos/plantas"
            element={
              <Suspense fallback={<PageLoader />}>
                <Plantas />
              </Suspense>
            }
          />

          {/* Administración */}
          <Route
            path="/usuarios"
            element={
              <Suspense fallback={<PageLoader />}>
                <Usuarios />
              </Suspense>
            }
          />
          <Route
            path="/roles"
            element={
              <Suspense fallback={<PageLoader />}>
                <Roles />
              </Suspense>
            }
          />
          <Route
            path="/auditoria"
            element={
              <Suspense fallback={<PageLoader />}>
                <Auditoria />
              </Suspense>
            }
          />
          <Route
            path="/configuracion"
            element={
              <Suspense fallback={<PageLoader />}>
                <Configuracion />
              </Suspense>
            }
          />

          {/* Reportes */}
          <Route
            path="/reportes"
            element={
              <Suspense fallback={<PageLoader />}>
                <Reportes />
              </Suspense>
            }
          />

          {/* Sistema */}
          <Route
            path="/operaciones-pendientes"
            element={
              <Suspense fallback={<PageLoader />}>
                <OperacionesPendientes />
              </Suspense>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
