import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { HardHat, ArrowLeft, MailCheck } from "lucide-react";

export default function ForgotPassword() {
  const { sendRecovery } = useAuth();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      // El fallback URL para reset será <current-url>/reset-password
      const redirectUrl = `${window.location.origin}/reset-password`;
      await sendRecovery(email, redirectUrl);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message || "Error al enviar el correo");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-dvh min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
        </div>

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-xl mb-4 dark:bg-primary-900/40 dark:text-primary-400">
            <HardHat size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Recuperar Acceso
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Ingresa tu correo para recibir las instrucciones
          </p>
        </div>

        {status === "success" ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center animate-in zoom-in duration-300">
            <MailCheck className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-400 mb-2">
              ¡Correo Enviado!
            </h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-500">
              Revisa la bandeja de entrada de <strong>{email}</strong> y haz
              clic en el enlace para restablecer tu contraseña.
            </p>
          </div>
        ) : (
          <>
            {status === "error" && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800/50">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
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
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-700 disabled:opacity-50"
                  placeholder="operador@mina.com"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700 h-10 py-2 px-4 w-full mt-6"
              >
                {status === "loading"
                  ? "Enviando enlace..."
                  : "Enviar instrucciones"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
