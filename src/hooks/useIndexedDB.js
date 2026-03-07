/**
 * useIndexedDB — simple async wrapper around IndexedDB for custom photo icons.
 * Replaces base64 storage in localStorage (which hits the 5-10MB limit quickly).
 * IndexedDB supports hundreds of MB and is the correct place for binary data.
 */

const DB_NAME    = "symbosay";
const DB_VERSION = 1;
const STORE      = "custom_icons";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("profileId", "profileId", { unique: false });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

export async function idbGetIcons(profileId) {
  try {
    const db  = await openDB();
    const tx  = db.transaction(STORE, "readonly");
    const idx = tx.objectStore(STORE).index("profileId");
    return await new Promise((resolve, reject) => {
      const req = idx.getAll(profileId);
      req.onsuccess = (e) => resolve(e.target.result || []);
      req.onerror   = (e) => reject(e.target.error);
    });
  } catch (e) {
    console.warn("IndexedDB read failed, falling back:", e);
    return [];
  }
}

export async function idbSaveIcon(icon) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    await new Promise((resolve, reject) => {
      const req = tx.objectStore(STORE).put(icon);
      req.onsuccess = resolve;
      req.onerror   = (e) => reject(e.target.error);
    });
    return true;
  } catch (e) {
    console.warn("IndexedDB write failed:", e);
    return false;
  }
}

export async function idbDeleteIcon(id) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    await new Promise((resolve, reject) => {
      const req = tx.objectStore(STORE).delete(id);
      req.onsuccess = resolve;
      req.onerror   = (e) => reject(e.target.error);
    });
    return true;
  } catch (e) {
    console.warn("IndexedDB delete failed:", e);
    return false;
  }
}

export async function idbDeleteProfileIcons(profileId) {
  try {
    const db    = await openDB();
    const tx    = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const idx   = store.index("profileId");
    const keys  = await new Promise((resolve, reject) => {
      const req = idx.getAllKeys(profileId);
      req.onsuccess = (e) => resolve(e.target.result || []);
      req.onerror   = (e) => reject(e.target.error);
    });
    await Promise.all(
      keys.map(
        (key) =>
          new Promise((resolve, reject) => {
            const req = store.delete(key);
            req.onsuccess = resolve;
            req.onerror   = (e) => reject(e.target.error);
          })
      )
    );
    return true;
  } catch (e) {
    console.warn("IndexedDB profile delete failed:", e);
    return false;
  }
}
