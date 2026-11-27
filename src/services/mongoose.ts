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

export type MongoDiagnosticReason =
  | "not_configured"
  | "placeholder_credentials"
  | "invalid_uri"
  | "authentication_failed"
  | "dns_resolution_failed"
  | "network_or_ip_blocked"
  | "connection_timeout"
  | "connection_error";

export interface MongoPingResult {
  configured: boolean;
  connected: boolean;
  database: string | null;
  readyState: number;
  diagnostic?: {
    reason: MongoDiagnosticReason;
    errorName: string;
    errorCode?: number | string;
    hint: string;
  };
}

export function resolveDatabaseName(uri: string): string {
  if (process.env.MONGODB_DB_NAME?.trim()) {
    return process.env.MONGODB_DB_NAME.trim();
  }
  try {
    const withoutQuery = uri.split("?")[0] || "";
    const afterHost = withoutQuery.replace(/^mongodb(\+srv)?:\/\/[^/]+\/?/, "");
    return afterHost.trim() || "eastfield_india";
  } catch {
    return "eastfield_india";
  }
}

function readMongoUri(): string | null {
  const raw = process.env.MONGODB_URI?.trim();
  if (!raw) return null;
  const cleaned = raw.replace(/^["']|["']$/g, "").trim();
  return cleaned || null;
}

export function isMongoConfigured(): boolean {
  return Boolean(readMongoUri());
}

/**
 * Throws a clear server-side configuration error (without leaking secrets) when MongoDB is required but unset.
 */
export function assertMongoConfigured(): string {
  const uri = readMongoUri();
  if (!uri) {
    throw new Error(
      "Database configuration error: MONGODB_URI environment variable is not set."
    );
  }
  return uri;
}

export function classifyMongoError(err: unknown, uri?: string | null): NonNullable<MongoPingResult["diagnostic"]> {
  if (uri && /<db_password>|<password>|<username>|<cluster>/i.test(uri)) {
    return {
      reason: "placeholder_credentials",
      errorName: "ConfigurationError",
      hint: "MONGODB_URI still contains placeholder tokens instead of actual credentials.",
    };
  }

  const errorObj = err as { name?: string; code?: number | string; message?: string } | undefined;
  const name = errorObj?.name || "MongoError";
  const code = errorObj?.code;
  const msg = (errorObj?.message || "").toLowerCase();

  if (name === "MongoParseError" || msg.includes("invalid scheme") || msg.includes("unescaped")) {
    return {
      reason: "invalid_uri",
      errorName: name,
      ...(code !== undefined ? { errorCode: code } : {}),
      hint: "Check MONGODB_URI format and ensure special password characters are URL-encoded.",
    };
  }

  if (
    code === 18 ||
    code === 8000 ||
    msg.includes("authentication failed") ||
    msg.includes("bad auth")
  ) {
    return {
      reason: "authentication_failed",
      errorName: name,
      ...(code !== undefined ? { errorCode: code } : {}),
      hint: "Database user credentials rejected by MongoDB Atlas. Verify username/password in MONGODB_URI.",
    };
  }

  if (
    msg.includes("enotfound") ||
    msg.includes("querysrv") ||
    msg.includes("eservfail") ||
    msg.includes("getaddrinfo")
  ) {
    return {
      reason: "dns_resolution_failed",
      errorName: name,
      ...(code !== undefined ? { errorCode: code } : {}),
      hint: "DNS/SRV lookup for the Atlas cluster hostname failed.",
    };
  }

  if (
    name === "MongoServerSelectionError" ||
    msg.includes("tlsv1 alert") ||
    msg.includes("ssl") ||
    msg.includes("econnrefused") ||
    msg.includes("replicasetnoprimary") ||
    msg.includes("ip that isn't whitelisted")
  ) {
    return {
      reason: "network_or_ip_blocked",
      errorName: name,
      ...(code !== undefined ? { errorCode: code } : {}),
      hint: "Could not reach MongoDB Atlas servers. Ensure Atlas Network Access allows serverless IPs (0.0.0.0/0).",
    };
  }

  if (name === "MongoNetworkTimeoutError" || msg.includes("timed out") || msg.includes("etimedout")) {
    return {
      reason: "connection_timeout",
      errorName: name,
      ...(code !== undefined ? { errorCode: code } : {}),
      hint: "Connection to MongoDB Atlas timed out. Check Atlas Network Access (0.0.0.0/0) and cluster status.",
    };
  }

  return {
    reason: "connection_error",
    errorName: name,
    ...(code !== undefined ? { errorCode: code } : {}),
    hint: "MongoDB connection failed. Inspect server logs and Atlas configuration.",
  };
}

function attachListenersOnce() {
  if (state.listenersAttached) return;
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

async function openMongooseConnection(uri: string): Promise<typeof mongoose> {
  const options: mongoose.ConnectOptions = {
    dbName: resolveDatabaseName(uri),
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 20000,
    connectTimeoutMS: 8000,
    family: 4,
    bufferCommands: false,
  };

  try {
    return await mongoose.connect(uri, options);
  } catch (firstErr) {
    const diag = classifyMongoError(firstErr, uri);
    // Do not waste latency retrying deterministic auth or malformed URI errors
    if (
      diag.reason === "authentication_failed" ||
      diag.reason === "invalid_uri" ||
      diag.reason === "placeholder_credentials"
    ) {
      throw firstErr;
    }
    // Single brief retry for transient cold-start serverless network hiccups
    await new Promise((r) => setTimeout(r, 250));
    return mongoose.connect(uri, options);
  }
}

/**
 * Establishes and caches a pooled Mongoose connection across Next.js hot reloads
 * and Vercel serverless invocations. Handles disconnects and transient failures cleanly.
 */
export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const uri = readMongoUri();
  if (!uri) return null;

  attachListenersOnce();

  if (state.conn && state.uri === uri && mongoose.connection.readyState === 1) {
    return state.conn;
  }

  if (!state.promise || state.uri !== uri) {
    if (state.uri && state.uri !== uri && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }

    state.uri = uri;
    state.conn = null;
    state.promise = openMongooseConnection(uri)
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

export async function pingMongoDb(): Promise<MongoPingResult> {
  const uri = readMongoUri();
  if (!uri) {
    return {
      configured: false,
      connected: false,
      database: null,
      readyState: mongoose.connection.readyState,
      diagnostic: {
        reason: "not_configured",
        errorName: "ConfigurationError",
        hint: "MONGODB_URI environment variable is not configured.",
      },
    };
  }

  const dbName = resolveDatabaseName(uri);
  try {
    const conn = await connectToDatabase();
    const db = conn?.connection.db;
    if (!db || mongoose.connection.readyState !== 1) {
      return {
        configured: true,
        connected: false,
        database: dbName,
        readyState: mongoose.connection.readyState,
        diagnostic: {
          reason: "connection_error",
          errorName: "DisconnectedError",
          hint: "Mongoose connection is not in ready state.",
        },
      };
    }

    await db.admin().ping();
    return {
      configured: true,
      connected: true,
      database: db.databaseName || dbName,
      readyState: mongoose.connection.readyState,
    };
  } catch (err) {
    const diagnostic = classifyMongoError(err, uri);
    console.error(
      `[EastField DB Health] reason=${diagnostic.reason} name=${diagnostic.errorName}${
        diagnostic.errorCode !== undefined ? ` code=${diagnostic.errorCode}` : ""
      }`
    );
    return {
      configured: true,
      connected: false,
      database: dbName,
      readyState: mongoose.connection.readyState,
      diagnostic,
    };
  }
}
