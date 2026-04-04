/**
 * Catalog cache layer for offline operation.
 *
 * Strategy: Network-first with IndexedDB fallback.
 *   - Online: fetch from Appwrite, update cache, return fresh data
 *   - Offline / error: return cached data from IndexedDB
 *
 * Usage:
 *   import { fetchWithCache, prefetchAllCatalogs } from '../../shared/lib/catalogCache';
 *
 *   const docs = await fetchWithCache('clients', () =>
 *     databases.listDocuments(DATABASE_ID, CLIENTS, queries)
 *   );
 */

import { setCatalogCache, getCatalogCache } from "./offlineStorage";

/** Message shown when a write operation is attempted offline */
const OFFLINE_MSG =
  "Sin conexión a internet. Esta operación requiere conexión. Los datos se podrán modificar cuando se restablezca la conexión.";

/**
 * Guard for write operations that require online connectivity.
 * Throws a user-friendly error instead of raw "Failed to fetch".
 *
 * Note: navigator.onLine is unreliable — it only checks if the network
 * adapter is connected, not actual internet reachability. That's why we
 * also wrap network errors in wrapOnlineOperation().
 */
export function requireOnline() {
  if (!navigator.onLine) {
    throw new Error(OFFLINE_MSG);
  }
}

/**
 * Detect if an error is a network/connectivity failure.
 */
function isNetworkError(err) {
  if (!err) return false;
  const msg = err.message || "";
  return (
    msg.includes("Failed to fetch") ||
    msg.includes("NetworkError") ||
    msg.includes("Network request failed") ||
    msg.includes("ERR_NAME_NOT_RESOLVED") ||
    msg.includes("ERR_INTERNET_DISCONNECTED") ||
    msg.includes("ERR_NETWORK") ||
    msg.includes("Load failed") ||
    err.code === 0
  );
}

/**
 * Wraps an async write operation so that network errors are translated
 * to a clear user-facing message instead of raw "Failed to fetch".
 *
 * Usage in hooks:
 *   return wrapOnlineOperation(async () => { ... });
 */
export async function wrapOnlineOperation(fn) {
  requireOnline();
  try {
    return await fn();
  } catch (err) {
    if (isNetworkError(err)) {
      throw new Error(OFFLINE_MSG);
    }
    throw err;
  }
}

/**
 * Convert raw errors to user-friendly messages.
 * Use in form catch blocks: setError(friendlyError(err))
 */
export function friendlyError(err) {
  if (isNetworkError(err)) return OFFLINE_MSG;
  return err?.message || "Error inesperado";
}

/**
 * Fetch documents with automatic IndexedDB caching.
 *
 * @param {string} cacheKey - Unique key for this catalog (e.g. 'clients_active')
 * @param {Function} fetchFn - Async function that returns { documents: [] } from Appwrite
 * @returns {Promise<{ documents: Array, fromCache: boolean }>}
 */
export async function fetchWithCache(cacheKey, fetchFn) {
  try {
    // Try network first
    const result = await fetchFn();
    const docs = result.documents || result;

    // Update cache in background (don't block)
    setCatalogCache(cacheKey, docs).catch((err) =>
      console.warn(`[CatalogCache] Error caching ${cacheKey}:`, err.message),
    );

    return { documents: docs, fromCache: false };
  } catch (err) {
    // Network failed — try cache
    console.warn(
      `[CatalogCache] Network failed for ${cacheKey}, trying cache...`,
    );
    const cached = await getCatalogCache(cacheKey);
    if (cached && cached.documents && cached.documents.length > 0) {
      console.log(
        `[CatalogCache] Serving ${cacheKey} from cache (${cached.documents.length} items, updated ${cached.lastUpdated})`,
      );
      return { documents: cached.documents, fromCache: true };
    }
    // No cache available — rethrow original error
    throw err;
  }
}

/**
 * Pre-fetch and cache all critical catalogs.
 * Call after login while online to ensure offline availability.
 *
 * @param {Function} listDocuments - databases.listDocuments bound function
 * @param {string} databaseId - DATABASE_ID
 * @param {object} collections - APP_IDS.collections map
 */
export async function prefetchAllCatalogs(
  listDocuments,
  databaseId,
  collections,
) {
  const { Query } = await import("appwrite");

  const catalogDefs = [
    {
      key: "clients_active",
      collection: collections.CLIENTS,
      queries: [
        Query.equal("active", true),
        Query.orderAsc("name"),
        Query.limit(500),
      ],
    },
    {
      key: "drivers_active",
      collection: collections.DRIVERS,
      queries: [
        Query.equal("active", true),
        Query.orderAsc("fullName"),
        Query.limit(500),
      ],
    },
    {
      key: "trucks_active",
      collection: collections.TRUCKS,
      queries: [
        Query.equal("active", true),
        Query.orderAsc("plates"),
        Query.limit(500),
      ],
    },
    {
      key: "materials_active",
      collection: collections.MATERIALS,
      queries: [
        Query.equal("active", true),
        Query.orderAsc("name"),
        Query.limit(500),
      ],
    },
    {
      key: "plants_active",
      collection: collections.PLANTS,
      queries: [
        Query.equal("active", true),
        Query.orderAsc("name"),
        Query.limit(500),
      ],
    },
    {
      key: "material_categories_active",
      collection: collections.MATERIAL_CATEGORIES,
      queries: [
        Query.equal("active", true),
        Query.orderAsc("sortOrder"),
        Query.limit(200),
      ],
    },
  ];

  const results = await Promise.allSettled(
    catalogDefs.map(async (def) => {
      try {
        const res = await listDocuments(
          databaseId,
          def.collection,
          def.queries,
        );
        await setCatalogCache(def.key, res.documents);
        return { key: def.key, count: res.documents.length };
      } catch (err) {
        console.warn(
          `[CatalogCache] Failed to prefetch ${def.key}:`,
          err.message,
        );
        throw err;
      }
    }),
  );

  const success = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(
    `[CatalogCache] Prefetch complete: ${success} cached, ${failed} failed`,
  );
  return { success, failed };
}
