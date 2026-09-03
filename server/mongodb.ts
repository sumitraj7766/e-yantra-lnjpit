import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env or .env.example
if (!process.env.MONGODB_URI) {
  dotenv.config();
  if (!process.env.MONGODB_URI && fs.existsSync('.env')) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  }
  if (!process.env.MONGODB_URI && fs.existsSync('.env.example')) {
    try {
      const exampleContent = fs.readFileSync('.env.example', 'utf8');
      const match = exampleContent.match(/MONGODB_URI=["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) {
        process.env.MONGODB_URI = match[1];
      }
    } catch {}
  }
}

// Target database name - strictly isolated to e-Yantra LNJPIT
export const MONGODB_DATABASE_NAME = 'eyantra_lnjpit';

// MongoDB connection cache
interface MongoConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  isConnected: boolean;
  lastError: string | null;
}

const globalForMongo = global as unknown as {
  mongoConnectionCache?: MongoConnectionCache;
};

const cache: MongoConnectionCache = globalForMongo.mongoConnectionCache || {
  conn: null,
  promise: null,
  isConnected: false,
  lastError: null,
};

if (process.env.NODE_ENV !== 'production') {
  globalForMongo.mongoConnectionCache = cache;
}

/**
 * Return safe connection information with credentials strictly stripped
 */
export function getSafeMongoInfo() {
  const uri = process.env.MONGODB_URI || '';
  let safeHost = 'Not Configured';
  if (uri) {
    try {
      const hostMatch = uri.match(/@([^/?]+)/);
      if (hostMatch) {
        safeHost = hostMatch[1];
      } else {
        safeHost = 'MongoDB Atlas Cluster';
      }
    } catch {
      safeHost = 'MongoDB Atlas Cluster';
    }
  }

  return {
    configured: Boolean(uri && uri.trim() !== ''),
    clusterHost: safeHost,
    targetDatabase: MONGODB_DATABASE_NAME,
    currentDatabase: mongoose.connection.name || MONGODB_DATABASE_NAME,
    readyState: mongoose.connection.readyState,
    isConnected: mongoose.connection.readyState === 1
  };
}

/**
 * Check if active MongoDB Atlas connection is available
 */
export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Connect to MongoDB Atlas using Mongoose
 */
export async function connectToMongoDB(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    cache.isConnected = false;
    cache.lastError = 'MONGODB_URI environment variable not configured';
    return null;
  }

  // Already connected
  if (cache.conn && mongoose.connection.readyState === 1) {
    cache.isConnected = true;
    return cache.conn;
  }

  // If already in the process of connecting, await the promise
  if (cache.promise) {
    try {
      return await cache.promise;
    } catch {
      return null;
    }
  }

  const safeInfo = getSafeMongoInfo();
  console.log(`[MongoDB Atlas] Initializing connection to cluster: ${safeInfo.clusterHost}, target database: ${MONGODB_DATABASE_NAME}`);

  const opts: mongoose.ConnectOptions = {
    dbName: MONGODB_DATABASE_NAME,
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  };

  cache.promise = mongoose
    .connect(uri, opts)
    .then(m => {
      cache.conn = m;
      cache.isConnected = true;
      cache.lastError = null;
      console.log(`[MongoDB Atlas] Successfully connected to Cluster: ${m.connection.host || safeInfo.clusterHost} | Database: ${m.connection.name}`);
      return m;
    })
    .catch(err => {
      cache.promise = null;
      cache.isConnected = false;
      cache.lastError = err.message;
      console.warn('[MongoDB Atlas] Connection notice:', err.message);
      return null;
    });

  return cache.promise;
}

/**
 * Check the current MongoDB connection status for diagnostic display
 */
export function getDatabaseStatus(): {
  database: string;
  databaseName: string;
  clusterHost: string;
  isConnected: boolean;
  readyState: number;
  readyStateLabel: string;
  host: string;
  mode: string;
  error?: string | null;
  timestamp: string;
} {
  const state = mongoose.connection.readyState;
  const labels: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };

  const isConnected = state === 1;
  const safeInfo = getSafeMongoInfo();

  return {
    database: isConnected ? 'MongoDB Atlas (Cluster0)' : 'MongoDB Atlas',
    databaseName: MONGODB_DATABASE_NAME,
    clusterHost: safeInfo.clusterHost,
    isConnected,
    readyState: state,
    readyStateLabel: labels[state] || 'disconnected',
    host: isConnected
      ? (mongoose.connection.host || safeInfo.clusterHost)
      : safeInfo.configured
        ? `MongoDB Atlas (${safeInfo.clusterHost})`
        : 'In-Memory / Standby',
    mode: isConnected ? 'mongodb_atlas' : 'resilient_local_memory',
    error: cache.lastError,
    timestamp: new Date().toISOString()
  };
}

export default connectToMongoDB;

