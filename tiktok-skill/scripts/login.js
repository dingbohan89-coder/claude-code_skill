#!/usr/bin/env node
/**
 * TikTok 登录脚本
 * 打开浏览器窗口让用户手动登录，登录完成后自动保存 cookies
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const cookiesPath = path.join(__dirname, '../tiktok_cookies.json');

async function login() {
  console.log('🌐 正在启动浏览器...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    permissions: ['geolocation', 'notifications']
  });

  // 添加初始化脚本来隐藏自动化特征
  await context.addInitScript(() => {
    // 隐藏 webdriver 属性
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined
    });

    // 伪造 plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5]
    });

    // 伪造 languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['zh-CN', 'zh', 'en-US', 'en']
    });

    // 伪造 chrome 对象
    window.chrome = {
      runtime: {}
    };

    // 伪造 permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
  });

  const page = await context.newPage();

  console.log('📖 正在打开 TikTok 登录页面...');
  console.log('👆 请在浏览器中完成登录操作');
  console.log('⏳ 登录成功后，等待页面加载完成，然后关闭浏览器窗口');

  try {
    await page.goto('https://www.tiktok.com/login', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('');
    console.log('============================================');
    console.log('💡 提示：');
    console.log('   1. 选择登录方式（推荐使用手机号/邮箱登录）');
    console.log('   2. 完成登录流程');
    console.log('   3. 登录成功后，浏览一下页面');
    console.log('   4. 关闭浏览器窗口即可自动保存 cookies');
    console.log('============================================');
    console.log('');

    // 等待浏览器关闭
    await new Promise((resolve) => {
      browser.on('disconnected', resolve);
    });

    // 保存 cookies
    const cookies = await context.cookies();
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));

    console.log('');
    console.log('✅ 登录信息已保存！');
    console.log(`📍 保存位置: ${cookiesPath}`);
    console.log('🎉 现在可以使用爬虫功能了！');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    await browser.close();
    process.exit(1);
  }
}

login().catch(console.error);
