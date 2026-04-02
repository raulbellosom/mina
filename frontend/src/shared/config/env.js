/**
 * Capa de abstracción central de las variables de entorno.
 * Recopila todos los inyectores que Vite mapea dinámicamente o process.env
 * y las expone en objetos planos y tipados.
 */

export const ENV = {
    appwrite: {
        endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || '',
        projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || ''
    },
    // futuras variables:
    // system: { version: import.meta.env.VITE_APP_VERSION }
};

export default ENV;
