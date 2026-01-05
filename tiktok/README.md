# Claude Code TikTok Skill

🎥 用于 Claude Code 的 TikTok 视频信息抓取技能

## 功能特性

- ✅ 抓取 TikTok 视频标题和描述
- ✅ 获取作者信息（用户名和主页链接）
- ✅ 获取互动数据（点赞、评论、分享、收藏）
- ✅ 提取视频话题标签
- ✅ 自动保存结果到 JSON 文件
- ✅ 支持登录状态（通过 Cookies）

## 数据示例

```json
{
  "success": true,
  "url": "https://www.tiktok.com/@username/video/123456",
  "data": {
    "title": "Let's Go #hashtag1 #hashtag2",
    "description": "Let's Go #hashtag1 #hashtag2",
    "author": "username",
    "authorUrl": "https://www.tiktok.com/@username",
    "likes": "1.7M",
    "comments": "4,320",
    "shares": "319.8K",
    "favorites": "110.1K",
    "hashtags": ["hashtag1", "hashtag2"]
  }
}
```

## 安装步骤

### 1. 克隆或下载项目

```bash
# Git Bash
cd ~/.claude/skills
git clone https://github.com/dingbohan89-coder/claude-skills.git
cd claude-skills/tiktok
```

### 2. 安装依赖

```bash
npm install
```

### 3. 安装 Playwright 浏览器

```bash
npx playwright install chromium
```

## 配置方法

### 方式一：Git Bash 端配置（推荐）

1. **确保 Claude Code 在 Git Bash 中运行**

2. **使用自配置提示词**

直接复制以下提示词给 Claude Code，它会自动完成配置：

```
请帮我配置 TikTok skill：

1. 将 C:\Users\你的用户名\.claude\skills\tiktok 目录下的 tiktok.js 文件复制到你的技能目录
2. 确保 skill.json 或 SKILL.md 配置正确
3. 配置完成后，测试一下能否正常工作
4. 如果需要安装依赖，请使用 npm install
```

3. **手动配置（如果自动配置失败）**

在 Git Bash 中执行：

```bash
# 创建技能目录
mkdir -p ~/.claude/skills/tiktok

# 复制文件
cp /c/Users/你的用户名/.claude/skills/tiktok/tiktok.js ~/.claude/skills/tiktok/
cp /c/Users/你的用户名/.claude/skills/tiktok/package.json ~/.claude/skills/tiktok/

# 安装依赖
cd ~/.claude/skills/tiktok
npm install

# 安装浏览器
npx playwright install chromium
```

### 方式二：Claude Code 桌面端配置

1. **打开 Claude Code 桌面应用**

2. **打开设置 (Settings) → Skills**

3. **点击 "Add Custom Skill"**

4. **填写配置信息：**
   - **Name**: `tiktok`
   - **Description**: `抓取 TikTok 视频信息，包括标题、作者、点赞数、评论数、分享数、收藏数、话题标签等数据`
   - **File Path**: 选择 `tiktok.js` 文件的完整路径
     - 例如：`C:\Users\你的用户名\.claude\skills\tiktok\tiktok.js`

5. **点击 "Save" 保存配置**

6. **重启 Claude Code 桌面应用**

### 方式三：Cursor 内置 Claude Code 配置

1. **打开 Cursor 编辑器**

2. **打开设置 (Settings) → Claude Code Skills**

3. **点击 "Add New Skill"**

4. **填写配置信息：**
   - **Name**: `tiktok`
   - **Description**: `抓取 TikTok 视频信息，包括标题、作者、点赞数、评论数、分享数、收藏数、话题标签等数据`
   - **Command**: `node "C:\Users\你的用户名\.claude\skills\tiktok\tiktok.js"`
   - **Input Format**: `json`

5. **点击 "Save" 保存配置**

6. **重启 Cursor**

## 使用方法

### 在 Claude Code 中使用

**方式 1：使用 /tiktok 命令（快捷方式）**

```
/tiktok https://www.tiktok.com/@username/video/123456
```

**方式 2：自然语言描述**

```
请抓取这个 TikTok 视频的信息：https://www.tiktok.com/@username/video/123456
```

**方式 3：指定技能**

```
使用 tiktok skill 抓取 https://www.tiktok.com/@username/video/123456
```

### 命令行直接使用

```bash
echo '{"url":"https://www.tiktok.com/@username/video/123456"}' | node tiktok.js
```

## 注意事项

1. **首次运行可能较慢**：需要下载浏览器和等待页面加载
2. **登录状态**：如果需要登录后才能看到的数据，建议先登录 TikTok 网页版，Cookies 会自动保存
3. **网络要求**：需要能够访问 TikTok
4. **数据限制**：某些数据（如播放量）可能只有作者本人才能看到
5. **运行时间**：每次抓取大约需要 20-30 秒（等待页面加载）

## 故障排除

### 问题 1：找不到模块

```bash
Error: Cannot find module 'playwright'
```

**解决方案：**
```bash
cd ~/.claude/skills/tiktok
npm install
npx playwright install chromium
```

### 问题 2：浏览器下载失败

**解决方案：**
```bash
# 使用国内镜像
export PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright
npx playwright install chromium
```

### 问题 3：抓取数据为空

**可能原因：**
- 网络连接问题
- TikTok 页面结构变化
- 需要登录才能查看

**解决方案：**
- 检查网络连接
- 手动访问 TikTok 网页版并登录
- 等待脚本更新

### 问题 4：超时错误

**解决方案：**
- 检查网络连接速度
- 脚本已包含自动重试机制，可以再次尝试

## 文件说明

- `tiktok.js` - 主要的爬虫脚本
- `package.json` - npm 依赖配置
- `SKILL.md` - Claude Code 技能元数据
- `README.md` - 本文档

## 技术栈

- **Node.js** - 运行环境
- **Playwright** - 浏览器自动化
- **Claude Code** - AI 辅助编码工具

## 开发者信息

- **作者**: dingbohan89-coder
- **GitHub**: https://github.com/dingbohan89-coder/claude-skills
- **许可**: MIT License

## 更新日志

### v1.0.0 (2025-01-05)
- ✅ 初始版本发布
- ✅ 支持抓取 TikTok 视频基本信息
- ✅ 支持多种配置方式
- ✅ 自动保存结果

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License - 详见 LICENSE 文件
