#!/usr/bin/env node
/**
 * TikTok Claude Code Skill
 * 通过 stdin 接收 JSON 参数，通过 stdout 返回 JSON 结果
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const cookiesPath = 'C:/Users/hp/claude_skills/claude_skills/tiktok-skill/tiktok_cookies.json';
const resultsDir = 'C:/Users/hp/claude_skills/claude_skills/tiktok-skill/results';

// 确保结果目录存在
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

async function scrapeTikTokVideo(url) {
  let browser;
  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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

    // 使用 domcontentloaded + 等待时间的方式，避免超时
    console.error('正在加载页面...');
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (e) {
      console.error('页面加载超时，但继续尝试...');
    }

    console.error('等待数据加载...');
    // 等待关键数据出现，使用轮询方式检查多个可能的数据源
    try {
      await Promise.race([
        // 等待 script 标签中的数据
        page.waitForFunction(() => {
          const scripts = document.querySelectorAll('script');
          for (let script of scripts) {
            if (script.textContent &&
                (script.textContent.includes('__UNIVERSAL_DATA_FOR_REHYDRATION__') ||
                 script.textContent.includes('__RENDER_DATA__'))) {
              return true;
            }
          }
          return false;
        }, { timeout: 20000 }),
        // 或等待 DOM 元素渲染
        page.waitForSelector('[data-e2e="like-count"], [data-e2e="browse-video-desc"], [data-e2e="video-author-uniqueid"]', { timeout: 20000 })
      ]);
      console.error('检测到数据已加载');
    } catch (e) {
      console.error('未检测到数据标识符，等待固定时间后继续...');
      await page.waitForTimeout(10000);
    }

    // 额外等待确保动态内容渲染完成
    console.error('等待页面渲染完成...');
    await page.waitForTimeout(12000);

    // 提取数据
    console.error('开始提取数据...');
    const data = await page.evaluate(() => {
      const result = {
        title: '',
        description: '',
        author: '',
        authorUrl: '',
        likes: '',
        comments: '',
        shares: '',
        favorites: '',
        hashtags: []
      };

      // 辅助函数：格式化数字
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

      // 方法1: 尝试从 script 标签提取（最可靠）
      let scriptData = null;
      const scripts = document.querySelectorAll('script');
      for (let script of scripts) {
        const text = script.textContent;
        if (text && text.includes('__UNIVERSAL_DATA_FOR_REHYDRATION__')) {
          try {
            let match = text.match(/__UNIVERSAL_DATA_FOR_REHYDRATION__\s*=\s*({.+?});/s);
            if (match) {
              scriptData = JSON.parse(match[1]);
              console.log('找到 __UNIVERSAL_DATA_FOR_REHYDRATION__');
              break;
            }
          } catch (e) {
            console.log('解析 __UNIVERSAL_DATA_FOR_REHYDRATION__ 失败:', e.message);
          }
        }
        if (text && text.includes('__RENDER_DATA__')) {
          try {
            let match = text.match(/__RENDER_DATA__\s*=\s*({.+?})\s*<\/script>/s);
            if (match) {
              scriptData = JSON.parse(match[1]);
              console.log('找到 __RENDER_DATA__');
              break;
            }
          } catch (e) {
            console.log('解析 __RENDER_DATA__ 失败:', e.message);
          }
        }
        // 尝试直接搜索包含 video-detail 的 script
        if (text && text.includes('video-detail') && !scriptData) {
          try {
            // 尝试提取 JSON 数据
            let jsonMatch = text.match(/({[\s\S]*})/);
            if (jsonMatch) {
              try {
                const parsed = JSON.parse(jsonMatch[1]);
                // 检查是否包含我们需要的数据结构
                if (parsed && (parsed['__DEFAULT_SCOPE__'] || parsed['app'] || parsed['webapp.video-detail'])) {
                  scriptData = parsed;
                  console.log('找到 video-detail 数据');
                  break;
                }
              } catch (e2) {
                // 继续尝试
              }
            }
          } catch (e) {
            // 继续尝试
          }
        }
      }

      // 从 scriptData 提取数据
      if (scriptData) {
        try {
          // 尝试多种路径
          let videoData = scriptData?.['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.itemInfo?.itemStruct ||
                         scriptData?.app?.videoDetail ||
                         scriptData?.VideoDetail ||
                         scriptData?.['webapp.video-detail']?.itemInfo?.itemStruct;

          if (videoData) {
            console.log('找到 videoData');
            result.title = videoData.desc || '';
            result.description = videoData.desc || '';
            result.author = videoData.author?.nickname || videoData.author?.uniqueId || '';
            result.authorUrl = videoData.author?.uniqueId ? `https://www.tiktok.com/@${videoData.author.uniqueId}` : '';
            result.likes = formatNumber(videoData.stats?.diggCount);
            result.comments = formatNumber(videoData.stats?.commentCount);
            result.shares = formatNumber(videoData.stats?.shareCount);
            result.favorites = formatNumber(videoData.stats?.collectCount || videoData.stats?.favoriteCount);

            // 提取话题标签
            if (videoData.textExtra) {
              result.hashtags = videoData.textExtra
                .map(item => item?.hashtagName)
                .filter(Boolean);
            } else if (videoData.desc) {
              // 从描述中提取 #hashtags
              const hashtagMatches = videoData.desc.match(/#[\w\u4e00-\u9fa5]+/g);
              if (hashtagMatches) {
                result.hashtags = hashtagMatches.map(tag => tag.substring(1));
              }
            }
          }
        } catch (e) {
          console.log('从 scriptData 提取数据失败:', e.message);
        }
      }

      // 方法2: 从 DOM 元素提取（备用）
      if (!result.likes) {
        // 尝试多种选择器
        const likeSelectors = [
          '[data-e2e="like-count"]',
          '.like-count',
          'strong[data-e2e="browse-video-like"]'
        ];
        for (let selector of likeSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            result.likes = el.textContent.trim();
            break;
          }
        }

        const commentSelectors = [
          '[data-e2e="comment-count"]',
          '.comment-count',
          'strong[data-e2e="browse-video-comment"]'
        ];
        for (let selector of commentSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            result.comments = el.textContent.trim();
            break;
          }
        }

        const shareSelectors = [
          '[data-e2e="share-count"]',
          '.share-count',
          'strong[data-e2e="browse-video-share"]'
        ];
        for (let selector of shareSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            result.shares = el.textContent.trim();
            break;
          }
        }

        // 收藏数 - 尝试更多选择器
        const favoriteSelectors = [
          '[data-e2e="favorite-count"]',
          'strong[data-e2e="browse-video-favorite"]',
          '[data-e2e="video-favorite"]',
          'span[class*="favorite"]',
          'div[class*="favorite"] strong',
          'strong[class*="favorite"]'
        ];
        for (let selector of favoriteSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            const text = el.textContent.trim();
            if (/\d/.test(text)) {
              result.favorites = text;
              console.log('找到收藏数:', text, '选择器:', selector);
              break;
            }
          }
        }
      }

      // 提取标题和描述（最重要！）
      if (!result.title) {
        const titleSelectors = [
          '[data-e2e="browse-video-desc"]',
          'h1',
          '[data-e2e="video-desc"]',
          '.video-desc',
          'div[class*="desc"]'
        ];
        for (let selector of titleSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            const text = el.textContent.trim();
            if (text && text.length > 0 && text !== '主页') {
              result.title = text;
              result.description = text;

              // 从标题中提取话题标签
              const hashtagMatches = text.match(/#[\w\u4e00-\u9fa5-]+/g);
              if (hashtagMatches) {
                result.hashtags = hashtagMatches.map(tag => tag.substring(1));
              }
              break;
            }
          }
        }
      }

      // 提取作者信息
      if (!result.author || result.author === '主页') {
        const authorSelectors = [
          '[data-e2e="video-author-uniqueid"]',
          '[data-e2e="browse-video-username"]',
          'a[href*="/@"][title]',
          '.username',
          'h2[class*="Username"]'
        ];
        for (let selector of authorSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            let text = el.textContent.trim().replace('@', '').replace('主页', '').trim();
            if (text) {
              result.author = text;
              const link = el.closest('a');
              if (link && link.href) {
                result.authorUrl = link.href;
              }
              break;
            }
          }
        }

        // 如果还是没找到，尝试从 URL 提取
        if (!result.author) {
          const authorLinks = document.querySelectorAll('a[href*="/@"]');
          for (let link of authorLinks) {
            const match = link.href.match(/\/@([^\/]+)/);
            if (match && match[1] && !link.textContent.includes('主页')) {
              result.author = match[1];
              result.authorUrl = link.href;
              break;
            }
          }
        }
      }

      return result;
    });

    // 保存cookies
    const cookies = await context.cookies();
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2), 'utf-8');

    await browser.close();

    // 保存结果到文件
    const timestamp = Date.now();
    const resultPath = path.join(resultsDir, `tiktok_video_${timestamp}.json`);
    fs.writeFileSync(resultPath, JSON.stringify({
      url,
      timestamp: new Date().toISOString(),
      data
    }, null, 2));

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
        error: '请提供 TikTok 视频 URL',
        usage: 'echo \'{"url":"https://www.tiktok.com/@username/video/123456"}\' | node tiktok.js'
      };
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }

    const result = await scrapeTikTokVideo(url);
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
      usage: 'echo \'{"url":"https://www.tiktok.com/@username/video/123456"}\' | node tiktok.js'
    }, null, 2));
    process.exit(1);
  }
}, 100);
