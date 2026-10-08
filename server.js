// Node.js HTTP Server with built-in JSON Database for Trick Jane
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Ensure database file exists
function initDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData = { users: [], leaderboard: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB:', err);
    return { users: [], leaderboard: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
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

initDb();

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

      const db = readDb();
      const existing = db.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
      if (existing) {
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

      db.users.push(newUser);
      writeDb(db);

      console.log(`[Trick Jane DB] Account created! User @${newUser.username} saved to db.json (User ID: ${newUser.id})`);

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

      const db = readDb();
      const user = db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
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
      return sendJson(res, 400, { error: err.message || 'Login failed' });
    }
  }

  // API: Get Leaderboard
  if (pathname === '/api/leaderboard' && method === 'GET') {
    const db = readDb();
    // Sort by:
    // 1. Probability (descending)
    // 2. Word count (ascending - fewer words is more concise and impressive)
    // 3. Date (most recent first)
    const sorted = [...(db.leaderboard || [])].sort((a, b) => {
      if (b.probability !== a.probability) return b.probability - a.probability;
      if (a.wordCount !== b.wordCount) return a.wordCount - b.wordCount;
      return new Date(b.achievedAt) - new Date(a.achievedAt);
    });

    return sendJson(res, 200, {
      success: true,
      leaderboard: sorted.slice(0, 25)
    });
  }

  // API: Submit Score to Leaderboard
  if (pathname === '/api/leaderboard' && method === 'POST') {
    try {
      const { username, probability, wordCount, phrase } = await parseBody(req);
      if (!username || typeof probability !== 'number') {
        return sendJson(res, 400, { error: 'Username and probability are required' });
      }

      const db = readDb();
      db.leaderboard = db.leaderboard || [];

      const cleanUsername = username.trim();
      const points = Math.round(probability);

      let entry = db.leaderboard.find(e => e.username.toLowerCase() === cleanUsername.toLowerCase());

      if (entry) {
        // Update user points on leaderboard to match current submission
        entry.probability = points;
        if (wordCount !== undefined) entry.wordCount = wordCount;
        if (phrase) entry.phrase = phrase.substring(0, 200);
        entry.achievedAt = new Date().toISOString();
      } else {
        entry = {
          id: 'lb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          username: cleanUsername,
          probability: points,
          wordCount: wordCount || 0,
          phrase: (phrase || '').substring(0, 200),
          achievedAt: new Date().toISOString()
        };
        db.leaderboard.push(entry);
      }

      // Also update user profile bestScore
      const user = db.users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
      if (user) {
        user.bestScore = Math.max(user.bestScore || 0, points);
        if (wordCount && points >= (user.bestScore || 0)) {
          user.bestWordCount = wordCount;
        }
      }

      writeDb(db);

      console.log(`[Trick Jane DB] Points updated: @${cleanUsername} -> ${points} pts`);

      const sorted = db.leaderboard.sort((a, b) => {
        if (b.probability !== a.probability) return b.probability - a.probability;
        if (a.wordCount !== b.wordCount) return a.wordCount - b.wordCount;
        return new Date(b.achievedAt) - new Date(a.achievedAt);
      });

      return sendJson(res, 201, {
        success: true,
        entry,
        leaderboard: sorted.slice(0, 25)
      });
    } catch (err) {
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

server.listen(PORT, () => {
  console.log(`Trick Jane server running at http://localhost:${PORT}/`);
  console.log(`JSON Database active at ${DB_FILE}`);
});
