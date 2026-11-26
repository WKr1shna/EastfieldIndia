import { MongoClient, ServerApiVersion, type Collection, type Db } from "mongodb";
import type { StoredLead } from "@/services/inquiryRepository";

export interface MongoLeadDocument extends StoredLead {
  _id?: unknown;
}

interface GlobalMongoState {
  clientPromise?: Promise<MongoClient>;
  uri?: string;
  indexedDb?: string;
}

const globalForMongo = globalThis as typeof globalThis & {
  __eastfieldMongoState?: GlobalMongoState;
};

function resolveDatabaseName(uri: string): string {
  if (process.env.MONGODB_DB_NAME?.trim()) {
    return process.env.MONGODB_DB_NAME.trim();
  }
  try {
    const withoutQuery = uri.split("?")[0] || "";
    const afterHost = withoutQuery.replace(/^mongodb(\+srv)?:\/\/[^/]+\/?/, "");
    return afterHost.trim() || "eastfield";
  } catch {
    return "eastfield";
  }
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}

/**
 * Returns a cached MongoClient promise across Next.js hot reloads and serverless invocations.
 */
export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;

  const state = (globalForMongo.__eastfieldMongoState ??= {});

  if (!state.clientPromise || state.uri !== uri) {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    });
    state.uri = uri;
    state.indexedDb = undefined;
    state.clientPromise = client.connect().catch((err) => {
      state.clientPromise = undefined;
      throw err;
    });
  }

  return state.clientPromise;
}

export async function getMongoDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI?.trim();
  const client = await getMongoClient();
  if (!uri || !client) return null;
  return client.db(resolveDatabaseName(uri));
}

/**
 * Returns the `leads` MongoDB collection and ensures lookup/query indexes exist once per runtime.
 */
export async function getMongoLeadsCollection(): Promise<Collection<MongoLeadDocument> | null> {
  const db = await getMongoDb();
  if (!db) return null;

  const collection = db.collection<MongoLeadDocument>("leads");
  const state = (globalForMongo.__eastfieldMongoState ??= {});

  if (state.indexedDb !== db.databaseName) {
    await Promise.all([
      collection.createIndex({ id: 1 }, { unique: true }),
      collection.createIndex({ email: 1 }),
      collection.createIndex({ submittedAt: -1 }),
      collection.createIndex({ requestedSample: 1, submittedAt: -1 }),
    ]);
    state.indexedDb = db.databaseName;
  }

  return collection;
}

export async function pingMongoDb(): Promise<{
  configured: boolean;
  connected: boolean;
  database: string | null;
}> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    return { configured: false, connected: false, database: null };
  }

  try {
    const db = await getMongoDb();
    if (!db) {
      return { configured: true, connected: false, database: resolveDatabaseName(uri) };
    }
    await db.command({ ping: 1 });
    return { configured: true, connected: true, database: db.databaseName };
  } catch {
    return { configured: true, connected: false, database: resolveDatabaseName(uri) };
  }
}
