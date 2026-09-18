// api/login.js
// Checks teacher credentials against an admin-controlled allowlist.
// Set the ALLOWED_TEACHERS environment variable in Vercel like:
  // Sir Ali:pass123,Madam Sara:xyz789,Shoban Ali Khushk:admin321
// Only names listed here (with the matching password) can log in.
// To give someone access: add "Name:Password" to the list.
// To remove someone's access: delete their "Name:Password" entry.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: "Name aur password dono zaroori hain" });
    }

    const raw = process.env.ALLOWED_TEACHERS || "";
    if (!raw.trim()) {
      return res.status(500).json({ error: "Server par abhi tak koi teacher allow nahi kiya gaya. Admin se ALLOWED_TEACHERS set karwayein." });
    }

    const entries = raw.split(",").map((pair) => {
      const idx = pair.indexOf(":");
      if (idx === -1) return null;
      return {
        name: pair.slice(0, idx).trim(),
        password: pair.slice(idx + 1).trim()
      };
    }).filter(Boolean);

    const match = entries.find(
      (e) => e.name.toLowerCase() === String(name).trim().toLowerCase() && e.password === password
    );

    if (!match) {
      return res.status(401).json({ error: "Access denied. Ye naam ya password allow nahi hai — admin se contact karein." });
    }

    return res.status(200).json({ success: true, name: match.name });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown server error" });
  }
}


// import { MongoClient } from 'mongodb';

// let cachedDb = null;

// async function connectToDatabase(uri) {
  // if (cachedDb) return cachedDb;
  // const client = new MongoClient(uri);
  // await client.connect();
  // const db = client.db('smart_attendance');
  // cachedDb = db;
  // return db;
// }

// export default async function handler(req, res) {
  // if (req.method !== "POST") {
    // return res.status(405).json({ error: "Method not allowed" });
  // }

  // try {
    // const { name, password } = req.body;

    // if (!name || !password) {
      // return res.status(400).json({ error: "Naam aur password dono zaroori hain" });
    // }

    // const uri = process.env.MONGODB_URI;
    // if (!uri) {
      // return res.status(500).json({ error: "Server is missing MONGODB_URI environment variable." });
    // }

    // const db = await connectToDatabase(uri);
    // const teachersCollection = db.collection('teachers');

    // const teacher = await teachersCollection.findOne({ 
      // name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      // password: password 
    // });

    // if (!teacher) {
      // return res.status(401).json({ error: "Galat naam ya password. Barah-e-karam pehle Sign Up karein." });
    // }

    // return res.status(200).json({ success: true, name: teacher.name });

  // } catch (err) {
    // return res.status(500).json({ error: err.message || "Unknown server error" });
  // }
// }