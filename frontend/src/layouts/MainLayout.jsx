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
  ChevronRight,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import OfflineBanner from "../shared/components/OfflineBanner";

const navGroups = [
  {
    label: "OPERACIÓN",
    items: [
      { name: "Dashboard", path: "/", icon: LayoutDashboard, end: true },
      { name: "Báscula", path: "/bascula", icon: Scale },
      { name: "Venta en Mostrador", path: "/mostrador", icon: ShoppingBag },
      { name: "Validación de Salida", path: "/validacion", icon: ShieldCheck },
    ],
  },
  {
    label: "DOCUMENTOS",
    items: [
      { name: "Vouchers / Referencias", path: "/vouchers", icon: Ticket },
      { name: "Tickets", path: "/tickets", icon: FileText },
    ],
  },
  {
    label: "CATÁLOGOS",
    items: [
      { name: "Materiales", path: "/catalogos/materiales", icon: Pickaxe },
      { name: "Categorías", path: "/catalogos/categorias", icon: Tag },
      { name: "Clientes", path: "/catalogos/clientes", icon: Users },
      { name: "Choferes", path: "/catalogos/choferes", icon: UserSquare2 },
      { name: "Camiones", path: "/catalogos/camiones", icon: Truck },
      { name: "Plantas", path: "/catalogos/plantas", icon: Droplet },
    ],
  },
  {
    label: "ADMINISTRACIÓN",
    items: [
      { name: "Usuarios", path: "/usuarios", icon: Users2 },
      { name: "Roles y Permisos", path: "/roles", icon: KeyRound },
      { name: "Auditoría", path: "/auditoria", icon: ClipboardList },
      { name: "Configuración", path: "/configuracion", icon: Settings },
    ],
  },
  {
    label: "REPORTES",
    items: [{ name: "Reportes", path: "/reportes", icon: BarChart2 }],
  },
  {
    label: "SISTEMA",
    items: [
      {
        name: "Operaciones Pendientes",
        path: "/operaciones-pendientes",
        icon: CloudOff,
      },
    ],
  },
];

export default function MainLayout() {
  const { logout, profile, user } = useAuth();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Scale size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
            Mina
            <br />
            <span className="text-blue-600 font-semibold">Operativa</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                {group.label}
              </p>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 group ${
                      isActive
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                    }`
                  }
                >
                  <item.icon size={18} className="shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  <ChevronRight
                    size={14}
                    className="opacity-0 group-hover:opacity-40 transition-opacity"
                  />
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-0.5">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <User size={14} className="text-slate-500 dark:text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                {user?.name || "Usuario"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 capitalize">
                {profile?.role || "básico"}
              </p>
            </div>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            {isDark ? (
              <Sun size={18} className="shrink-0" />
            ) : (
              <Moon size={18} className="shrink-0" />
            )}
            {isDark ? "Modo Claro" : "Modo Oscuro"}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <OfflineBanner />
        <div className="flex-1 p-8 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
