import { useState, useEffect, createContext, useContext } from "react";
import { account, databases, functions, DATABASE_ID, APP_IDS } from "../../../shared/lib/appwrite";
import { ID, Permission, Role } from "appwrite";
import { clearAll as clearOfflineQueue } from "../../../shared/lib/offlineStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Deriva el rol efectivo desde las labels de Appwrite Auth.
   * Las labels son la fuente de verdad para el RBAC — no el campo 'role' del perfil.
   * Jerarquía: owner > admin > user
   */
  const getRoleFromLabels = (labels = []) => {
    if (labels.includes("owner")) return "owner";
    if (labels.includes("root")) return "root";
    if (labels.includes("admin")) return "admin";
    if (labels.includes("operador")) return "operador";
    if (labels.includes("capturista")) return "capturista";
    if (labels.includes("user")) return "operador"; // fallback legacy
    return "pending";
  };

  const loadUser = async () => {
    try {
      const currentAccount = await account.get();
      setUser(currentAccount);

      // Intentar cargar el perfil del usuario
      try {
        const currentProfile = await databases.getDocument(
          DATABASE_ID,
          APP_IDS.collections.USERS_PROFILE,
          currentAccount.$id,
        );
        // Sobrescribir 'role' con el valor real derivado de las labels de Auth
        setProfile({
          ...currentProfile,
          role: getRoleFromLabels(currentAccount.labels),
        });
      } catch (err) {
        if (err.code === 404) {
          // Sin perfil — crear documento en Appwrite para persistir
          const derivedRole = getRoleFromLabels(currentAccount.labels);
          const nameParts = (
            currentAccount.name ||
            currentAccount.email ||
            ""
          ).split(" ");
          const fallbackFirst = nameParts[0] || "";
          const fallbackLast = nameParts.slice(1).join(" ") || "";
          const newProfile = {
            userId: currentAccount.$id,
            firstName: fallbackFirst,
            lastName: fallbackLast,
            name: currentAccount.name || currentAccount.email,
            email: currentAccount.email || "",
            phone: "",
            role: derivedRole,
            active: true,
            createdBy: currentAccount.$id,
          };
          try {
            const created = await databases.createDocument(
              DATABASE_ID,
              APP_IDS.collections.USERS_PROFILE,
              currentAccount.$id,
              newProfile,
              [
                Permission.read(Role.user(currentAccount.$id)),
                Permission.update(Role.user(currentAccount.$id)),
              ],
            );
            setProfile({ ...created, role: derivedRole });
          } catch (createErr) {
            console.error("Error creating fallback profile:", createErr);
            setProfile({ ...newProfile, role: derivedRole });
          }
        } else {
          console.error("Error loading profile:", err);
          setProfile({
            userId: currentAccount.$id,
            role: getRoleFromLabels(currentAccount.labels),
          });
        }
      }
    } catch (error) {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    await account.createEmailPasswordSession(email, password);
    await loadUser();
  };

  const logout = async () => {
    await account.deleteSession("current");
    // Limpiar caches del Service Worker
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    // Limpiar IndexedDB offline queue
    try {
      await clearOfflineQueue();
    } catch (_) {
      /* ignore */
    }
    // Desregistrar Service Worker
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    setUser(null);
    setProfile(null);
  };

  const registerAdmin = async (firstName, lastName, email, password) => {
    const fullName = `${firstName} ${lastName}`.trim();
    // 1. Crear cuenta en Appwrite Auth
    await account.create(ID.unique(), email, password, fullName);
    // 2. Iniciar sesión inmediatamente
    await account.createEmailPasswordSession(email, password);
    // 3. Obtener datos frescos de la cuenta (con $id definitivo)
    const currentAccount = await account.get();

    // 4. Asignar labels owner + admin via Function setup-owner
    //    La Function verifica que el sistema no esté inicializado y luego
    //    llama users.updateLabels(['owner', 'admin']) server-side.
    try {
      await functions.createExecution(
        APP_IDS.functions.SETUP_OWNER,
        JSON.stringify({ userId: currentAccount.$id }),
        false,
        "/",
        "POST",
        { "Content-Type": "application/json" },
      );
    } catch (e) {
      console.warn("setup-owner execution error:", e.message);
    }

    // 4b. Renovar sesión para que refleje las labels recién asignadas.
    //     Sin esto, la sesión creada en paso 2 no tiene labels y todo
    //     da 401 "user_unauthorized".
    try {
      await account.deleteSession("current");
      await account.createEmailPasswordSession(email, password);
    } catch (e) {
      console.warn("Session renewal error:", e.message);
    }

    // 5. Crear el documento de perfil.
    const newProfile = await databases.createDocument(
      DATABASE_ID,
      APP_IDS.collections.USERS_PROFILE,
      currentAccount.$id,
      {
        userId: currentAccount.$id,
        firstName: firstName,
        lastName: lastName,
        name: fullName,
        email: email,
        role: "owner",
        active: true,
        createdBy: currentAccount.$id,
      },
      [
        Permission.read(Role.user(currentAccount.$id)),
        Permission.update(Role.user(currentAccount.$id)),
      ],
    );

    // 6. Sellar el sistema (marcar como inicializado)
    try {
      await databases.createDocument(
        DATABASE_ID,
        APP_IDS.collections.SYSTEM_CONFIG,
        APP_IDS.docs.SYSTEM_CONFIG_SINGLETON,
        { isInitialized: true },
        [
          Permission.read(Role.any()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ],
      );
    } catch (e) {
      console.warn("Could not seal system_config:", e.message);
    }

    // 7. Recargar usuario para obtener labels frescas asignadas por la Function
    await loadUser();
  };

  const sendRecovery = async (email, redirectUrl) => {
    return await account.createRecovery(email, redirectUrl);
  };

  const resetPassword = async (userId, secret, password, passwordAgain) => {
    return await account.updateRecovery(
      userId,
      secret,
      password,
      passwordAgain,
    );
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        logout,
        registerAdmin,
        sendRecovery,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
