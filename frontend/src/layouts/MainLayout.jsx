import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import {
  LayoutDashboard,
  Scale,
  ShieldCheck,
  ShoppingBag,
  FileText,
  Ticket,
  Pickaxe,
  Tag,
  Users,
  UserSquare2,
  Truck,
  Droplet,
  Users2,
  KeyRound,
  ClipboardList,
  Settings,
  BarChart2,
  CloudOff,
  LogOut,
  Sun,
  Moon,
  User,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import OfflineBanner from "../shared/components/OfflineBanner";

const navGroups = [
  {
    label: "OPERACIÓN",
    items: [
      { name: "Dashboard",            path: "/",            icon: LayoutDashboard, end: true },
      { name: "Báscula",              path: "/bascula",     icon: Scale },
      { name: "Venta en Mostrador",   path: "/mostrador",   icon: ShoppingBag },
      { name: "Validación de Salida", path: "/validacion",  icon: ShieldCheck },
    ],
  },
  {
    label: "DOCUMENTOS",
    items: [
      { name: "Vouchers / Referencias", path: "/vouchers", icon: Ticket },
      { name: "Tickets",               path: "/tickets",   icon: FileText },
    ],
  },
  {
    label: "CATÁLOGOS",
    items: [
      { name: "Materiales",  path: "/catalogos/materiales", icon: Pickaxe },
      { name: "Categorías",  path: "/catalogos/categorias", icon: Tag },
      { name: "Clientes",    path: "/catalogos/clientes",   icon: Users },
      { name: "Choferes",    path: "/catalogos/choferes",   icon: UserSquare2 },
      { name: "Camiones",    path: "/catalogos/camiones",   icon: Truck },
      { name: "Plantas",     path: "/catalogos/plantas",    icon: Droplet },
    ],
  },
  {
    label: "ADMINISTRACIÓN",
    items: [
      { name: "Usuarios",        path: "/usuarios",      icon: Users2 },
      { name: "Perfiles",        path: "/roles",         icon: KeyRound },
      { name: "Auditoría",       path: "/auditoria",     icon: ClipboardList },
      { name: "Configuración",   path: "/configuracion", icon: Settings },
    ],
  },
  {
    label: "REPORTES",
    items: [
      { name: "Reportes", path: "/reportes", icon: BarChart2 },
    ],
  },
  {
    label: "SISTEMA",
    items: [
      { name: "Operaciones Pendientes", path: "/operaciones-pendientes", icon: CloudOff },
    ],
  },
];

export default function MainLayout() {
  const { logout, profile, user } = useAuth();
  const navigate = useNavigate();

  // dark theme
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  // desktop: sidebar collapsed (icon-only)
  const [collapsed, setCollapsed] = useState(false);

  // mobile: sidebar drawer open
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Close mobile drawer when route changes
  const closeMobile = () => setMobileOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Sidebar content — shared between desktop and mobile drawer
  const SidebarContent = ({ isCollapsed = false, onNavClick }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`h-16 flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0 ${isCollapsed ? "justify-center px-0" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Scale size={16} className="text-white" />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
            Mina<br />
            <span className="text-blue-600 font-semibold">Operativa</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!isCollapsed && (
              <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                {group.label}
              </p>
            )}
            {isCollapsed && <div className="pt-3" />}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onNavClick}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg transition-all duration-150 group
                  ${isCollapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2.5 text-sm font-medium"}
                  ${isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  }`
                }
              >
                <item.icon size={18} className="shrink-0" />
                {!isCollapsed && <span className="flex-1 truncate">{item.name}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`p-2 border-t border-slate-200 dark:border-slate-800 space-y-0.5 shrink-0 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
        {/* User info */}
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <User size={14} className="text-slate-500 dark:text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                {user?.name || "Usuario"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 capitalize">
                {profile?.role || "—"}
              </p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-1" title={user?.name}>
            <User size={14} className="text-slate-500 dark:text-slate-400" />
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          title={isDark ? "Modo Claro" : "Modo Oscuro"}
          className={`flex items-center gap-3 w-full rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors
            ${isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5 text-sm font-medium"}`}
        >
          {isDark ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
          {!isCollapsed && (isDark ? "Modo Claro" : "Modo Oscuro")}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className={`flex items-center gap-3 w-full rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors
            ${isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5 text-sm font-medium"}`}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && "Cerrar Sesión"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 relative
          ${collapsed ? "w-16" : "w-64"}`}
      >
        <SidebarContent isCollapsed={collapsed} />

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
          className="absolute -right-3 top-18 z-10 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shadow-sm transition-colors"
        >
          {collapsed
            ? <PanelLeftOpen size={12} />
            : <PanelLeftClose size={12} />}
        </button>
      </aside>

      {/* ── MOBILE OVERLAY ──────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* ── MOBILE DRAWER ───────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col lg:hidden transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close button */}
        <button
          onClick={closeMobile}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={18} />
        </button>
        <SidebarContent isCollapsed={false} onNavClick={closeMobile} />
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden h-14 shrink-0 flex items-center gap-3 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
              <Scale size={12} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              Mina <span className="text-blue-600">Operativa</span>
            </span>
          </div>
        </header>

        <OfflineBanner />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
