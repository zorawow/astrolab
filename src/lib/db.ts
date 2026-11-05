import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'astrolab'
const DB_VERSION = 1
const STORE = 'kv'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE)
        }
      },
    })
  }
  return dbPromise
}

export async function idbGet(key: string): Promise<string | null> {
  const db = await getDB()
  const val = await db.get(STORE, key)
  return val == null ? null : (val as string)
}

export async function idbSet(key: string, value: string): Promise<void> {
  const db = await getDB()
  await db.put(STORE, value, key)
}

export async function idbDel(key: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE, key)
}
