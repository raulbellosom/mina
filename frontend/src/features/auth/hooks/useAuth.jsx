import { useState, useEffect, createContext, useContext } from 'react';
import { account, databases, DATABASE_ID } from '../../../shared/lib/appwrite';
import { ID, Permission, Role } from 'appwrite';


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
        if (labels.includes('owner')) return 'owner';
        if (labels.includes('admin')) return 'admin';
        if (labels.includes('user')) return 'user';
        return 'pending'; // usuario sin label asignada aún
    };

    const loadUser = async () => {
        try {
            const currentAccount = await account.get();
            setUser(currentAccount);

            // Intentar cargar el perfil del usuario
            try {
                const currentProfile = await databases.getDocument(
                    DATABASE_ID,
                    'users_profile',
                    currentAccount.$id
                );
                // Sobrescribir 'role' con el valor real derivado de las labels de Auth
                setProfile({
                    ...currentProfile,
                    role: getRoleFromLabels(currentAccount.labels)
                });
            } catch (err) {
                if (err.code === 404) {
                    // Sin perfil — solo puede ocurrir si se creó el usuario directo en Appwrite
                    // El perfil normalmente se crea en registerAdmin / inviteUser
                    setProfile({
                        userId: currentAccount.$id,
                        name: currentAccount.name || currentAccount.email,
                        role: getRoleFromLabels(currentAccount.labels),
                        active: true
                    });
                } else {
                    console.error('Error loading profile:', err);
                    setProfile({
                        userId: currentAccount.$id,
                        role: getRoleFromLabels(currentAccount.labels)
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
        await account.deleteSession('current');
        setUser(null);
        setProfile(null);
    };

    const registerAdmin = async (name, email, password) => {
        // 1. Crear cuenta en Appwrite Auth
        const newAccount = await account.create(ID.unique(), email, password, name);
        // 2. Iniciar sesión inmediatamente
        await account.createEmailPasswordSession(email, password);
        // 3. Obtener datos frescos de la cuenta (con $id definitivo)
        const currentAccount = await account.get();

        // 4. Crear el documento de perfil.
        //    REGLA DE APPWRITE: un usuario solo puede asignar permisos que él mismo tiene.
        //    El usuario recién registrado no tiene labels aún, por lo que solo puede
        //    asignarse a sí mismo. El acceso administrativo (label:owner, label:admin)
        //    lo manejan los permisos de COLECCIÓN automáticamente una vez que se
        //    asignen las labels via assign-owner.mjs o Appwrite Console.
        const newProfile = await databases.createDocument(
            DATABASE_ID,
            'users_profile',
            currentAccount.$id,
            {
                userId: currentAccount.$id,
                name: name,
                role: 'owner', // campo informativo; la label en Auth es la fuente real
                active: true
            },
            [
                // Solo permisos que el usuario REALMENTE tiene en este momento
                Permission.read(Role.user(currentAccount.$id)),
                Permission.update(Role.user(currentAccount.$id))
            ]
        );

        // 5. Sellar el sistema (marcar como inicializado)
        //    system_config tiene create("users") en la colección → cualquier usuario auth puede crear
        //    Solo pasamos permisos que el usuario actual tiene (users = cualquier autenticado)
        try {
            await databases.createDocument(
                DATABASE_ID,
                'system_config',
                'singleton',
                { isInitialized: true },
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ]
            );
        } catch(e) {
            // Ya existe o fallo menor — no es crítico
            console.warn('Could not seal system_config:', e.message);
        }

        // 6. Actualizar estado — el rol se deriva de labels (aún vacías hasta assign-owner)
        setUser(currentAccount);
        setProfile({
            ...newProfile,
            role: getRoleFromLabels(currentAccount.labels) || 'owner'
        });
    };

    const sendRecovery = async (email, redirectUrl) => {
        return await account.createRecovery(email, redirectUrl);
    };

    const resetPassword = async (userId, secret, password, passwordAgain) => {
        return await account.updateRecovery(userId, secret, password, passwordAgain);
    };

    useEffect(() => {
        loadUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, logout, registerAdmin, sendRecovery, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
