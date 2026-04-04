/**
 * IndexedDB wrapper for MinaFlow offline persistence.
 *
 * Stores:
 *   sync_queue     — operations created offline, pending sync to Appwrite
 *   catalog_cache  — cached catalog data (materials, clients, drivers, etc.)
 *
 * sync_queue entry:
 *   id, collection, action, documentId, data, meta, status, attempts,
 *   lastError, createdAt, syncedAt
 *
 * catalog_cache entry:
 *   collection (key), documents[], lastUpdated (ISO)
 */

const DB_NAME = "minaflow_offline";
const DB_VERSION = 2;
const STORE_NAME = "sync_queue";
const CATALOG_STORE = "catalog_cache";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("collection", "collection", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(CATALOG_STORE)) {
        db.createObjectStore(CATALOG_STORE, { keyPath: "collection" });
      }
    };
  });
}

/**
 * Request persistent storage so the browser won't evict IndexedDB data.
 * Critical for long offline periods (up to a month without internet).
 * Returns true if granted, false otherwise.
 */
export async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const granted = await navigator.storage.persist();
    if (granted) {
      console.log("[MinaFlow] Persistent storage granted");
    } else {
      console.warn(
        "[MinaFlow] Persistent storage denied — data may be evicted by the browser",
      );
    }
    return granted;
  }
  return false;
}

/**
 * Check if persistent storage is already granted.
 */
export async function isPersisted() {
  if (navigator.storage && navigator.storage.persisted) {
    return navigator.storage.persisted();
  }
  return false;
}

/**
 * Get storage usage estimate.
 */
export async function getStorageEstimate() {
  if (navigator.storage && navigator.storage.estimate) {
    return navigator.storage.estimate();
  }
  return null;
}

function tx(mode, fn) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);
      const result = fn(store);
      transaction.oncomplete = () => resolve(result._result ?? result);
      transaction.onerror = () => reject(transaction.error);
    });
  });
}

/**
 * Add an operation to the sync queue.
 */
export async function addToQueue({
  collection,
  action,
  documentId,
  data,
  meta,
}) {
  // BUG-21-001: Validate required fields before persisting
  if (!collection || typeof collection !== "string") {
    throw new Error("offlineStorage: collection es requerido");
  }
  if (!data || typeof data !== "object") {
    throw new Error("offlineStorage: data es requerido y debe ser un objeto");
  }

  const entry = {
    id: crypto.randomUUID(),
    collection,
    action: action || "create",
    documentId: documentId || null,
    data,
    meta: meta || {},
    status: "pending",
    attempts: 0,
    lastError: null,
    createdAt: new Date().toISOString(),
    syncedAt: null,
  };
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE_NAME, "readwrite");
    t.objectStore(STORE_NAME).add(entry);
    t.oncomplete = () => resolve(entry);
    t.onerror = () => {
      // BUG-21-002: Handle QuotaExceededError
      const err = t.error;
      if (err?.name === "QuotaExceededError") {
        reject(
          new Error(
            "QUOTA_EXCEEDED: Almacenamiento local lleno. Conecte a internet para sincronizar datos pendientes.",
          ),
        );
      } else {
        reject(err);
      }
    };
  });
}

/**
 * Get all entries, optionally filtered by status.
 */
export async function getQueueEntries(status) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE_NAME, "readonly");
    const store = t.objectStore(STORE_NAME);
    let req;
    if (status) {
      const idx = store.index("status");
      req = idx.getAll(status);
    } else {
      req = store.getAll();
    }
    req.onsuccess = () =>
      resolve(
        req.result.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get a single entry by id.
 */
export async function getQueueEntry(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE_NAME, "readonly");
    const req = t.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Update an entry (merge fields).
 */
export async function updateQueueEntry(id, fields) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE_NAME, "readwrite");
    const store = t.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => {
      const existing = req.result;
      if (!existing) {
        resolve(null);
        return;
      }
      const updated = { ...existing, ...fields };
      store.put(updated);
      t.oncomplete = () => resolve(updated);
    };
    t.onerror = () => reject(t.error);
  });
}

/**
 * Delete an entry by id.
 */
export async function deleteQueueEntry(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE_NAME, "readwrite");
    t.objectStore(STORE_NAME).delete(id);
    t.oncomplete = () => resolve(true);
    t.onerror = () => reject(t.error);
  });
}

/**
 * Count entries by status. If no status, count all.
 */
export async function countQueue(status) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE_NAME, "readonly");
    const store = t.objectStore(STORE_NAME);
    let req;
    if (status) {
      req = store.index("status").count(status);
    } else {
      req = store.count();
    }
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Clear all synced entries from the queue.
 */
export async function clearSynced() {
  const synced = await getQueueEntries("synced");
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE_NAME, "readwrite");
    const store = t.objectStore(STORE_NAME);
    synced.forEach((e) => store.delete(e.id));
    t.oncomplete = () => resolve(synced.length);
    t.onerror = () => reject(t.error);
  });
}

/**
 * Clear ALL entries from the queue (used on logout).
 */
export async function clearAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE_NAME, "readwrite");
    t.objectStore(STORE_NAME).clear();
    t.oncomplete = () => resolve(true);
    t.onerror = () => reject(t.error);
  });
}

// ═══════════════════════════════════════════════════════════════════
// Catalog Cache — persists master data for offline operation
// ═══════════════════════════════════════════════════════════════════

/**
 * Save catalog documents to IndexedDB for offline access.
 * @param {string} collection - The collection key (e.g. 'clients', 'materials')
 * @param {Array} documents - Array of Appwrite documents
 */
export async function setCatalogCache(collection, documents) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(CATALOG_STORE, "readwrite");
    t.objectStore(CATALOG_STORE).put({
      collection,
      documents,
      lastUpdated: new Date().toISOString(),
    });
    t.oncomplete = () => resolve(true);
    t.onerror = () => reject(t.error);
  });
}

/**
 * Get cached catalog documents from IndexedDB.
 * @param {string} collection - The collection key
 * @returns {{ documents: Array, lastUpdated: string } | null}
 */
export async function getCatalogCache(collection) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(CATALOG_STORE, "readonly");
    const req = t.objectStore(CATALOG_STORE).get(collection);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get all cached catalogs (for diagnostics or preload checks).
 * @returns {Array<{ collection, documents, lastUpdated }>}
 */
export async function getAllCatalogCache() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(CATALOG_STORE, "readonly");
    const req = t.objectStore(CATALOG_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Clear all catalog cache (used on logout).
 */
export async function clearCatalogCache() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(CATALOG_STORE, "readwrite");
    t.objectStore(CATALOG_STORE).clear();
    t.oncomplete = () => resolve(true);
    t.onerror = () => reject(t.error);
  });
}
