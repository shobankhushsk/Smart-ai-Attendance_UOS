import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) return cachedClient;
    const client = new MongoClient(uri, {
        tlsInsecure: true
    });
    await client.connect();
    cachedClient = client;
    return client;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, password } = req.body;
    if (!name || !password) {
        return res.status(400).json({ error: 'Naam aur password lazmi hain' });
    }

    try {
        const client = await connectToDatabase();
        const db = client.db('smart_attendance');
        const collection = db.collection('teachers');

        // Check if teacher already exists
        const existing = await collection.findOne({ name });
        if (existing) {
            return res.status(400).json({ error: 'Yeh naam pehle se registered hai' });
        }

        // Insert new teacher
        await collection.insertOne({ name, password, createdAt: new Date() });
        return res.status(200).json({ success: true, name });
    } catch (err) {
        return res.status(500).json({ error: 'Database error: ' + err.message });
    }
}