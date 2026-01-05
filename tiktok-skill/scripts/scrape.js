#!/usr/bin/env node
/**
 * TikTok 视频爬取脚本
 * 用法: node scrape.js "视频URL"
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const url = process.argv[2];
if (!url) {
  console.error('用法: node scrape.js "视频URL"');
  process.exit(1);
}

const cookiesPath = path.join(__dirname, '../tiktok_cookies.json');
const resultsDir = path.join(__dirname, '../results');

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

function formatNumber(num) {
  if (!num || num === 0) return '';
  const number = parseInt(num);
  if (isNaN(number)) return num.toString();
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 10000) {
    return (number / 1000).toFixed(1) + 'K';
  } else if (number >= 1000) {
    return number.toLocaleString();
  }
  return number.toString();
}

async function scrape() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  if (fs.existsSync(cookiesPath)) {
    try {
      const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
      await context.addCookies(cookies);
    } catch (e) {
      console.log('⚠️  无法加载 cookies，需要重新登录');
    }
  }

  const page = await context.newPage();

  try {
    console.log(`\n正在访问: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    console.log('等待页面加载...');
    await page.waitForTimeout(25000);

    // 提取数据
    const data = await page.evaluate(() => {
      const result = {
        title: '',
        description: '',
        author: '',
        authorUrl: '',
        likes: '',
        views: '',
        comments: '',
        shares: '',
        favorites: '',
        hashtags: []
      };

      // 尝试从 script 标签提取
      let scriptData = null;
      const scripts = document.querySelectorAll('script');
      for (let script of scripts) {
        const text = script.textContent;
        if (text && (text.includes('__UNIVERSAL_DATA_FOR_REHYDRATION__') || text.includes('__RENDER_DATA__'))) {
          try {
            let match = text.match(/__UNIVERSAL_DATA_FOR_REHYDRATION__\s*=\s*({.+?});/s);
            if (!match) {
              match = text.match(/__RENDER_DATA__\s*=\s*({.+?})\s*<\/script>/s);
            }
            if (match) {
              scriptData = JSON.parse(match[1]);
              break;
            }
          } catch (e) {}
        }
      }

      if (scriptData) {
        try {
          let item = null;

          if (scriptData.defaultScope?.['webapp.video-detail']) {
            item = scriptData.defaultScope['webapp.video-detail'].itemInfo?.itemStruct;
          }

          if (!item && scriptData.app?.videoDetail) {
            item = scriptData.app.videoDetail;
          }

          if (!item && scriptData.ItemModule) {
            const keys = Object.keys(scriptData.ItemModule);
            if (keys.length > 0) {
              item = scriptData.ItemModule[keys[0]];
            }
          }

          if (item) {
            result.title = item.desc || item.title || '';
            result.description = item.desc || item.title || '';

            const author = item.author;
            if (author) {
              result.author = author.nickname || author.uniqueId || author.displayName || '';
              result.authorUrl = author.uniqueId ? `https://www.tiktok.com/@${author.uniqueId}` : '';
            }

            const stats = item.stats || item.statistics || {};
            result.likes = formatNumber(stats.diggCount || stats.likeCount || 0);
            result.views = formatNumber(stats.playCount || stats.viewCount || 0);
            result.comments = formatNumber(stats.commentCount || 0);
            result.shares = formatNumber(stats.shareCount || 0);
            result.favorites = formatNumber(stats.favoriteCount || stats.collectCount || 0);

            const textExtra = item.textExtra || [];
            const hashtags = item.hashtags || [];
            result.hashtags = [
              ...textExtra.map(tag => tag.hashtagName || ''),
              ...hashtags.map(tag => tag.title || tag.hashtagName || '')
            ].filter(Boolean);
          }
        } catch (e) {
          console.error('解析脚本数据失败:', e.message);
        }
      }

      // 备用：从 data-e2e 元素提取
      if (!result.likes || !result.comments || !result.shares || !result.favorites) {
        const e2eElements = {
          'like-count': 'likes',
          'comment-count': 'comments',
          'share-count': 'shares',
          'undefined-count': 'favorites'
        };

        for (const [e2e, key] of Object.entries(e2eElements)) {
          if (!result[key]) {
            const el = document.querySelector(`[data-e2e="${e2e}"]`);
            if (el) {
              const text = el.textContent?.trim();
              if (text && /^\d/.test(text)) {
                result[key] = text;
              }
            }
          }
        }
      }

      // 从 meta 标签提取（备用）
      if (!result.title) {
        const metaTitle = document.querySelector('meta[property="og:title"]');
        const metaDesc = document.querySelector('meta[property="og:description"]');
        result.title = metaTitle?.content || result.title;
        result.description = metaDesc?.content || result.description;
      }

      // 从 URL 提取作者
      if (!result.author && window.location.pathname.includes('@')) {
        const authorMatch = window.location.pathname.match(/@([^/]+)/);
        if (authorMatch) {
          result.author = authorMatch[1];
          result.authorUrl = `https://www.tiktok.com/@${authorMatch[1]}`;
        }
      }

      return result;
    });

    // 保存结果
    const timestamp = Date.now();
    const resultPath = path.join(resultsDir, `tiktok_video_${timestamp}.json`);
    const output = {
      url,
      timestamp: new Date().toISOString(),
      data
    };

    fs.writeFileSync(resultPath, JSON.stringify(output, null, 2), 'utf-8');

    // 显示结果
    console.log('========== 视频信息 ==========');
    console.log(`标题: ${data.title || '未找到'}`);
    console.log(`作者: @${data.author || '未找到'}`);
    console.log(`作者主页: ${data.authorUrl || '未找到'}`);
    console.log(`\n点赞: ${data.likes || '未找到'}`);
    console.log(`评论: ${data.comments || '未找到'}`);
    console.log(`分享: ${data.shares || '未找到'}`);
    console.log(`收藏: ${data.favorites || '未找到'}`);
    console.log(`播放: ${data.views || '未找到'}`);
    if (data.hashtags.length > 0) {
      console.log(`\n标签: ${data.hashtags.join(', ')}`);
    }
    if (data.description) {
      console.log(`\n描述:\n${data.description.substring(0, 200)}...`);
    }
    console.log('\n==============================\n');
    console.log(`✓ 已保存到: ${resultPath}`);

    // 保存 cookies
    const cookies = await context.cookies();
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2), 'utf-8');
    console.log('✓ 已保存登录信息');

  } finally {
    await browser.close();
  }
}

scrape().catch(console.error);
