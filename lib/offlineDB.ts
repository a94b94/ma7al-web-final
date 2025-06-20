// lib/offlineDB.ts
import { openDB } from "idb";

const DB_NAME = "ma7al-offline-db";
const STORE_NAME = "invoices";

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    },
  });
}

export async function saveOfflineInvoice(data: any) {
  const db = await getDB();
  await db.add(STORE_NAME, data);
}

export async function getAllOfflineInvoices() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function clearOfflineInvoices() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}
