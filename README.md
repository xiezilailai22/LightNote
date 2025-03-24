# LightNote - 轻量化笔记应用

LightNote是一个极致轻量化的笔记应用，专注于保存网页内容片段。它提供了浏览器扩展，支持通过右键菜单或快捷键快速保存选中的文本内容。

## 核心功能

- ✂️ 浏览器插件实现右键快速保存网页选中内容
- 🔗 保存时自动记录原文链接，一键跳回源页面
- 🏷️ 支持标签系统，便于内容分类
- 📱 极简设计，专注于内容，不包含复杂格式编辑

## 技术栈

- **前端**：Next.js 14 (App Router)
- **样式**：Tailwind CSS + shadcn/ui
- **数据库**：PostgreSQL
- **ORM**：Prisma
- **浏览器扩展**：Chrome Extension (Manifest V3)

## 本地开发

### 前置条件

- Node.js 18+
- PostgreSQL数据库

### 设置步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/lightnote.git
cd lightnote
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

创建`.env`文件并配置数据库连接：

```
DATABASE_URL="postgresql://username:password@localhost:5432/lightnote?schema=public"
```

4. 创建数据库和表

```bash
npx prisma db push
```

5. 启动开发服务器

```bash
npm run dev
```

### 浏览器扩展开发

1. 打开Chrome浏览器，进入`chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目中的`extension`目录

## 部署

### Web应用部署 (Vercel)

1. Fork此仓库
2. 在Vercel上导入项目
3. 配置环境变量（DATABASE_URL）
4. 部署应用

### 扩展发布

1. 构建扩展：`cd extension && zip -r ../lightnote-extension.zip *`
2. 提交到Chrome Web Store开发者控制台

## 许可证

MIT 