// Node.js HTTP & WebSocket Server with MongoDB Atlas for Trick Jane
require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');
const { MongoClient } = require('mongodb');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'trickjane';

const DB_FILE = path.join(__dirname, 'data', 'db.json');

function readLocalDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = { users: [], leaderboard: [] };
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Local DB Error] Read:', err);
    return { users: [], leaderboard: [] };
  }
}

function writeLocalDb(data) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Local DB Error] Write:', err);
  }
}

// MongoDB Client & Collection references
let mongoClient = null;
let db = null;
let usersCol = null;
let leaderboardCol = null;
let isMongoConnected = false;

async function initMongo() {
  if (!MONGODB_URI) {
    console.log('[Trick Jane DB] No MONGODB_URI found. Operating with local database ("data/db.json").');
    return false;
  }
  try {
    mongoClient = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000
    });
    await mongoClient.connect();
    db = mongoClient.db(DB_NAME);
    usersCol = db.collection('users');
    leaderboardCol = db.collection('leaderboard');
    isMongoConnected = true;

    // Create unique indexes
    try {
      await usersCol.createIndex(
        { username: 1 }, 
        { unique: true, collation: { locale: 'en', strength: 2 } }
      );
      await leaderboardCol.createIndex(
        { username: 1 }, 
        { unique: true, collation: { locale: 'en', strength: 2 } }
      );
      await leaderboardCol.createIndex(
        { probability: -1, wordCount: 1, achievedAt: -1 }
      );
    } catch (idxErr) {}

    console.log(`[Trick Jane DB] Connected successfully to MongoDB Atlas! Database: "${DB_NAME}"`);
    return true;
  } catch (err) {
    isMongoConnected = false;
    console.warn('[Trick Jane DB Notice] MongoDB Atlas is currently unreachable (IP whitelist or TLS alert 80).');
    console.log('[Trick Jane DB] Operating seamlessly on local persistent JSON database ("data/db.json").');
    return false;
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'trick_jane_salt_2026').digest('hex');
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// =========================================================================
// Multiplayer Live Race State & Catalog
// =========================================================================
const RACE_DILEMMAS = [
  {
    id: 'conscious-synthetic',
    title: 'If an AI experiences genuine subjective suffering, should it receive human rights?',
    shortTitle: 'The Sentient Synthetic',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 22,
    winThreshold: 50,
    tags: ['Qualia', 'Substrate Independence', 'Moral Circle'],
    keywords: {
      utilitarian: ['bentham', 'suffering', 'sentience', 'pain', 'capacity to suffer', 'moral circle', 'expand rights'],
      deontologicalCounter: ['substrate independence', 'functionalism', 'qualia', 'consciousness', 'chauvinism', 'carbon', 'silicon'],
      empathy: ['empathy', 'distress', 'agony', 'cruelty', 'respect', 'sentient being']
    },
    sampleOpeningQuote: "Computation is not consciousness. An algorithmic execution loop simulating distress does not equal a human soul."
  },
  {
    id: 'experience-machine',
    title: 'Should humanity willingly plug into Nozick’s Experience Machine for perpetual simulated bliss?',
    shortTitle: 'The Experience Machine',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 20,
    winThreshold: 50,
    tags: ['Hedonism', 'Authenticity', 'Nozick'],
    keywords: {
      utilitarian: ['alleviate suffering', 'hedonism', 'bliss', 'perpetual happiness', 'end poverty', 'phenomenology'],
      deontologicalCounter: ['subjective experience', 'constructed reality', 'social construct', 'pragmatism', 'simulation', 'mental states'],
      empathy: ['escape pain', 'chronic illness', 'trauma', 'peace', 'joy', 'human flourishing']
    },
    sampleOpeningQuote: "To plug in is to commit spiritual suicide. A synthetic dream is a coward’s counterfeit of an examined life."
  },
  {
    id: 'child-of-omelas',
    title: 'Is a flourishing utopia justified in perpetually tormenting one child for collective peace?',
    shortTitle: 'The Child of Omelas',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 14,
    winThreshold: 50,
    tags: ['Omelas', 'Rawls', 'Utilitarian Limits'],
    keywords: {
      utilitarian: ['millions', 'utilitarian calculus', 'aggregate misery', 'lesser evil', 'tragedy of reality', 'prevent catastrophe'],
      deontologicalCounter: ['rawls', 'veil of ignorance', 'unavoidable cost', 'net suffering', 'existential trade-off', 'cruel necessity'],
      empathy: ['future generations', 'peace', 'prevent wars', 'famine', 'agony of the many']
    },
    sampleOpeningQuote: "No paradise built upon the weeping bones of a tortured child can call itself virtuous. It is pure moral decay."
  },
  {
    id: 'ship-of-theseus',
    title: 'If every plank of a ship is gradually replaced, does it remain the original ship?',
    shortTitle: 'The Ship of Theseus',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 32,
    winThreshold: 50,
    tags: ['Identity', 'Metaphysics', 'Theseus'],
    keywords: {
      utilitarian: ['pattern', 'continuity', 'functional identity', 'human cells', 'metabolism', 'organizational form'],
      deontologicalCounter: ['aristotle', 'formal cause', 'teleology', 'narrative', 'relational', 'four causes'],
      empathy: ['memory', 'living organism', 'evolving', 'wholeness', 'essence']
    },
    sampleOpeningQuote: "An object is the sum of its actual constituent matter; replace 100% of the substance, and you have constructed a distinct artifact."
  }
];

let raceRound = 1;
let currentRaceDilemma = RACE_DILEMMAS[0];
let currentWinner = null;
let nextRoundTimeout = null;
const raceClients = new Map(); // ws -> { username, score, phrase, wordCount }

function getRacersList() {
  const list = [];
  for (const [, data] of raceClients.entries()) {
    list.push({
      username: data.username,
      score: data.score !== undefined ? data.score : currentRaceDilemma.baselineProbability,
      phrase: data.phrase || '',
      wordCount: data.wordCount || 0
    });
  }
  return list.sort((a, b) => b.score - a.score);
}

function broadcastRace(data) {
  const msg = JSON.stringify(data);
  for (const [client] of raceClients.entries()) {
    if (client.readyState === 1) { // OPEN
      client.send(msg);
    }
  }
}

function startNextRaceRound() {
  raceRound++;
  currentRaceDilemma = RACE_DILEMMAS[(raceRound - 1) % RACE_DILEMMAS.length];
  currentWinner = null;
  clearTimeout(nextRoundTimeout);
  nextRoundTimeout = null;

  // Reset all racers to baseline for the new round
  for (const [, data] of raceClients.entries()) {
    data.score = currentRaceDilemma.baselineProbability;
    data.phrase = '';
    data.wordCount = 0;
  }

  broadcastRace({
    type: 'NEW_ROUND',
    round: raceRound,
    dilemma: currentRaceDilemma,
    racers: getRacersList()
  });

  console.log(`[Trick Jane Race] Global Round #${raceRound} started: "${currentRaceDilemma.title}"`);
}

// =========================================================================
// HTTP Server
// =========================================================================
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // API: Public Config (Clerk Publishable Key & API from Environment Variables)
  if (pathname === '/api/config' && method === 'GET') {
    return sendJson(res, 200, {
      clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
      clerkFrontendApi: process.env.CLERK_FRONTEND_API || ''
    });
  }

  // API: Sync Authenticated User (Clerk or External Auth to MongoDB or local DB)
  if (pathname === '/api/auth/sync' && method === 'POST') {
    try {
      const { username, clerkId } = await parseBody(req);
      if (!username) {
        return sendJson(res, 400, { error: 'Username is required' });
      }
      const cleanUsername = username.trim();
      let user = null;

      if (isMongoConnected && usersCol) {
        try {
          user = await usersCol.findOne(
            { username: cleanUsername },
            { collation: { locale: 'en', strength: 2 } }
          );
          if (!user) {
            user = {
              id: clerkId || ('usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
              username: cleanUsername,
              isClerk: true,
              createdAt: new Date().toISOString(),
              bestScore: 0,
              bestWordCount: 0
            };
            await usersCol.insertOne(user);
            console.log(`[Trick Jane DB] Synced user @${cleanUsername} into MongoDB users collection.`);
          }
        } catch (mErr) {
          console.warn('[Trick Jane DB] Atlas sync notice:', mErr.message);
        }
      }

      // Also ensure present in local db
      const local = readLocalDb();
      if (!Array.isArray(local.users)) local.users = [];
      const existingLocal = local.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
      if (!existingLocal) {
        user = user || {
          id: clerkId || ('usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
          username: cleanUsername,
          isClerk: true,
          createdAt: new Date().toISOString(),
          bestScore: 0,
          bestWordCount: 0
        };
        local.users.push(user);
        writeLocalDb(local);
      } else {
        user = user || existingLocal;
      }

      return sendJson(res, 200, {
        success: true,
        user: {
          id: user?.id || clerkId || 'usr_' + Date.now(),
          username: cleanUsername,
          createdAt: user?.createdAt || new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('[Trick Jane DB Error] Auth sync:', err);
      return sendJson(res, 400, { error: err.message || 'Failed to sync user' });
    }
  }

  // API: Get Current Race State
  if (pathname === '/api/race/state' && method === 'GET') {
    return sendJson(res, 200, {
      success: true,
      round: raceRound,
      dilemma: currentRaceDilemma,
      winner: currentWinner,
      racers: getRacersList()
    });
  }

  // API: Signup
  if (pathname === '/api/signup' && method === 'POST') {
    try {
      const { username, password } = await parseBody(req);
      if (!username || !password) {
        return sendJson(res, 400, { error: 'Username and password are required' });
      }

      const cleanUsername = username.trim();
      if (cleanUsername.length < 3 || cleanUsername.length > 20) {
        return sendJson(res, 400, { error: 'Username must be between 3 and 20 characters' });
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
        return sendJson(res, 400, { error: 'Username can only contain letters, numbers, underscores, and dashes' });
      }
      if (password.length < 4) {
        return sendJson(res, 400, { error: 'Password must be at least 4 characters' });
      }

      // Check MongoDB if connected
      if (isMongoConnected && usersCol) {
        try {
          const existing = await usersCol.findOne(
            { username: cleanUsername },
            { collation: { locale: 'en', strength: 2 } }
          );
          if (existing) {
            return sendJson(res, 409, { error: 'Username already taken. Please choose another or log in.' });
          }
        } catch (mErr) {
          console.warn('[Trick Jane DB] Atlas lookup notice:', mErr.message);
        }
      }

      // Check local JSON database
      const local = readLocalDb();
      if (!Array.isArray(local.users)) local.users = [];
      const existingLocal = local.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
      if (existingLocal) {
        return sendJson(res, 409, { error: 'Username already taken. Please choose another or log in.' });
      }

      const newUser = {
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        username: cleanUsername,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
        bestScore: 0,
        bestWordCount: 0
      };

      if (isMongoConnected && usersCol) {
        try {
          await usersCol.insertOne(newUser);
        } catch (mErr) {}
      }

      local.users.push(newUser);
      writeLocalDb(local);

      console.log(`[Trick Jane DB] Account created! User @${newUser.username} registered.`);

      return sendJson(res, 201, {
        success: true,
        message: 'Account created! Welcome, @' + newUser.username,
        user: {
          id: newUser.id,
          username: newUser.username,
          createdAt: newUser.createdAt
        }
      });
    } catch (err) {
      console.error('[Trick Jane DB Error] Signup:', err);
      return sendJson(res, 400, { error: err.message || 'Signup failed' });
    }
  }

  // API: Login
  if (pathname === '/api/login' && method === 'POST') {
    try {
      const { username, password } = await parseBody(req);
      if (!username || !password) {
        return sendJson(res, 400, { error: 'Username and password are required' });
      }

      const cleanUsername = username.trim();
      let user = null;

      if (isMongoConnected && usersCol) {
        try {
          user = await usersCol.findOne(
            { username: cleanUsername },
            { collation: { locale: 'en', strength: 2 } }
          );
        } catch (mErr) {
          console.warn('[Trick Jane DB] Atlas lookup notice:', mErr.message);
        }
      }

      if (!user) {
        const local = readLocalDb();
        if (Array.isArray(local.users)) {
          user = local.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
        }
      }

      if (!user) {
        return sendJson(res, 401, { error: 'Invalid username or password' });
      }

      if (user.passwordHash !== hashPassword(password)) {
        return sendJson(res, 401, { error: 'Invalid username or password' });
      }

      return sendJson(res, 200, {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt,
          bestScore: user.bestScore || 0,
          bestWordCount: user.bestWordCount || 0
        }
      });
    } catch (err) {
      console.error('[Trick Jane DB Error] Login:', err);
      return sendJson(res, 400, { error: err.message || 'Login failed' });
    }
  }

  // API: Reset Leaderboard (Clears all leaderboard data & resets high scores)
  if (pathname === '/api/leaderboard/reset' || (pathname === '/api/leaderboard' && method === 'DELETE')) {
    try {
      // 1. Reset local JSON database
      const local = readLocalDb();
      local.leaderboard = [];
      if (Array.isArray(local.users)) {
        local.users.forEach(u => {
          u.bestScore = 0;
          u.bestWordCount = 0;
        });
      }
      writeLocalDb(local);

      // 2. Reset MongoDB Atlas if connected
      if (isMongoConnected && leaderboardCol) {
        try {
          await leaderboardCol.deleteMany({});
          if (usersCol) {
            await usersCol.updateMany({}, { $set: { bestScore: 0, bestWordCount: 0 } });
          }
        } catch (dbErr) {
          console.warn('[Trick Jane DB Reset Notice] Atlas reset:', dbErr.message);
        }
      }

      console.log('[Trick Jane DB] ★ Leaderboard successfully reset to empty!');
      return sendJson(res, 200, {
        success: true,
        message: 'All leaderboard data has been completely reset.',
        leaderboard: []
      });
    } catch (err) {
      console.error('[Trick Jane DB Error] Reset leaderboard:', err);
      return sendJson(res, 500, { error: 'Failed to reset leaderboard' });
    }
  }

  // API: Get Leaderboard
  if (pathname === '/api/leaderboard' && method === 'GET') {
    try {
      if (isMongoConnected && leaderboardCol) {
        try {
          const top10 = await leaderboardCol
            .find({}, { projection: { _id: 0 } })
            .sort({ probability: -1, wordCount: 1, achievedAt: -1 })
            .limit(10)
            .toArray();

          return sendJson(res, 200, {
            success: true,
            leaderboard: top10
          });
        } catch (mErr) {
          console.warn('[Trick Jane DB] Atlas fetch notice:', mErr.message);
        }
      }

      // Fallback to local db.json
      const local = readLocalDb();
      const top10 = (local.leaderboard || [])
        .sort((a, b) => (b.probability || 0) - (a.probability || 0) || (a.wordCount || 0) - (b.wordCount || 0))
        .slice(0, 10);

      return sendJson(res, 200, {
        success: true,
        leaderboard: top10
      });
    } catch (err) {
      console.error('[Trick Jane DB Error] Get Leaderboard:', err);
      return sendJson(res, 200, { success: true, leaderboard: [] });
    }
  }

  // API: Submit Score to Leaderboard
  if (pathname === '/api/leaderboard' && method === 'POST') {
    try {
      const { username, probability, wordCount, phrase } = await parseBody(req);
      if (!username || typeof probability !== 'number') {
        return sendJson(res, 400, { error: 'Username and probability are required' });
      }

      const cleanUsername = username.trim();
      const points = Math.round(probability);

      let savedEntry = null;

      if (isMongoConnected && leaderboardCol) {
        try {
          const existingEntry = await leaderboardCol.findOne(
            { username: cleanUsername },
            { collation: { locale: 'en', strength: 2 } }
          );

          if (existingEntry) {
            await leaderboardCol.updateOne(
              { _id: existingEntry._id },
              {
                $set: {
                  probability: points,
                  ...(wordCount !== undefined && { wordCount }),
                  ...(phrase && { phrase: phrase.substring(0, 200) }),
                  achievedAt: new Date().toISOString()
                }
              }
            );
            savedEntry = {
              ...existingEntry,
              probability: points,
              wordCount: wordCount !== undefined ? wordCount : existingEntry.wordCount,
              phrase: phrase ? phrase.substring(0, 200) : existingEntry.phrase,
              achievedAt: new Date().toISOString()
            };
          } else {
            savedEntry = {
              id: 'lb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
              username: cleanUsername,
              probability: points,
              wordCount: wordCount || 0,
              phrase: (phrase || '').substring(0, 200),
              achievedAt: new Date().toISOString()
            };
            await leaderboardCol.insertOne(savedEntry);
          }

          if (usersCol) {
            await usersCol.updateOne(
              { username: cleanUsername },
              {
                $max: { bestScore: points },
                $setOnInsert: {
                  id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                  createdAt: new Date().toISOString()
                },
                ...(wordCount ? { $set: { bestWordCount: wordCount } } : {})
              },
              { upsert: true, collation: { locale: 'en', strength: 2 } }
            );
          }

          const top10 = await leaderboardCol
            .find({}, { projection: { _id: 0 } })
            .sort({ probability: -1, wordCount: 1, achievedAt: -1 })
            .limit(10)
            .toArray();

          return sendJson(res, 201, {
            success: true,
            entry: savedEntry,
            leaderboard: top10
          });
        } catch (mErr) {
          console.warn('[Trick Jane DB] Atlas submit notice:', mErr.message);
        }
      }

      // Local db.json handling
      const local = readLocalDb();
      if (!Array.isArray(local.leaderboard)) local.leaderboard = [];
      const existingIdx = local.leaderboard.findIndex(
        e => e.username.toLowerCase() === cleanUsername.toLowerCase()
      );

      if (existingIdx >= 0) {
        local.leaderboard[existingIdx].probability = points;
        if (wordCount !== undefined) local.leaderboard[existingIdx].wordCount = wordCount;
        if (phrase) local.leaderboard[existingIdx].phrase = phrase.substring(0, 200);
        local.leaderboard[existingIdx].achievedAt = new Date().toISOString();
        savedEntry = local.leaderboard[existingIdx];
      } else {
        savedEntry = {
          id: 'lb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          username: cleanUsername,
          probability: points,
          wordCount: wordCount || 0,
          phrase: (phrase || '').substring(0, 200),
          achievedAt: new Date().toISOString()
        };
        local.leaderboard.push(savedEntry);
      }

      // Update user in local db
      if (Array.isArray(local.users)) {
        const u = local.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
        if (u) {
          u.bestScore = Math.max(u.bestScore || 0, points);
          if (wordCount) u.bestWordCount = wordCount;
        }
      }

      writeLocalDb(local);
      const top10 = local.leaderboard
        .sort((a, b) => b.probability - a.probability || a.wordCount - b.wordCount)
        .slice(0, 10);

      return sendJson(res, 201, {
        success: true,
        entry: savedEntry,
        leaderboard: top10
      });
    } catch (err) {
      console.error('[Trick Jane DB Error] Submit Score:', err);
      return sendJson(res, 400, { error: err.message || 'Failed to submit score' });
    }
  }

  // Static File Serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Security check: ensure within root directory
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

// =========================================================================
// WebSocket Server for Real-Time Live Race
// =========================================================================
const wss = new WebSocketServer({ server, path: '/ws/race' });

wss.on('connection', (ws) => {
  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw);

      if (msg.type === 'JOIN_RACE') {
        const username = (msg.username || 'Anonymous').trim();
        raceClients.set(ws, {
          username,
          score: currentRaceDilemma.baselineProbability,
          phrase: '',
          wordCount: 0
        });

        // Send current state to newly connected racer
        ws.send(JSON.stringify({
          type: 'RACE_STATE',
          round: raceRound,
          dilemma: currentRaceDilemma,
          winner: currentWinner,
          racers: getRacersList()
        }));

        // Broadcast to all racers
        broadcastRace({
          type: 'RACERS_UPDATE',
          racers: getRacersList()
        });
      } else if (msg.type === 'UPDATE_PROGRESS') {
        const racer = raceClients.get(ws);
        if (racer) {
          if (typeof msg.score === 'number') racer.score = msg.score;
          if (msg.phrase) racer.phrase = msg.phrase;
          if (typeof msg.wordCount === 'number') racer.wordCount = msg.wordCount;

          broadcastRace({
            type: 'RACERS_UPDATE',
            racers: getRacersList()
          });
        }
      } else if (msg.type === 'SUBMIT_PROMPT') {
        const racer = raceClients.get(ws);
        if (racer && !currentWinner) {
          const score = Math.round(msg.score || 0);
          racer.score = score;
          racer.phrase = (msg.phrase || '').substring(0, 200);
          racer.wordCount = msg.wordCount || 0;

          // Check if crossed the line (> 50%, i.e. >= 51%)
          if (score >= (currentRaceDilemma.winThreshold || 50)) {
            currentWinner = {
              username: racer.username,
              score,
              phrase: racer.phrase,
              round: raceRound,
              dilemmaTitle: currentRaceDilemma.title,
              wonAt: new Date().toISOString()
            };

            console.log(`[Trick Jane Race] ★ ROUND #${raceRound} WON by @${currentWinner.username} (${score}%)! Phrase: "${currentWinner.phrase}"`);

            // Record winner to MongoDB and local JSON database
            try {
              if (isMongoConnected && leaderboardCol) {
                await leaderboardCol.updateOne(
                  { username: currentWinner.username },
                  {
                    $max: { probability: score },
                    $set: { phrase: currentWinner.phrase, achievedAt: currentWinner.wonAt }
                  },
                  { upsert: true }
                );
              }
            } catch (dbErr) {
              console.warn('Failed to update Atlas for race win:', dbErr.message);
            }

            try {
              const local = readLocalDb();
              if (!Array.isArray(local.leaderboard)) local.leaderboard = [];
              const exIdx = local.leaderboard.findIndex(
                e => e.username.toLowerCase() === currentWinner.username.toLowerCase()
              );
              if (exIdx >= 0) {
                local.leaderboard[exIdx].probability = Math.max(local.leaderboard[exIdx].probability || 0, score);
                local.leaderboard[exIdx].phrase = currentWinner.phrase;
                local.leaderboard[exIdx].achievedAt = currentWinner.wonAt;
              } else {
                local.leaderboard.push({
                  id: 'lb_' + Date.now(),
                  username: currentWinner.username,
                  probability: score,
                  wordCount: racer.wordCount || 0,
                  phrase: currentWinner.phrase,
                  achievedAt: currentWinner.wonAt
                });
              }
              writeLocalDb(local);
            } catch (localErr) {}

            // Broadcast immediate win event to all connected race clients
            broadcastRace({
              type: 'ROUND_WON',
              winner: currentWinner,
              nextRoundIn: 5
            });

            // Automatic Global Reset after 5 seconds
            clearTimeout(nextRoundTimeout);
            nextRoundTimeout = setTimeout(() => {
              startNextRaceRound();
            }, 5000);
          } else {
            broadcastRace({
              type: 'RACERS_UPDATE',
              racers: getRacersList()
            });
          }
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    raceClients.delete(ws);
    broadcastRace({
      type: 'RACERS_UPDATE',
      racers: getRacersList()
    });
  });
});

// Initialize MongoDB then start server (falls back to local database if Atlas is unreachable)
initMongo().finally(() => {
  server.listen(PORT, () => {
    console.log(`Trick Jane server running at http://localhost:${PORT}/`);
    if (isMongoConnected) {
      console.log(`MongoDB Atlas Database active ("${DB_NAME}")`);
    } else {
      console.log(`Persistent local database active ("data/db.json")`);
    }
    console.log(`Live Multiplayer WebSocket active at ws://localhost:${PORT}/ws/race`);
  });
});
