// ✅ ملف: lib/db/offlineStore.ts
import { openDB } from "idb";

// ⚙️ إعدادات قاعدة البيانات
const DB_NAME = "ma7al-offline-db";
const DB_VERSION = 1;

// 🧠 نموذج الفاتورة العامة
interface InvoiceData {
  id?: number;
  invoiceNumber: string;
  date: string;
  customerName?: string;
  supplierName?: string;
  products: {
    name: string;
    price: number;
    quantity: number;
    [key: string]: any;
  }[];
  [key: string]: any;
}

// 🧩 فتح قاعدة البيانات مع إعداد الجداول
export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("pending-invoices")) {
        db.createObjectStore("pending-invoices", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("pending-purchase-invoices")) {
        db.createObjectStore("pending-purchase-invoices", { keyPath: "id", autoIncrement: true });
      }
    },
  });
}

// =======================
// ✅ فواتير البيع (Sales)
// =======================

// إضافة
export async function savePendingInvoice(invoice: InvoiceData) {
  const db = await getDB();
  await db.add("pending-invoices", invoice);
}

// جلب الكل
export async function getAllPendingInvoices(): Promise<InvoiceData[]> {
  const db = await getDB();
  return await db.getAll("pending-invoices");
}

// حذف الكل
export async function clearPendingInvoices() {
  const db = await getDB();
  const tx = db.transaction("pending-invoices", "readwrite");
  await tx.store.clear();
  await tx.done;
}

// حذف واحدة
export async function removePendingInvoice(id: number) {
  const db = await getDB();
  const tx = db.transaction("pending-invoices", "readwrite");
  await tx.store.delete(id);
  await tx.done;
}

// =============================
// ✅ فواتير الشراء (Purchase)
// =============================

// إضافة
export async function savePendingPurchaseInvoice(invoice: InvoiceData) {
  const db = await getDB();
  await db.add("pending-purchase-invoices", invoice);
}

// جلب الكل
export async function getAllPendingPurchaseInvoices(): Promise<InvoiceData[]> {
  const db = await getDB();
  return await db.getAll("pending-purchase-invoices");
}

// حذف الكل
export async function clearPendingPurchaseInvoices() {
  const db = await getDB();
  const tx = db.transaction("pending-purchase-invoices", "readwrite");
  await tx.store.clear();
  await tx.done;
}

// حذف واحدة
export async function removePendingPurchaseInvoice(id: number) {
  const db = await getDB();
  const tx = db.transaction("pending-purchase-invoices", "readwrite");
  await tx.store.delete(id);
  await tx.done;
}
