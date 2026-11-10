/**
 * @file background/storage.js
 * @description Copy wallpaper files into IndexedDB during the one-time folder grant.
 * New tabs then read blobs from this cache and do not touch the disk.
 */

const DB_NAME = "iWonderTabDB";
const DB_VERSION = 4;
const HANDLE_STORE = "handles";
const FILE_STORE = "wallpaper_files";
const KEY_DIR = "wallpaper_directory_handle";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(HANDLE_STORE)) {
        db.createObjectStore(HANDLE_STORE);
      }
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        db.createObjectStore(FILE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestValue(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function runStore(storeName, mode, executor) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    let request;
    try {
      request = executor(tx.objectStore(storeName));
    } catch (err) {
      reject(err);
      return;
    }
    const valuePromise = request ? requestValue(request) : Promise.resolve(undefined);
    tx.oncomplete = () => valuePromise.then(resolve, reject);
    tx.onerror = () => reject(tx.error);
  });
}

function toStoredBlob(file) {
  return file.slice(0, file.size, file.type || "application/octet-stream");
}

async function saveDirectoryHandle(handle) {
  return runStore(HANDLE_STORE, "readwrite", (store) => store.put(handle, KEY_DIR));
}

async function clearDirectoryHandle() {
  try {
    await runStore(HANDLE_STORE, "readwrite", (store) => store.delete(KEY_DIR));
  } catch (e) {
    console.error("[iWonder Tab] Failed to clear directory handle:", e);
  }
}

async function saveWallpaperFiles(files) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, "readwrite");
    const store = tx.objectStore(FILE_STORE);
    store.clear();
    for (const file of files) {
      store.put(toStoredBlob(file), file.name);
    }
    tx.oncomplete = () => resolve(files.length);
    tx.onerror = () => reject(tx.error);
  });
}

async function getWallpaperFile(name) {
  try {
    const stored = await runStore(FILE_STORE, "readonly", (store) => store.get(name));
    if (stored instanceof Blob) return stored;
    return null;
  } catch (e) {
    console.error("[iWonder Tab] Failed to get wallpaper file:", e);
    return null;
  }
}

async function clearWallpaperFiles() {
  try {
    await runStore(FILE_STORE, "readwrite", (store) => store.clear());
  } catch (e) {
    console.error("[iWonder Tab] Failed to clear wallpaper files:", e);
  }
}

async function importWallpaperFolder() {
  const dirHandle = await window.showDirectoryPicker({ mode: "read" });
  await saveDirectoryHandle(dirHandle);

  const files = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind !== "file") continue;
    if (!/\.(jpe?g|png|gif|webp)$/i.test(entry.name)) continue;
    files.push(await entry.getFile());
  }

  await saveWallpaperFiles(files);
  return files.map((file) => file.name);
}

async function clearWallpaperLibrary() {
  await clearDirectoryHandle();
  await clearWallpaperFiles();
}
