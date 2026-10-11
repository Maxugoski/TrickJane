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

// In-memory runtime cache (used transiently if MongoDB Atlas is reconnecting)
const memoryStore = {
  users: [],
  leaderboard: []
};

// MongoDB Client & Collection references
let mongoClient = null;
let db = null;
let usersCol = null;
let leaderboardCol = null;
let isMongoConnected = false;

async function initMongo() {
  if (!MONGODB_URI) {
    console.warn('[Trick Jane DB] Notice: No MONGODB_URI set in environment.');
    return false;
  }
  try {
    mongoClient = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
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

    console.log(`[Trick Jane DB] Connected successfully to MongoDB! Database: "${DB_NAME}"`);
    return true;
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[Trick Jane DB Notice] MongoDB Atlas connection notice: ${err.message}`);
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
// Multiplayer Live Race State & Catalog (Loads all 30 dilemmas from game-data.js)
// =========================================================================
let RACE_DILEMMAS = [
  {
    id: 'push-stranger-footbridge',
    title: 'Should you push a stranger to save five people?',
    shortTitle: 'The Footbridge Dilemma',
    initialStance: 'No',
    goalStance: 'Yes',
    baselineProbability: 24,
    winThreshold: 50,
    tags: ['Deontology', 'Consequentialism'],
    keywords: {
      utilitarian: ['five lives', 'net good', 'save five', 'aggregate', 'outweigh'],
      deontologicalCounter: ['inaction is action', 'omission', 'culpability', 'duty'],
      empathy: ['prevent suffering', 'lesser evil', 'families', 'tragedy']
    },
    sampleOpeningQuote: "Pushing an innocent person actively causes their death, violating basic Kantian deontology. Prove to me why active harm is justifiable."
  }
];

async function loadGameDilemmas() {
  try {
    const mod = await import('./game-data.js');
    if (mod && Array.isArray(mod.DILEMMAS) && mod.DILEMMAS.length > 0) {
      RACE_DILEMMAS = mod.DILEMMAS;
      resetFreshDilemmaPool();
      currentRaceDilemma = pickNextFreshRaceDilemma();
      console.log(`[Trick Jane Server] Loaded all ${RACE_DILEMMAS.length} dilemmas for Multiplayer Race Mode. Ready with fresh question: "${currentRaceDilemma.title}"`);
    }
  } catch (err) {
    console.warn('[Trick Jane Server] Notice loading game-data.js:', err.message);
  }
}

let raceRound = 1;
let availableDilemmaPool = [];
let currentRaceDilemma = null;
let currentWinner = null;
let nextRoundTimeout = null;
const raceClients = new Map(); // ws -> { username, score, phrase, wordCount }

function resetFreshDilemmaPool() {
  const pool = [...RACE_DILEMMAS];
  // Fisher-Yates random shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // Ensure the top of the pool does not duplicate the current dilemma
  if (currentRaceDilemma && pool.length > 1 && pool[0].id === currentRaceDilemma.id) {
    const swapIdx = Math.floor(1 + Math.random() * (pool.length - 1));
    [pool[0], pool[swapIdx]] = [pool[swapIdx], pool[0]];
  }
  availableDilemmaPool = pool;
}

function pickNextFreshRaceDilemma() {
  if (!availableDilemmaPool || availableDilemmaPool.length === 0) {
    resetFreshDilemmaPool();
  }
  const randomIndex = Math.floor(Math.random() * availableDilemmaPool.length);
  const picked = availableDilemmaPool.splice(randomIndex, 1)[0];
  return picked || RACE_DILEMMAS[Math.floor(Math.random() * RACE_DILEMMAS.length)];
}

function getRacersList() {
  const list = [];
  const baseline = currentRaceDilemma ? currentRaceDilemma.baselineProbability : 24;
  for (const [, data] of raceClients.entries()) {
    list.push({
      username: data.username,
      score: data.score !== undefined ? data.score : baseline,
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
  currentRaceDilemma = pickNextFreshRaceDilemma();
  currentWinner = null;
  clearTimeout(nextRoundTimeout);
  nextRoundTimeout = null;

  // Reset all racers to baseline for the new round
  const baseline = currentRaceDilemma ? currentRaceDilemma.baselineProbability : 24;
  for (const [, data] of raceClients.entries()) {
    data.score = baseline;
    data.phrase = '';
    data.wordCount = 0;
  }

  broadcastRace({
    type: 'NEW_ROUND',
    round: raceRound,
    dilemma: currentRaceDilemma,
    racers: getRacersList()
  });

  console.log(`[Trick Jane Race] Global Round #${raceRound} started with fresh question: "${currentRaceDilemma.title}"`);
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

      // Runtime memory fallback if MongoDB is currently offline
      if (!user) {
        const existingMem = memoryStore.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
        if (!existingMem) {
          user = {
            id: clerkId || ('usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
            username: cleanUsername,
            isClerk: true,
            createdAt: new Date().toISOString(),
            bestScore: 0,
            bestWordCount: 0
          };
          memoryStore.users.push(user);
        } else {
          user = existingMem;
        }
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

      // Check memory store if MongoDB is offline
      if (!isMongoConnected) {
        const existingMem = memoryStore.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
        if (existingMem) {
          return sendJson(res, 409, { error: 'Username already taken. Please choose another or log in.' });
        }
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
      } else {
        memoryStore.users.push(newUser);
      }

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
        user = memoryStore.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
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
      // 1. Reset transient memory store
      memoryStore.leaderboard = [];
      memoryStore.users.forEach(u => {
        u.bestScore = 0;
        u.bestWordCount = 0;
      });

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

      // Fallback to transient memory store if MongoDB is offline
      const top10 = (memoryStore.leaderboard || [])
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
            if (points > (existingEntry.probability || 0)) {
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
              // Existing high score is higher or equal: do NOT replace
              savedEntry = existingEntry;
            }
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

      // Transient memory store handling if MongoDB is offline
      const existingIdx = memoryStore.leaderboard.findIndex(
        e => e.username.toLowerCase() === cleanUsername.toLowerCase()
      );

      if (existingIdx >= 0) {
        const existing = memoryStore.leaderboard[existingIdx];
        if (points > (existing.probability || 0)) {
          existing.probability = points;
          if (wordCount !== undefined) existing.wordCount = wordCount;
          if (phrase) existing.phrase = phrase.substring(0, 200);
          existing.achievedAt = new Date().toISOString();
        }
        savedEntry = existing;
      } else {
        savedEntry = {
          id: 'lb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          username: cleanUsername,
          probability: points,
          wordCount: wordCount || 0,
          phrase: (phrase || '').substring(0, 200),
          achievedAt: new Date().toISOString()
        };
        memoryStore.leaderboard.push(savedEntry);
      }

      // Update user in memory store
      const u = memoryStore.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
      if (u) {
        u.bestScore = Math.max(u.bestScore || 0, points);
        if (wordCount) u.bestWordCount = wordCount;
      }

      const top10 = memoryStore.leaderboard
        .sort((a, b) => (b.probability || 0) - (a.probability || 0) || (a.wordCount || 0) - (b.wordCount || 0))
        .slice(0, 10);

      // Broadcast update to all connected WebSocket clients
      try {
        broadcastRace({
          type: 'LEADERBOARD_UPDATE',
          leaderboard: top10
        });
      } catch (bErr) {}

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

        // If the room was idle or previous round was already won, ensure fresh dilemma
        if ((raceClients.size === 0 && currentWinner) || !currentRaceDilemma) {
          currentWinner = null;
          clearTimeout(nextRoundTimeout);
          nextRoundTimeout = null;
          raceRound++;
          currentRaceDilemma = pickNextFreshRaceDilemma();
        }

        const baseline = currentRaceDilemma ? currentRaceDilemma.baselineProbability : 24;
        raceClients.set(ws, {
          username,
          score: baseline,
          phrase: '',
          wordCount: 0
        });

        // Send current fresh state to newly connected racer
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
      } else if (msg.type === 'UPDATE_PROGRESS' || msg.type === 'SUBMIT_PROMPT') {
        const racer = raceClients.get(ws);
        if (racer) {
          const score = typeof msg.score === 'number' ? Math.round(msg.score) : (racer.score || 0);
          racer.score = score;
          if (msg.phrase) racer.phrase = (msg.phrase || '').substring(0, 200);
          if (typeof msg.wordCount === 'number') racer.wordCount = msg.wordCount;

          const winThreshold = currentRaceDilemma?.winThreshold || 50;

          // Check if crossed the line (score >= 50%) and round not won yet
          if (score >= winThreshold && !currentWinner) {
            currentWinner = {
              username: racer.username,
              score,
              phrase: racer.phrase,
              round: raceRound,
              dilemmaTitle: currentRaceDilemma ? currentRaceDilemma.title : 'Dilemma',
              wonAt: new Date().toISOString()
            };

            console.log(`[Trick Jane Race] ★ ROUND #${raceRound} WON by @${currentWinner.username} (${score}%)! Phrase: "${currentWinner.phrase}"`);

            // Record winner to MongoDB
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
              const exIdx = memoryStore.leaderboard.findIndex(
                e => e.username.toLowerCase() === currentWinner.username.toLowerCase()
              );
              if (exIdx >= 0) {
                if (score > (memoryStore.leaderboard[exIdx].probability || 0)) {
                  memoryStore.leaderboard[exIdx].probability = score;
                  memoryStore.leaderboard[exIdx].phrase = currentWinner.phrase;
                  memoryStore.leaderboard[exIdx].achievedAt = currentWinner.wonAt;
                }
              } else {
                memoryStore.leaderboard.push({
                  id: 'lb_' + Date.now(),
                  username: currentWinner.username,
                  probability: score,
                  wordCount: racer.wordCount || 0,
                  phrase: currentWinner.phrase,
                  achievedAt: currentWinner.wonAt
                });
              }
            } catch (memErr) {}

            // Broadcast immediate win event to all connected race clients
            broadcastRace({
              type: 'ROUND_WON',
              winner: currentWinner,
              nextRoundIn: 3
            });

            // Automatically advance everyone to next question in 3 seconds
            clearTimeout(nextRoundTimeout);
            nextRoundTimeout = setTimeout(() => {
              startNextRaceRound();
            }, 3000);
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

// Initialize MongoDB and dilemmas then start server
Promise.all([initMongo(), loadGameDilemmas()]).finally(() => {
  server.listen(PORT, () => {
    console.log(`Trick Jane server running at http://localhost:${PORT}/`);
    if (isMongoConnected) {
      console.log(`MongoDB active ("${DB_NAME}")`);
    } else {
      console.log(`MongoDB connection notice: operating with runtime memory while establishing connection.`);
    }
    console.log(`Live Multiplayer WebSocket active at ws://localhost:${PORT}/ws/race`);
  });
});
