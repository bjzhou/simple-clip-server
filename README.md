# 文本同步服务 (Clip Server)

一个简单的 C/S 架构剪贴板同步服务，支持实时文本、图片和文件传输展示。

## 功能特性

- **服务端 (S端)**: 展示二维码和同步的文本内容
- **客户端 (C端)**: 提供文本输入和上传功能
- **实时同步**: 使用 WebSocket 实现即时文本、图片和文件传输
- **图片预览**: 客户端选择图片后可预览，服务端收到图片后可预览和下载
- **文件下载**: 非图片文件会在服务端生成下载链接
- **传输保护**: 默认限制单个文件最大 25 MB，并清理危险文件名
- **二维码分享**: 自动生成客户端访问链接的二维码
- **响应式设计**: 支持移动端和桌面端访问

## 技术栈

- **后端**: Node.js + Express + Socket.IO
- **前端**: HTML + CSS + JavaScript
- **容器化**: Docker + Docker Compose

## 快速开始

### 方式一：使用 Docker Compose (推荐)

1. 克隆项目
```bash
git clone <repository-url>
cd clip-server
```

2. 启动服务
```bash
docker-compose up -d --build
```

3. 访问应用
- 服务端: http://localhost:3000
- 客户端: http://localhost:3000/client.html

### 方式二：本地开发

1. 安装依赖
```bash
npm install
```

2. 启动服务
```bash
npm start
```

3. 访问应用
- 服务端: http://localhost:3000
- 客户端: http://localhost:3000/client.html

## 使用说明

### 服务端使用
1. 在浏览器中打开 http://localhost:3000
2. 页面会显示一个二维码，内容指向客户端页面
3. 使用手机扫描二维码即可打开客户端页面
4. 当客户端发送文本、图片或文件时，服务端会实时显示同步的内容

### 客户端使用
1. 通过扫描服务端二维码或直接访问 http://localhost:3000/client.html
2. 在文本框中输入要同步的内容，或选择要发送的图片/文件
3. 点击"上传"按钮
4. 内容会立即同步到服务端显示；图片会预览，其他文件可下载

## 项目结构

```
clip-server/
├── public/
│   ├── server.html      # 服务端展示页面
│   └── client.html      # 客户端输入页面
├── server.js            # 后端服务主文件
├── package.json         # 项目依赖配置
├── Dockerfile           # Docker 镜像配置
├── docker-compose.yaml  # Docker Compose 配置
└── README.md           # 项目说明文档
```

## API 接口

### WebSocket 事件

- `new_content`: 客户端发送新内容到服务器
  - 载荷：`{ text: string, file: { name, type, size, data } | null }`
  - `file.data` 使用 Socket.IO 二进制传输，浏览器端为 `ArrayBuffer`
- `content_updated`: 服务器广播内容更新到所有客户端
- `content_error`: 服务器返回内容校验或传输错误

## 环境要求

- Node.js >= 14.0.0
- Docker >= 20.0.0 (可选)
- Docker Compose >= 2.0.0 (可选)

## 配置说明

### 端口配置
默认端口为 3000，可以在 `server.js` 中修改 `PORT` 变量：

```javascript
const PORT = 3000; // 修改为其他端口
```

### 传输大小配置
默认单个文件最大 25 MB，可以通过环境变量调整：

```bash
MAX_FILE_SIZE_BYTES=52428800 npm start
```

文本默认最大保留 200000 个字符，可以通过 `MAX_TEXT_LENGTH` 调整。

### Docker 配置
如需修改 Docker 配置，请编辑 `docker-compose.yaml` 文件中的端口映射：

```yaml
ports:
  - "3000:3000"  # 格式: "宿主机端口:容器端口"
```

## 开发说明

### 添加新功能
1. 在 `server.js` 中添加新的 Socket.IO 事件处理
2. 在对应的 HTML 文件中添加前端逻辑
3. 测试功能是否正常工作

### 调试模式
本地开发时可以使用 nodemon 实现热重载：

```bash
npm install -g nodemon
nodemon server.js
```

## 常见问题

### Q: 二维码无法扫描？
A: 确保服务端和客户端在同一个网络环境下，并且防火墙没有阻止端口访问。

### Q: 文本同步延迟？
A: 检查网络连接，确保 WebSocket 连接正常建立。

### Q: Docker 容器启动失败？
A: 检查端口是否被占用，可以使用 `docker-compose logs` 查看详细错误信息。

## 许可证

ISC License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。
