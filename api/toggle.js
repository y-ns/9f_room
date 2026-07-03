const { kv } = require('@vercel/kv');

const ROOM_IDS = ['A', 'B', 'C', 'D'];
const STORAGE_KEY = 'room-status-v1';

function defaultRooms() {
  return ROOM_IDS.map((id) => ({ id, status: 'empty', updatedAt: null }));
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const room = (req.query && req.query.room) || (req.body && req.body.room);

  if (!room || !ROOM_IDS.includes(room)) {
    return res.status(400).json({ error: 'invalid room' });
  }

  try {
    let rooms = await kv.get(STORAGE_KEY);
    if (!rooms) rooms = defaultRooms();

    const now = new Date().toISOString();
    rooms = rooms.map((r) =>
      r.id === room
        ? { ...r, status: r.status === 'empty' ? 'using' : 'empty', updatedAt: now }
        : r
    );

    await kv.set(STORAGE_KEY, rooms);

    const updated = rooms.find((r) => r.id === room);
    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal error', detail: String(err) });
  }
};
