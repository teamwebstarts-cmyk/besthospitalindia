import "server-only"

import { collections, getDb, hasMongo } from "./mongo"

export { hasMongo }

/**
 * Low-level data adapters used by the legacy JSON stores.
 * When MONGODB_URI is set every read/write hits the shared Atlas cluster, so
 * Vercel and Render see the same data. Otherwise the stores keep their
 * original data/runtime/*.json behaviour for local development.
 */

export async function readArray<T>(name: keyof ReturnType<typeof collections>): Promise<T[] | null> {
  if (!hasMongo()) return null
  const db = await getDb()
  if (!db) return null
  try {
    const docs = await collections(db)[name].find({}).toArray()
    return docs.map(({ _id: _ignored, ...rest }) => rest as unknown as T)
  } catch (error) {
    console.error(`[mongo] readArray(${name}) failed:`, error)
    return null
  }
}

export async function writeArray<T>(name: keyof ReturnType<typeof collections>, items: T[]): Promise<boolean> {
  if (!hasMongo()) return false
  const db = await getDb()
  if (!db) return false
  try {
    const coll = collections(db)[name]
    await coll.deleteMany({})
    if (items.length > 0) await coll.insertMany(items as never[])
    return true
  } catch (error) {
    console.error(`[mongo] writeArray(${name}) failed:`, error)
    return false
  }
}

export async function readDoc<T>(name: keyof ReturnType<typeof collections>, id: string, fallback: T): Promise<T | null> {
  if (!hasMongo()) return null
  const db = await getDb()
  if (!db) return null
  try {
    const doc = await collections(db)[name].findOne({ _id: id as never })
    if (!doc) return fallback
    const { _id: _ignored, ...rest } = doc as Record<string, unknown>
    return rest as T
  } catch (error) {
    console.error(`[mongo] readDoc(${name}) failed:`, error)
    return null
  }
}

export async function writeDoc<T>(name: keyof ReturnType<typeof collections>, id: string, value: T): Promise<boolean> {
  if (!hasMongo()) return false
  const db = await getDb()
  if (!db) return false
  try {
    await collections(db)[name].replaceOne(
      { _id: id as never },
      { ...(value as object), _id: id } as never,
      { upsert: true },
    )
    return true
  } catch (error) {
    console.error(`[mongo] writeDoc(${name}) failed:`, error)
    return false
  }
}
