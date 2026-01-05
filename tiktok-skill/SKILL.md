---
name: tiktok-video-scraper
description: Scrapes TikTok videos to extract content, author info, and engagement metrics (likes, comments, shares, favorites). Use when user wants to scrape TikTok videos, extract video data, or analyze TikTok content.
---

# TikTok Video Scraper

## Quick Start

Scrape a TikTok video by URL:

```bash
node scripts/scrape.js "https://www.tiktok.com/@username/video/VIDEO_ID"
```

Output saved to: `results/tiktok_video_TIMESTAMP.json`

## First Time Setup

### Install Dependencies

```bash
npm install
```

### Install Playwright Browser

```bash
npx playwright install chromium
```

### Login (Required)

**⚠️ Important**: TikTok has anti-bot protection. We recommend Method 1.

#### Method 1: Import Cookies (Recommended)

1. Login to TikTok in Chrome: https://www.tiktok.com/login
2. Install EditThisCookie extension
3. Export all cookies
4. Save as `tiktok_cookies.json` in project root

**Required Cookies:** `sessionid`, `sessionid_ss`

#### Method 2: Automated Login (May Fail)

```bash
node scripts/login.js
```

If blocked with "This browser may not be secure", use Method 1.

## How It Works

1. Loads saved cookies
2. Opens video URL in browser
3. Waits for page load (20 seconds)
4. Extracts data from DOM and JSON
5. Saves results to JSON file

## Available Scripts

### scrape.js - Main Scraper

```bash
node scripts/scrape.js "VIDEO_URL"
```

Extracts: Title, Author, Likes, Comments, Shares, Favorites, Hashtags

## Data Limitations

- ❌ View count: Only visible to video creator
- ✅ Likes/Comments/Shares/Favorites: Usually available

## Directory Structure

```
tiktok-skill/
├── SKILL.md              # This file
├── package.json          # Dependencies
├── scripts/
│   ├── scrape.js         # Main scraper
│   │   └── login.js          # Login helper
├── results/              # Scraped data (auto-created)
└── tiktok_cookies.json   # Saved login state (create manually)
```

## Troubleshooting

### Data extraction incomplete

**Causes:** Expired cookies, private video, page structure changed

**Solution:** Re-export cookies from browser

### Browser doesn't open

```bash
npx playwright install chromium
```

## Security Notes

**⚠️ Never commit `tiktok_cookies.json` to Git** - It's in .gitignore

Cookies expire periodically - re-export when scraping fails.

## Related Skills

For Xiaohongshu scraping, see: `../xiaohongshu-skill/SKILL.md`
