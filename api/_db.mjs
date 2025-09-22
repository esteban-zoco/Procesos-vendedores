import { MongoClient } from 'mongodb';

const DB_NAME = process.env.MONGODB_DB || 'zocoTickets';
const COLLECTION = process.env.MONGODB_COLLECTION || 'leads';

export async function getCollection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Falta MONGODB_URI');
  if (!globalThis._mongoClient) {
    globalThis._mongoClient = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
    await globalThis._mongoClient.connect();
  }
  const db = globalThis._mongoClient.db(DB_NAME);
  const col = db.collection(COLLECTION);
  return col;
}

