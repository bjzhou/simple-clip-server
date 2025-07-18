const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// 托管 public 目录下的静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 根路径重定向到 S 端页面
app.get('/', (req, res) => {
  res.redirect('/server.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // 监听 C 端发送过来的新内容（文本和图片）
  socket.on('new_content', (data) => {
    // data: { text: string, image: base64 string|null }
    console.log('received content:', data);
    // 广播给所有客户端（主要是 S 端）
    io.emit('content_updated', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 