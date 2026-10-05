/**
 * Offline-First Storage Service
 * Provides IndexedDB persistence for NDMA emergency playbooks,
 * shelter directories, and offline-queued SOS alerts.
 */

const DB_NAME = 'sahay_ai_offline_db';
const DB_VERSION = 1;
const PLAYBOOK_STORE = 'playbooks_cache';
const SOS_QUEUE_STORE = 'pending_sos_queue';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PLAYBOOK_STORE)) {
        db.createObjectStore(PLAYBOOK_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(SOS_QUEUE_STORE)) {
        db.createObjectStore(SOS_QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB.'));
  });
}

export interface CachedPlaybook<T = unknown> {
  key: string;
  data: T;
  timestamp: string;
}

export interface QueuedSOSAlert {
  id?: number;
  latitude: number;
  longitude: number;
  trappedVictims: number;
  sectorName: string;
  severity: string;
  timestamp: string;
  status: 'pending_network' | 'dispatched';
}

/**
 * Cache an emergency playbook or query result into IndexedDB.
 */
export async function cachePlaybook<T>(key: string, data: T): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(PLAYBOOK_STORE, 'readwrite');
    const store = tx.objectStore(PLAYBOOK_STORE);
    store.put({
      key,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[OfflineStorage] Playbook cache write failure:', err);
  }
}

/**
 * Retrieve cached playbook from IndexedDB.
 */
export async function getCachedPlaybook<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(PLAYBOOK_STORE, 'readonly');
      const store = tx.objectStore(PLAYBOOK_STORE);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve(req.result.data as T);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Enqueue an emergency SOS alert when offline.
 */
export async function enqueuePendingSOS(alert: Omit<QueuedSOSAlert, 'id' | 'status'>): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SOS_QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(SOS_QUEUE_STORE);
      const req = store.add({
        ...alert,
        status: 'pending_network',
      });
      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[OfflineStorage] SOS enqueue failure:', err);
    return 0;
  }
}

/**
 * Get all pending SOS alerts waiting for network recovery.
 */
export async function getPendingSOSQueue(): Promise<QueuedSOSAlert[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SOS_QUEUE_STORE, 'readonly');
      const store = tx.objectStore(SOS_QUEUE_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result || []) as QueuedSOSAlert[]);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Clear the pending SOS queue once dispatched.
 */
export async function clearPendingSOSQueue(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(SOS_QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(SOS_QUEUE_STORE);
    store.clear();
  } catch (err) {
    console.warn('[OfflineStorage] Failed to clear SOS queue:', err);
  }
}
