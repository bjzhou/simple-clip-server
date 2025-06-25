# 使用官方的 Node.js 运行时作为父镜像
FROM node:18-alpine

# 设置容器内的工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json (如果存在)
COPY package*.json ./

# 安装应用依赖
RUN npm install

# 将应用源码复制到容器中
COPY . .

# 暴露应用运行的端口
EXPOSE 3000

# 定义运行应用的命令
CMD [ "npm", "start" ] 