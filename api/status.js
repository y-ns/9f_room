const { kv } = require('@vercel/kv');

const ROOM_IDS = ['A', 'B', 'C', 'D'];
const STORAGE_KEY = 'room-status-v1';

function defaultRooms() {
  return ROOM_IDS.map((id) => ({ id, status: 'empty', updatedAt: null }));
}

module.exports = async (req, res) => {
  // CORSを許可（同一オリジンで使う想定だが念のため）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let rooms = await kv.get(STORAGE_KEY);
    if (!rooms) {
      rooms = defaultRooms();
      await kv.set(STORAGE_KEY, rooms);
    }
    return res.status(200).json({ rooms });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal error', detail: String(err) });
  }
};
