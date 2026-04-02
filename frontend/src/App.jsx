import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./features/auth/hooks/useAuth";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import { Loader2 } from "lucide-react";

// Auth (keep eager — needed immediately)
import Login from "./features/auth/pages/Login";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import ResetPassword from "./features/auth/pages/ResetPassword";

// Dashboard (keep eager — first page users see)
import Dashboard from "./features/dashboard/pages/Dashboard";

// Lazy-loaded modules
const Usuarios = lazy(() => import("./features/usuarios/pages/Usuarios"));
const Roles = lazy(() => import("./features/roles/pages/Roles"));
const Auditoria = lazy(() => import("./features/auditoria/pages/Auditoria"));
const Configuracion = lazy(
  () => import("./features/configuracion/pages/Configuracion"),
);

const Catalogos = lazy(() => import("./features/catalogos/pages/Catalogos"));
const Categorias = lazy(() => import("./features/catalogos/pages/Categorias"));
const Materiales = lazy(() => import("./features/catalogos/pages/Materiales"));
const Clientes = lazy(() => import("./features/catalogos/pages/Clientes"));
const Choferes = lazy(() => import("./features/catalogos/pages/Choferes"));
const Camiones = lazy(() => import("./features/catalogos/pages/Camiones"));
const Plantas = lazy(() => import("./features/catalogos/pages/Plantas"));

const Vouchers = lazy(() => import("./features/vouchers/pages/Vouchers"));
const Tickets = lazy(() => import("./features/tickets/pages/Tickets"));

const Bascula = lazy(() => import("./features/bascula/pages/Bascula"));
const Mostrador = lazy(() => import("./features/mostrador/pages/Mostrador"));
const Validacion = lazy(() => import("./features/validacion/pages/Validacion"));

const Reportes = lazy(() => import("./features/reportes/pages/Reportes"));

const OperacionesPendientes = lazy(
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

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
