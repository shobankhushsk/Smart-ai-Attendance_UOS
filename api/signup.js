import { MongoClient } from 'mongodb';

let cachedDb = null;

async function connectToDatabase(uri) {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('smart_attendance');
  cachedDb = db;
  return db;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: "Naam aur password dono zaroori hain" });
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return res.status(500).json({ error: "Server is missing MONGODB_URI environment variable." });
    }

    const db = await connectToDatabase(uri);
    const teachersCollection = db.collection('teachers');

    // Check if teacher already exists
    const existing = await teachersCollection.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });

    if (existing) {
      return res.status(400).json({ error: "Ye naam pehle se registered hai. Barah-e-karam Login karein." });
    }

    await teachersCollection.insertOne({
      name: name.trim(),
      password: password,
      createdAt: new Date()
    });

    return res.status(200).json({ success: true, name: name.trim() });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown server error" });
  }
}