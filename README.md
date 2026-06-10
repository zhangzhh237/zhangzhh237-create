# CET-6 Writing Companion

送给女朋友的六级作文小陪练 🌷

## 快速开始

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 DeepSeek API Key：

```
DEEPSEEK_API_KEY=sk-your-real-api-key
```

3. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000 即可使用。

## 功能

- 🎲 随机生成六级作文题目
- ✍️ 作文输入与实时字数统计
- 🤖 AI 智能批改（15分制）
- 💡 语法纠错、高级表达替换、提升建议
- 📝 高分范文参考
- 🌸 温柔鼓励系统

## 技术栈

- Next.js 15 + App Router
- TypeScript
- TailwindCSS
- DeepSeek API
