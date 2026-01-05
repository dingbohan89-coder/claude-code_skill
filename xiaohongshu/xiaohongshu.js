#!/usr/bin/env node
/**
 * 小红书 Claude Code Skill
 * 通过 stdin 接收 JSON 参数，通过 stdout 返回 JSON 结果
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const cookiesPath = 'C:/Users/hp/claude_skills/claude_skills/xiaohongshu-skill/xhs_cookies.json';
const resultsDir = 'C:/Users/hp/claude_skills/claude_skills/xiaohongshu-skill/results';

// 确保结果目录存在
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

async function scrapeXiaohongshuPost(url) {
  let browser;
  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    // 加载 cookies
    if (fs.existsSync(cookiesPath)) {
      try {
        const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
        await context.addCookies(cookies);
      } catch (e) {
        // 忽略 cookie 加载错误
      }
    }

    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(30000);

    let pageTitle = await page.title();
    let currentUrl = page.url();

    // 如果被重定向或显示推荐内容，重新导航到目标 URL
    const targetItemId = url.match(/item\/([^\/\?]+)/)?.[1] || url.match(/explore\/([^\/\?]+)/)?.[1];
    if (currentUrl.includes('404') ||
        pageTitle.includes('你访问的页面不见了') ||
        pageTitle.includes('当前笔记暂时无法浏览') ||
        (targetItemId && !currentUrl.includes(targetItemId))) {

      // 重新导航到原始 URL
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      await page.waitForTimeout(25000);
    }

    // 提取数据
    const data = await page.evaluate(() => {
      const result = {
        title: '',
        content: '',
        author: '',
        likes: '',
        collects: '',
        comments: '',
        shares: '',
        images: []
      };

      // 标题
      const titleSelectors = ['.title', 'h1', '.post-title', '.note-title'];
      for (const selector of titleSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          if (el.innerText && el.innerText.trim() && el.innerText.trim().length > 2) {
            result.title = el.innerText.trim();
            break;
          }
        }
        if (result.title) break;
      }

      // 作者
      const authorSelectors = ['.author-name', '.user-name', '.username'];
      for (const selector of authorSelectors) {
        const el = document.querySelector(selector);
        if (el && el.innerText && el.innerText.trim()) {
          result.author = el.innerText.trim();
          break;
        }
      }

      // 内容
      const contentSelectors = ['.note-text', '.post-content', '.content'];
      for (const selector of contentSelectors) {
        const el = document.querySelector(selector);
        if (el && el.innerText && el.innerText.trim() && el.innerText.trim().length > 10) {
          result.content = el.innerText.trim();
          break;
        }
      }

      // 互动数据
      const interactionElements = document.querySelectorAll('[class*="count"], [class*="like"], [class*="collect"]');
      interactionElements.forEach(el => {
        const text = el.innerText?.trim();
        const className = el.className;

        if (text && /^\d+(\.\d+[wk万])?$/.test(text.replace(/,/g, ''))) {
          if (className.includes('like') || text.includes('赞')) {
            result.likes = text;
          } else if (className.includes('collect') || text.includes('收藏')) {
            result.collects = text;
          } else if (className.includes('comment') || text.includes('评论')) {
            result.comments = text;
          } else if (className.includes('share') || text.includes('分享')) {
            result.shares = text;
          }
        }
      });

      // 图片
      const imgSelectors = ['.note-img img', '.post-images img'];
      const imgSet = new Set();
      for (const selector of imgSelectors) {
        const imgs = document.querySelectorAll(selector);
        imgs.forEach(img => {
          if (img.src && !img.src.includes('avatar') && !img.src.includes('logo')) {
            imgSet.add(img.src);
          }
        });
        if (imgSet.size > 0) break;
      }
      result.images = Array.from(imgSet);

      return result;
    });

    // 保存 cookies
    const cookies = await context.cookies();
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2), 'utf-8');

    await browser.close();

    // 保存结果到文件
    const timestamp = Date.now();
    const resultPath = path.join(resultsDir, `xhs_post_${timestamp}.json`);
    const output = {
      url,
      timestamp: new Date().toISOString(),
      data
    };
    fs.writeFileSync(resultPath, JSON.stringify(output, null, 2), 'utf-8');

    return {
      success: true,
      url,
      data,
      savedTo: resultPath
    };

  } catch (error) {
    if (browser) await browser.close();
    return {
      success: false,
      error: error.message
    };
  }
}

// 从 stdin 读取输入
let inputData = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', async () => {
  try {
    const input = JSON.parse(inputData || '{}');
    const { url } = input;

    if (!url) {
      const result = {
        success: false,
        error: '请提供小红书帖子 URL',
        usage: 'echo \'{"url":"https://www.xiaohongshu.com/explore/123456"}\' | node xiaohongshu.js'
      };
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }

    const result = await scrapeXiaohongshuPost(url);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);

  } catch (error) {
    console.log(JSON.stringify({
      success: false,
      error: error.message
    }, null, 2));
    process.exit(1);
  }
});

// 确保 stdin 不会无限等待
setTimeout(() => {
  if (!inputData) {
    console.log(JSON.stringify({
      success: false,
      error: '未接收到输入数据',
      usage: 'echo \'{"url":"https://www.xiaohongshu.com/explore/123456"}\' | node xiaohongshu.js'
    }, null, 2));
    process.exit(1);
  }
}, 100);
