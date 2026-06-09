const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const MAX_FILE_SIZE_BYTES = Number(process.env.MAX_FILE_SIZE_BYTES || 25 * 1024 * 1024);
const MAX_TEXT_LENGTH = Number(process.env.MAX_TEXT_LENGTH || 200000);

const io = new Server(server, {
  maxHttpBufferSize: MAX_FILE_SIZE_BYTES + 1024 * 1024,
});

const PORT = Number(process.env.PORT || 3000);

// 托管 public 目录下的静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 根路径重定向到 S 端页面
app.get('/', (req, res) => {
  res.redirect('/server.html');
});

app.get('/config', (req, res) => {
  res.json({
    maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
    maxTextLength: MAX_TEXT_LENGTH,
  });
});

function byteLengthOf(value) {
  if (!value) return 0;
  if (Buffer.isBuffer(value)) return value.byteLength;
  if (value instanceof ArrayBuffer) return value.byteLength;
  if (ArrayBuffer.isView(value)) return value.byteLength;
  if (typeof value === 'string') {
    const base64 = value.includes(',') ? value.split(',').pop() : value;
    return Math.floor((base64.length * 3) / 4);
  }
  return 0;
}

function sanitizeFileName(name) {
  const fallback = 'download';
  if (typeof name !== 'string') return fallback;

  const cleaned = name
    .replace(/[\\/]/g, '_')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim();

  return cleaned.slice(0, 180) || fallback;
}

function normalizeContent(data) {
  if (!data || typeof data !== 'object') {
    return { error: '无效的消息格式' };
  }

  const text = typeof data.text === 'string' ? data.text.slice(0, MAX_TEXT_LENGTH) : '';
  const payload = { text, file: null, timestamp: Date.now() };

  if (!data.file) {
    if (!text) return { error: '请输入文本或选择文件' };
    return { payload };
  }

  const file = data.file;
  if (!file || typeof file !== 'object') {
    return { error: '无效的文件格式' };
  }

  const size = Number(file.size) || byteLengthOf(file.data);
  if (!file.data || size <= 0) {
    return { error: '文件内容为空' };
  }

  if (size > MAX_FILE_SIZE_BYTES) {
    return { error: `文件超过大小限制（最大 ${Math.floor(MAX_FILE_SIZE_BYTES / 1024 / 1024)} MB）` };
  }

  payload.file = {
    name: sanitizeFileName(file.name),
    type: typeof file.type === 'string' ? file.type.slice(0, 120) : 'application/octet-stream',
    size,
    data: file.data,
  };

  return { payload };
}

io.on('connection', (socket) => {
  console.log('a user connected');

  // 监听 C 端发送过来的新内容（文本和文件）
  socket.on('new_content', (data, ack) => {
    // data: { text: string, file: { name, type, size, data } | null }
    const { payload, error } = normalizeContent(data);
    if (error) {
      if (typeof ack === 'function') ack({ ok: false, error });
      socket.emit('content_error', { error });
      return;
    }

    console.log('received content:', {
      textLength: payload.text.length,
      file: payload.file ? {
        name: payload.file.name,
        type: payload.file.type,
        size: payload.file.size,
      } : null,
    });

    // 广播给所有客户端（主要是 S 端）
    io.emit('content_updated', payload);
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = {
  app,
  server,
  io,
  normalizeContent,
  sanitizeFileName,
  byteLengthOf,
  MAX_FILE_SIZE_BYTES,
  MAX_TEXT_LENGTH,
};
