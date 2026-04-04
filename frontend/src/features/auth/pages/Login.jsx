import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import {
  Mountain,
  Loader2,
  ShieldAlert,
  LogIn,
  UserPlus,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { databases, DATABASE_ID } from "../../../shared/lib/appwrite";
import PasswordInput from "../../../shared/components/PasswordInput";
import { useTheme } from "../../../shared/context/ThemeContext";

export default function Login() {
  const { login, registerAdmin } = useAuth();
  const navigate = useNavigate();
  const { isDark, setIsDark, setPaletteId } = useTheme();

  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [checking, setChecking] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifySetup = async () => {
      try {
        const response = await databases.getDocument(
          DATABASE_ID,
          "system_config",
          "singleton",
        );
        if (response.isInitialized) {
          setMode("login");
        } else {
          setMode("register");
        }
        // Apply system-configured palette if set
        if (response.colorTheme) {
          setPaletteId(response.colorTheme);
        }
      } catch (err) {
        if (err.code === 404) {
          setMode("register");
        } else {
          setMode("login");
        }
      } finally {
        setChecking(false);
      }
    };
    verifySetup();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "register") {
        if (!firstName.trim() || !lastName.trim())
          throw new Error("Nombre y apellidos son requeridos");
        if (password.length < 8)
          throw new Error("La contraseña debe tener 8 caracteres");
        if (password !== passwordConfirm)
          throw new Error("Las contraseñas no coinciden");
        await registerAdmin(firstName.trim(), lastName.trim(), email, password);
        navigate("/");
      } else {
        await login(email, password);
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Error procesando solicitud");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-8 w-8 text-primary-500 dark:text-primary-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Conectando al servidor...
          </p>
        </div>
      </div>
    );
  }

  const isRegister = mode === "register";

  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: 0.1, ease: "easeOut" },
    },
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, delay: 0.15 + i * 0.06, ease: "easeOut" },
    }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Theme toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
        title={isDark ? "Modo claro" : "Modo oscuro"}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <motion.div
        className="w-full max-w-sm"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center mb-8"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
              isRegister
                ? "bg-amber-100 dark:bg-amber-500/10 ring-1 ring-amber-200 dark:ring-amber-500/20"
                : "bg-primary-100 dark:bg-primary-500/10 ring-1 ring-primary-200 dark:ring-primary-500/20"
            }`}
          >
            {isRegister ? (
              <ShieldAlert
                className="text-amber-600 dark:text-amber-400"
                size={28}
              />
            ) : (
              <Mountain
                className="text-primary-600 dark:text-primary-400"
                size={28}
              />
            )}
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            {isRegister ? "Configuración inicial" : "MinaFlow"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 text-center max-w-[280px]">
            {isRegister
              ? "Crea el perfil administrativo principal para iniciar el sistema."
              : "Ingresa tus credenciales para continuar"}
          </p>
        </motion.div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="px-3.5 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-500/20 flex items-start gap-2 overflow-hidden"
              >
                <span className="shrink-0 mt-0.5">⚠</span>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <motion.div
                className="grid grid-cols-2 gap-3"
                custom={0}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-medium text-slate-600 dark:text-slate-300"
                    htmlFor="firstName"
                  >
                    Nombre(s)
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
                    placeholder="Juan"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-medium text-slate-600 dark:text-slate-300"
                    htmlFor="lastName"
                  >
                    Apellidos
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
                    placeholder="Pérez López"
                  />
                </div>
              </motion.div>
            )}

            <motion.div
              className="space-y-1.5"
              custom={isRegister ? 1 : 0}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <label
                className="text-xs font-medium text-slate-600 dark:text-slate-300"
                htmlFor="email"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                  isRegister
                    ? "focus:ring-amber-500/50 focus:border-amber-500/50"
                    : "focus:ring-primary-500/50 focus:border-primary-500/50"
                }`}
                placeholder="usuario@correo.com"
              />
            </motion.div>

            <motion.div
              className="space-y-1.5"
              custom={isRegister ? 2 : 1}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <PasswordInput
                id="password"
                label="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showMeter={isRegister}
              />
            </motion.div>

            {isRegister && (
              <motion.div
                className="space-y-1.5"
                custom={3}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
              >
                <PasswordInput
                  id="passwordConfirm"
                  label="Confirmar contraseña"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  showMeter={false}
                />
              </motion.div>
            )}

            {mode === "login" && (
              <motion.div
                className="flex justify-end"
                custom={2}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  to="/forgot-password"
                  className="text-xs text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </motion.div>
            )}

            <motion.div
              custom={isRegister ? 4 : 3}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
            >
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium h-10 w-full transition-all disabled:opacity-50 disabled:pointer-events-none ${
                  isRegister
                    ? "bg-amber-500 hover:bg-amber-400 text-white focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800"
                    : "bg-primary-600 hover:bg-primary-500 text-white focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    {isRegister ? "Configurando..." : "Accediendo..."}
                  </>
                ) : (
                  <>
                    {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
                    {isRegister ? "Crear administrador" : "Iniciar sesión"}
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </div>

        {/* Footer */}
        <motion.p
          className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          MinaFlow &middot; Control operativo de mina
        </motion.p>
      </motion.div>
    </div>
  );
}
