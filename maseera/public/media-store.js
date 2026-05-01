// ── MediaStore: IndexedDB wrapper for post media ──────────────────
// Stores raw File/Blob objects — no base64 overhead, no size limit.
// Usage:
//   await MediaStore.save('media_123', fileObject)  → stores blob
//   const url = await MediaStore.getURL('media_123') → object URL to use as src
//   await MediaStore.remove('media_123')             → deletes blob

const MediaStore = (() => {
  const DB_NAME  = 'maseera_media';
  const STORE    = 'blobs';
  let _db = null;

  function open() {
    return new Promise((resolve, reject) => {
      if (_db) return resolve(_db);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore(STORE);
      req.onsuccess  = e => { _db = e.target.result; resolve(_db); };
      req.onerror    = e => reject(e.target.error);
    });
  }

  async function save(key, fileOrBlob) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(fileOrBlob, key);
      tx.oncomplete = resolve;
      tx.onerror    = e => reject(e.target.error);
    });
  }

  async function getURL(key) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE).objectStore(STORE).get(key);
      req.onsuccess = e => resolve(
        e.target.result ? URL.createObjectURL(e.target.result) : null
      );
      req.onerror = e => reject(e.target.error);
    });
  }

  async function remove(key) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = resolve;
      tx.onerror    = e => reject(e.target.error);
    });
  }

  return { save, getURL, remove };
})();
