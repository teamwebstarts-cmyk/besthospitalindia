import "server-only"
import { MongoClient, type Db } from "mongodb"

/**
 * Shared MongoDB connection for both deploys:
 *  - Vercel (frontend + API routes)
 *  - Render (full Next.js service)
 * Both point at the same Atlas M0 cluster via MONGODB_URI, so every write is
 * visible everywhere in real time. Cached on globalThis to survive serverless
 * warm starts / HMR without leaking connections.
 */

const URI = process.env.MONGODB_URI?.trim() ?? ""
export const DB_NAME = process.env.MONGODB_DB?.trim() || "besthospitalindia"

export function hasMongo(): boolean {
  return URI.length > 0
}

interface MongoCache {
  client: MongoClient | null
  promise: Promise<MongoClient> | null
}

const globalCache = globalThis as unknown as { __bhiMongo?: MongoCache }
const cache: MongoCache = globalCache.__bhiMongo ?? { client: null, promise: null }
globalCache.__bhiMongo = cache

async function connect(): Promise<MongoClient> {
  if (!URI) throw new Error("MONGODB_URI is not set")
  if (cache.client) return cache.client
  if (!cache.promise) {
    const client = new MongoClient(URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    })
    cache.promise = client.connect().then((connected) => {
      cache.client = connected
      return connected
    }).catch((error) => {
      cache.promise = null
      throw error
    })
  }
  return cache.promise
}

/** Returns the shared DB, or null when Mongo is not configured / unreachable. */
export async function getDb(): Promise<Db | null> {
  if (!hasMongo()) return null
  try {
    const client = await connect()
    return client.db(DB_NAME)
  } catch (error) {
    console.error("[mongo] connection failed:", error)
    return null
  }
}

export function collections(db: Db) {
  return {
    leads: db.collection("leads"),
    vendors: db.collection("vendors"),
    submissions: db.collection("submissions"),
    catalogue: db.collection("catalogue"),
    outbox: db.collection("outbox"),
    counters: db.collection("counters"),
    admin: db.collection("admin"),
  }
}

/** Atomic incrementing integer id (mirrors the old numeric/random ids). */
interface CounterDoc {
  _id: string
  value: number
}

export async function nextNumericId(db: Db, sequence: string, min = 100000, max = 999999): Promise<string> {
  const counters = db.collection<CounterDoc>("counters")
  const result = await counters.findOneAndUpdate(
    { _id: sequence },
    {
      $setOnInsert: { value: min },
      $inc: { value: 1 },
    },
    { upsert: true, returnDocument: "after" },
  )
  const doc = result ?? { _id: sequence, value: min }
  let value = doc.value
  if (!Number.isFinite(value)) value = min
  if (value > max) {
    await counters.updateOne({ _id: sequence }, { $set: { value: min } })
    value = min
  }
  return String(value)
}
