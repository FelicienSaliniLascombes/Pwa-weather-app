const DB_NAME = "nimbus-db";
const DB_VERSION = 1;

const dbPromise = idb.openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("favorites")) {
      db.createObjectStore("favorites", { keyPath: "name" });
    }
  },
});
