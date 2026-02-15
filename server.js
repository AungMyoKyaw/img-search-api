require('dotenv').config();

const express = require('express');
const app = express();
const mongo = require('mongodb').MongoClient;
const imgSearch = require('google-images');

// Configuration from environment variables
const port = process.env.PORT || 8080;
const dbUrl = process.env.MONGODB_URI;
const apiKey = process.env.GOOGLE_API_KEY;
const cseId = process.env.GOOGLE_CSE_ID;

// Validate required environment variables
if (!dbUrl) {
  console.error('Error: MONGODB_URI environment variable is required');
  process.exit(1);
}

if (!apiKey || !cseId) {
  console.error('Error: GOOGLE_API_KEY and GOOGLE_CSE_ID environment variables are required');
  process.exit(1);
}

const client = new imgSearch(cseId, apiKey);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Image search endpoint
app.get('/api/imgSearch/:name', async (req, res) => {
  try {
    const page = parseInt(req.query.offset, 10) || 1;
    const imgName = req.params.name;
    const date = new Date().toISOString();

    // Input validation
    if (!imgName || imgName.trim().length === 0) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    if (page < 1 || page > 100) {
      return res.status(400).json({ error: 'Offset must be between 1 and 100' });
    }

    const images = await client.search(imgName, { page });

    if (images.length > 0) {
      try {
        const db = await mongo.connect(dbUrl);
        const imgSearchList = db.collection('imgSearchList');
        await imgSearchList.insertOne({ term: imgName, when: date });
        db.close();
      } catch (dbError) {
        // Log error but still return results - search logging is non-critical
        console.error('Failed to log search:', dbError.message);
      }
      res.json(images);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Failed to perform image search' });
  }
});

// Latest searches endpoint
app.get('/api/latest/imgsearch', async (req, res) => {
  let db;
  try {
    db = await mongo.connect(dbUrl);
    const imgSearchList = db.collection('imgSearchList');
    const docs = await imgSearchList
      .find({}, { projection: { _id: 0 } })
      .sort({ _id: -1 })
      .limit(10)
      .toArray();
    res.json(docs);
  } catch (error) {
    console.error('Failed to fetch latest searches:', error.message);
    res.status(500).json({ error: 'Failed to fetch latest searches' });
  } finally {
    if (db) {
      db.close();
    }
  }
});

// Static files
app.use('/', express.static('public'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
