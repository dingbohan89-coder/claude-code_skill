# TikTok Video Scraper - Claude Code Skill

这是一个标准的 Claude Code Skill，用于爬取 TikTok 视频信息。


## 🎬 演示视频

**【TK爬虫演示】**

[📺 点击观看演示视频](https://www.bilibili.com/video/BV1N5itB5ED3/?share_source=copy_web&vd_source=5887d0df3a546088fd6d078af3839f75)

https://www.bilibili.com/video/BV1N5itB5ED3/?share_source=copy_web&vd_source=5887d0df3a546088fd6d078af3839f75

**演示内容：**
- ✅ 使用 Claude Code 调用 Skill
- ✅ 爬取 TikTok 视频信息
- ✅ 提取标题、作者、互动数据
- ✅ 自动保存为 JSON 格式

---

## ⚠️ 重要提示：推荐使用 Git Bash

**强烈建议在 Git Bash 中启动 Claude Code 来配置此技能！**

### 为什么推荐 Git Bash？

1. ✅ **路径兼容性好** - Git Bash 原生支持 Unix 风格路径（`~/.claude/skills/`）
2. ✅ **命令执行稳定** - 避免Windows CMD 的路径和转义问题
3. ✅ **npm/node 兼容** - 对 Node.js 工具链支持更好
4. ✅ **Claude Code 官方推荐** - 官方文档主要基于 Unix-like 环境

### 如何使用 Git Bash 启动 Claude Code

**Windows 系统：**

1. 打开 Git Bash
   - 按 `Win + R`，输入 `git bash` 并回车
   - 或从开始菜单搜索 "Git Bash"

2. 在 Git Bash 中启动 Claude Code
   ```bash
   cd /c/Users/你的用户名
   claude
   ```

3. 然后复制下面的提示词给 Claude Code

**不使用 Git Bash 的风险：**
- ❌ 路径格式可能不兼容（`C:\Users\...` vs `/c/Users/...`）
- ❌ 反斜杠转义问题
- ❌ npm 脚本执行可能失败
- ❌ 环境变量配置问题

## 📦 安装

### 方法一：使用 Git Clone（推荐）

```bash
cd ~/.claude/skills
git clone https://github.com/dingbohan89-coder/claude-skills.git
```

### 方法二：手动安装

1. 将整个 `tiktok-skill` 目录复制到 `~/.claude/skills/` 下
2. 确保目录结构为：`~/.claude/skills/tiktok-skill/`

**⚠️ 重要说明**：
- 这是 **Claude Code Skill**，不是 MCP Server
- 不需要修改 `~/.claude/settings.json` 或 `mcp.json`
- 不需要手动配置路径
- 遵循官方的"约定优于配置"原则

## 🤖 让 Claude Code 帮你配置（推荐）

不想手动配置？直接复制下面的提示词给 Claude Code，它会帮你完成所有配置！

**⚠️ 请确保在 Git Bash 中启动 Claude Code，然后复制下面的提示词：**

### 方式一：完整配置提示词

```
我需要配置 TikTok Video Scraper Skill。请帮我：

1. 检查 ~/.claude/skills/tiktok-skill/ 目录是否存在
2. 如果不存在，从 GitHub 克隆：https://github.com/dingbohan89-coder/claude-skills.git
3. 进入项目目录并运行 npm install
4. 运行 npx playwright install chromium
5.将这个skill必须导入到你的可用的skill目录里，一定确保可以被识别到且被成功调用
5. 告诉我如何导入 TikTok cookies（详细步骤）
6. 创建一个测试文件来验证配置是否成功

请一步一步执行，并告诉我每一步的结果。
```

### 方式二：简化版提示词

```
帮我安装和配置 TikTok Video Scraper Skill。项目地址：https://github.com/dingbohan89-coder/claude-skills.git
```

**Claude Code 会自动完成：**
- ✅ 检查并创建必要的目录
- ✅ 安装所有依赖包
- ✅ 配置 Playwright 浏览器
- ✅ 指导你导入 TikTok cookies
- ✅ 验证配置是否成功

**使用这种方式的优点：**
- 🚀 全自动配置，无需手动操作
- 🎯 Claude Code 会根据你的系统自动调整命令
- 💡 遇到问题会自动排查和修复
- 📝 实时反馈每一步的执行结果
- 💬 可以随时提问，获得详细解释

## 🚀 快速开始（手动配置）

如果你喜欢手动配置，可以按照以下步骤操作：

### 1. 安装依赖

```bash
cd ~/.claude/skills/tiktok-skill
npm install
```

### 2. 安装 Playwright 浏览器

```bash
npx playwright install chromium
```

### 3. 配置 TikTok 登录

由于 TikTok 的反爬虫机制，需要导入 cookies：

**步骤：**
1. 在 Chrome 浏览器中登录 TikTok
2. 安装 [EditThisCookie](https://chrome.google.com/webstore) 扩展
3. 导出所有 cookies
4. 在 `~/.claude/skills/tiktok-skill/` 目录下创建 `tiktok_cookies.json`
5. 粘贴 cookies 数据

**必需字段：** `sessionid`, `sessionid_ss`

### 4. 在 Claude Code 中使用

直接在 Claude Code 对话中：

```
请帮我爬取这个 TikTok 视频的信息：https://www.tiktok.com/@dazumno/video/7588841167236713750
```

## 📁 目录结构

```
~/.claude/skills/
└── tiktok-skill/          # Claude Code 会自动加载此目录
    ├── README.md          # 本文件
    ├── SKILL.md           # 技能元数据（官方标准格式）
    ├── package.json       # npm 配置
    ├── .gitignore         # Git 忽略规则
    ├── scripts/           # 脚本目录
    │   ├── scrape.js      # 爬虫主脚本
    │   └── login.js       # 登录脚本（可选）
    ├── results/           # 输出目录（自动创建）
    └── tiktok_cookies.json # 登录信息（手动创建）
```

## 🎯 使用示例

### 在 Claude Code 中调用

```
爬取 https://www.tiktok.com/@username/video/123456 的数据（首次运行此技能需先运行登录脚本，再进行页面加载及爬取）
```

### 直接运行脚本

```bash
cd ~/.claude/skills/tiktok-skill
node scripts/scrape.js "https://www.tiktok.com/@username/video/123456"
```

## 📊 输出格式

```json
{
  "url": "视频URL",
  "timestamp": "时间戳",
  "data": {
    "title": "视频标题",
    "description": "视频描述",
    "author": "作者用户名",
    "authorUrl": "作者主页",
    "likes": "点赞数",
    "comments": "评论数",
    "shares": "分享数",
    "favorites": "收藏数",
    "hashtags": ["标签1", "标签2"]
  }
}
```

## ⚠️ 注意事项

### 官方 Skills 规范

- ✅ 使用标准的 `SKILL.md` 格式（包含 `name` 和 `description` front matter）
- ✅ 放在 `~/.claude/skills/` 目录下自动加载
- ✅ 无需修改配置文件
- ❌ 不是 MCP Server，不需要配置 `mcp.json`
- ❌ 不需要手动指定路径

### 安全提示

- ⚠️ **切勿提交 `tiktok_cookies.json` 到 Git**（已添加到 `.gitignore`）
- Cookies 会定期过期，需重新导出
- 本工具仅供学习研究使用

## 🔧 故障排除

### Claude Code 无法识别 Skill

**检查清单：**
1. 确认目录在 `~/.claude/skills/tiktok-skill/`
2. 确认 `SKILL.md` 文件存在且格式正确
3. 确认在 Git Bash 中启动 Claude Code
4. 重启 Claude Code

### 爬取失败

**可能原因：**
1. Cookies 过期 → 重新导出
2. 视频为私密内容 → 无法访问
3. Playwright 未安装 → 运行 `npx playwright install chromium`
4. 未使用 Git Bash → 切换到 Git Bash 重试

### 命令执行失败

**如果遇到路径或命令错误：**
1. 确保使用 Git Bash 而非 CMD 或 PowerShell
2. 检查路径格式（应该是 `~/.claude/skills/` 而非 `C:\Users\...`）
3. 确认 Node.js 和 npm 已正确安装
4. 尝试使用完整提示词让 Claude Code 自动配置

## 📚 技术栈

- **Playwright** - 浏览器自动化
- **Node.js** - 运行环境
- **Claude Code Skills API** - 官方技能接口

## 📖 相关文档

- [Claude Code 官方文档](https://docs.anthropic.com/claude-code/)
- [Claude Skills 规范](https://docs.anthropic.com/claude-code/skills)
- [Git Bash 下载](https://git-scm.com/downloads)
- [SKILL.md](./SKILL.md) - 完整技能说明

## 📄 许可证

MIT License

## 🙏 免责声明

本工具仅供学习和研究使用，请遵守 TikTok 服务条款和相关法律法规。

---

**作者**: dingbohan89-coder  
**最后更新**: 2026-01-06  
**类型**: Claude Code Skill (非 MCP Server)  
**推荐环境**: Git Bash + Claude Code
