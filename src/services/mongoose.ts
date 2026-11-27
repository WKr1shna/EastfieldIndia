import mongoose from "mongoose";

interface GlobalMongooseState {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  uri: string | null;
  listenersAttached: boolean;
}

const globalForMongoose = globalThis as typeof globalThis & {
  __eastfieldMongoose?: GlobalMongooseState;
};

const state: GlobalMongooseState = (globalForMongoose.__eastfieldMongoose ??= {
  conn: null,
  promise: null,
  uri: null,
  listenersAttached: false,
});

export function resolveDatabaseName(uri: string): string {
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
 * Establishes and caches a pooled Mongoose connection across Next.js hot reloads
 * and serverless invocations. Handles disconnects gracefully without leaking secrets.
 */
export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;

  if (!state.listenersAttached) {
    mongoose.connection.on("disconnected", () => {
      state.conn = null;
      state.promise = null;
    });
    mongoose.connection.on("error", () => {
      state.conn = null;
      state.promise = null;
    });
    state.listenersAttached = true;
  }

  if (state.conn && state.uri === uri && mongoose.connection.readyState === 1) {
    return state.conn;
  }

  if (!state.promise || state.uri !== uri) {
    if (state.uri && state.uri !== uri && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }

    state.uri = uri;
    state.conn = null;
    state.promise = mongoose
      .connect(uri, {
        dbName: resolveDatabaseName(uri),
        maxPoolSize: 15,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 20000,
        bufferCommands: false,
      })
      .then((instance) => {
        state.conn = instance;
        return instance;
      })
      .catch((err) => {
        state.conn = null;
        state.promise = null;
        throw err;
      });
  }

  return state.promise;
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

  const dbName = resolveDatabaseName(uri);
  try {
    const conn = await connectToDatabase();
    const db = conn?.connection.db;
    if (!db) {
      return { configured: true, connected: false, database: dbName };
    }
    await db.admin().ping();
    return { configured: true, connected: true, database: db.databaseName || dbName };
  } catch {
    return { configured: true, connected: false, database: dbName };
  }
}
