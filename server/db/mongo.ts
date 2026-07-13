import { MongoClient, Db, Collection } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB_NAME || 'trustgov';
const ALLOW_IN_MEMORY_FALLBACK = (process.env.MONGO_FALLBACK || (process.env.NODE_ENV === 'production' ? 'false' : 'true')).toLowerCase() !== 'false';

let client: MongoClient | null = null;
let db: Db | null = null;
let connectPromise: Promise<Db> | null = null;
let usingInMemoryFallback = false;

type AnyDoc = Record<string, any>;

const inMemoryCollections = new Map<string, AnyDoc[]>();

const getNestedValue = (obj: AnyDoc, path: string) => path.split('.').reduce<any>((acc, key) => acc?.[key], obj);

const matchesFilter = (doc: AnyDoc, filter: AnyDoc): boolean => {
  if (!filter || Object.keys(filter).length === 0) return true;

  if (Array.isArray(filter.$or)) {
    return filter.$or.some((subFilter: AnyDoc) => matchesFilter(doc, subFilter));
  }

  return Object.entries(filter).every(([key, value]) => {
    if (key === '$or') return true;

    const docValue = getNestedValue(doc, key);

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if ('$gt' in value) {
        return docValue > value.$gt;
      }
    }

    return docValue === value;
  });
};

const createInMemoryCollection = <T>(name: string): Collection<T> => {
  if (!inMemoryCollections.has(name)) {
    inMemoryCollections.set(name, []);
  }

  const getStore = () => inMemoryCollections.get(name)!;

  return {
    findOne: async (filter: AnyDoc) => {
      const match = getStore().find((doc) => matchesFilter(doc, filter));
      return (match ?? null) as T | null;
    },
    insertOne: async (doc: AnyDoc) => {
      getStore().push(doc);
      return { acknowledged: true, insertedId: doc._id } as any;
    },
    updateOne: async (filter: AnyDoc, update: AnyDoc) => {
      const row = getStore().find((doc) => matchesFilter(doc, filter));
      if (!row) {
        return { acknowledged: true, matchedCount: 0, modifiedCount: 0 } as any;
      }

      if (update?.$set && typeof update.$set === 'object') {
        Object.assign(row, update.$set);
      }

      return { acknowledged: true, matchedCount: 1, modifiedCount: 1 } as any;
    },
    find: (filter: AnyDoc) => {
      let rows = getStore().filter((doc) => matchesFilter(doc, filter));

      const cursor = {
        sort: (sortSpec: AnyDoc) => {
          const [field, direction] = Object.entries(sortSpec)[0] || [];
          if (field) {
            rows = rows.slice().sort((a, b) => {
              const av = getNestedValue(a, field);
              const bv = getNestedValue(b, field);
              if (av === bv) return 0;
              return av > bv ? (direction === -1 ? -1 : 1) : (direction === -1 ? 1 : -1);
            });
          }
          return cursor;
        },
        limit: (count: number) => {
          rows = rows.slice(0, count);
          return cursor;
        },
        toArray: async () => rows as T[],
      };

      return cursor as any;
    },
  } as Collection<T>;
};

const createInMemoryDb = (): Db => ({
  collection: <T>(name: string) => createInMemoryCollection<T>(name),
  command: async () => ({ ok: 1 }),
} as unknown as Db);

const connect = async (): Promise<Db> => {
  if (db) return db;

  if (!MONGO_URI) {
    if (ALLOW_IN_MEMORY_FALLBACK) {
      usingInMemoryFallback = true;
      db = createInMemoryDb();
      console.warn('[TrustGov] MONGO_URI missing; using in-memory fallback database.');
      return db;
    }

    throw new Error('MONGO_URI is not configured. Add MONGO_URI to your environment variables.');
  }

  if (!connectPromise) {
    client = new MongoClient(MONGO_URI);
    connectPromise = client.connect()
      .then((connectedClient) => {
        usingInMemoryFallback = false;
        db = connectedClient.db(DB_NAME);
        return db;
      })
      .catch((error) => {
        if (!ALLOW_IN_MEMORY_FALLBACK) {
          throw error;
        }

        usingInMemoryFallback = true;
        db = createInMemoryDb();
        console.warn('[TrustGov] MongoDB unreachable; using in-memory fallback database.');
        return db;
      });
  }

  return connectPromise;
};

export const getDb = async (): Promise<Db> => connect();

export const getCollection = async <T>(name: string): Promise<Collection<T>> => {
  const database = await getDb();
  return database.collection<T>(name);
};

export const verifyMongoConnection = async () => {
  const database = await getDb();
  await database.command({ ping: 1 });
};

export const isUsingInMemoryDb = () => usingInMemoryFallback;

/**
 * Seeds a demo user so login works out of the box without registering.
 * Demo credentials:
 *   User ID : TG-00001
 *   Phone   : 8939687210
 *   OTP     : 123456  (DEMO_OTP from .env)
 */
export const seedDemoUser = async () => {
  const { createHash } = await import('crypto');
  const bcrypt = await import('bcryptjs');

  const users = await getCollection<Record<string, any>>(process.env.USERS_COLLECTION || 'users');

  // Only seed if collection is empty
  const existing = await users.findOne({ userId: 'TG-00001' });
  if (existing) return;

  const passwordHash = await bcrypt.default.hash('demo1234', 10);

  await users.insertOne({
    userId:       'TG-00001',
    name:         'Demo Citizen',
    email:        'demo@trustgov.in',
    phone:        '8939687210',
    passwordHash,
    createdAt:    new Date(),
  });

  console.log('[TrustGov] Demo user seeded → User ID: TG-00001 | Phone: 8939687210 | OTP: 123456');
};
