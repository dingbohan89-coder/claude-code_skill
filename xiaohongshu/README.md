# Claude Code 小红书 Skill

📕 用于 Claude Code 的小红书帖子信息抓取技能

## 功能特性

- ✅ 抓取小红书帖子标题和内容
- ✅ 获取作者信息（用户名和主页链接）
- ✅ 获取互动数据（点赞、收藏、评论、分享）
- ✅ 下载帖子中的图片
- ✅ 自动保存结果到 JSON 文件
- ✅ 支持登录状态（通过 Cookies）

## 数据示例

```json
{
  "success": true,
  "url": "https://www.xiaohongshu.com/explore/12345678",
  "data": {
    "title": "帖子标题",
    "content": "帖子内容描述...",
    "author": "作者用户名",
    "authorUrl": "https://www.xiaohongshu.com/user/profile/123456",
    "likes": "1.2万",
    "favorites": "5689",
    "comments": "234",
    "shares": "123",
    "images": [
      "https://sns-img-bk.xhscdn.com/xxx.jpg"
    ]
  }
}
```

## 安装步骤

### 1. 克隆或下载项目

```bash
# Git Bash
cd ~/.claude/skills
git clone https://github.com/仓库名.git
cd claude-skills/xiaohongshu
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
请帮我配置小红书 skill：

1. 将 C:\Users\你的用户名\.claude\skills\xiaohongshu 目录下的 xiaohongshu.js 文件复制到你的技能目录
2. 确保 skill.json 或 SKILL.md 配置正确
3. 配置完成后，测试一下能否正常工作
4. 如果需要安装依赖，请使用 npm install
```

3. **手动配置（如果自动配置失败）**

在 Git Bash 中执行：

```bash
# 创建技能目录
mkdir -p ~/.claude/skills/xiaohongshu

# 复制文件
cp /c/Users/你的用户名/.claude/skills/xiaohongshu/xiaohongshu.js ~/.claude/skills/xiaohongshu/
cp /c/Users/你的用户名/.claude/skills/xiaohongshu/package.json ~/.claude/skills/xiaohongshu/

# 安装依赖
cd ~/.claude/skills/xiaohongshu
npm install

# 安装浏览器
npx playwright install chromium
```

### 方式二：Claude Code 桌面端配置

1. **打开 Claude Code 桌面应用**

2. **打开设置 (Settings) → Skills**

3. **点击 "Add Custom Skill"**

4. **填写配置信息：**
   - **Name**: `xiaohongshu`
   - **Description**: `抓取小红书帖子信息，包括标题、作者、内容、点赞数、收藏数、评论数、分享数、图片等数据`
   - **File Path**: 选择 `xiaohongshu.js` 文件的完整路径
     - 例如：`C:\Users\你的用户名\.claude\skills\xiaohongshu\xiaohongshu.js`

5. **点击 "Save" 保存配置**

6. **重启 Claude Code 桌面应用**

### 方式三：Cursor 内置 Claude Code 配置

1. **打开 Cursor 编辑器**

2. **打开设置 (Settings) → Claude Code Skills**

3. **点击 "Add New Skill"**

4. **填写配置信息：**
   - **Name**: `xiaohongshu`
   - **Description**: `抓取小红书帖子信息，包括标题、作者、内容、点赞数、收藏数、评论数、分享数、图片等数据`
   - **Command**: `node "C:\Users\你的用户名\.claude\skills\xiaohongshu\xiaohongshu.js"`
   - **Input Format**: `json`

5. **点击 "Save" 保存配置**

6. **重启 Cursor**

## 使用方法

### 在 Claude Code 中使用

**方式 1：使用 /xiaohongshu 命令（快捷方式）**

```
/xiaohongshu https://www.xiaohongshu.com/explore/12345678
```

**方式 2：自然语言描述**

```
请抓取这个小红书帖子的信息：https://www.xiaohongshu.com/explore/12345678
```

**方式 3：指定技能**

```
使用 xiaohongshu skill 抓取 https://www.xiaohongshu.com/explore/12345678
```

### 命令行直接使用

```bash
echo '{"url":"https://www.xiaohongshu.com/explore/12345678"}' | node xiaohongshu.js
```

## 支持的小红书链接格式

- `https://www.xiaohongshu.com/explore/帖子ID`
- `https://www.xiaohongshu.com/discovery/item/帖子ID`
- `https://xhslink.com/短链接`

## 注意事项

1. **首次运行可能较慢**：需要下载浏览器和等待页面加载
2. **登录状态**：如果需要登录后才能看到的数据，建议先登录小红书网页版，Cookies 会自动保存
3. **网络要求**：需要能够访问小红书
4. **图片下载**：图片会自动保存到 results 目录
5. **运行时间**：每次抓取大约需要 15-25 秒（等待页面加载）

## 故障排除

### 问题 1：找不到模块

```bash
Error: Cannot find module 'playwright'
```

**解决方案：**
```bash
cd ~/.claude/skills/xiaohongshu
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
- 小红书页面结构变化
- 帖子已被删除或设为私密
- 需要登录才能查看

**解决方案：**
- 检查网络连接
- 手动访问小红书网页版并登录
- 确认帖子链接是否有效
- 等待脚本更新

### 问题 4：图片下载失败

**可能原因：**
- 图片链接防盗链
- 网络问题

**解决方案：**
- 脚本会返回图片链接，可以手动下载
- 检查网络连接

### 问题 5：超时错误

**解决方案：**
- 检查网络连接速度
- 脚本已包含自动重试机制，可以再次尝试

## 文件说明

- `xiaohongshu.js` - 主要的爬虫脚本
- `package.json` - npm 依赖配置
- `SKILL.md` - Claude Code 技能元数据
- `README.md` - 本文档
- `results/` - 结果保存目录（自动创建）

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
- ✅ 支持抓取小红书帖子基本信息
- ✅ 支持图片下载
- ✅ 支持多种配置方式
- ✅ 自动保存结果

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License - 详见 LICENSE 文件

