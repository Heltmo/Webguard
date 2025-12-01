# Website Blocker Chrome Extension

A minimal Chrome extension that blocks distracting websites using declarativeNetRequest API (Manifest V3).

## Features

- 🚫 Blocks Pornsites by default
- ➕ Block any website with one click
- 💾 Syncs blocked sites across devices
- 🎯 Simple, clean interface
- ⚡ Uses modern Manifest V3

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `website-blocker` folder
6. The extension is now installed!

## Usage

### Block the Current Tab
1. Click the extension icon
2. Click "Block Current Tab"
3. The site will be added to your block list and the tab will close

### Unblock a Site
1. Click the extension icon
2. Find the site in the blocked sites list
3. Click the "✕" button next to it

### View Blocked Sites
- Click the extension icon to see all currently blocked sites

## Default Blocked Sites

- facebook.com
- youtube.com

## File Structure

```
website-blocker/
├── manifest.json       # Extension configuration
├── background.js       # Service worker for managing rules
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic
├── popup.css          # Popup styles
└── rules.json         # Static rules file (empty, uses dynamic rules)
```

## How It Works

1. **declarativeNetRequest**: Uses Chrome's efficient blocking API
2. **Dynamic Rules**: Updates blocking rules in real-time
3. **chrome.storage.sync**: Saves blocked sites across devices
4. **Service Worker**: Background script manages blocking logic

## Permissions

- `declarativeNetRequest`: Block websites
- `declarativeNetRequestFeedback`: Read current rules
- `storage`: Save blocked sites list
- `activeTab`: Get current tab URL
- `host_permissions`: Access all URLs for blocking

## Notes

- Icons are referenced but not included (extension will use default Chrome icon)
- To add custom icons, create 16x16, 48x48, and 128x128 PNG files
- Blocked sites are synced via Chrome sync if enabled

## Customization

To change default blocked sites, edit `DEFAULT_BLOCKED_SITES` in `background.js`:

```javascript
const DEFAULT_BLOCKED_SITES = ['facebook.com', 'youtube.com', 'twitter.com'];
```

## License

MIT License - Feel free to modify and use!
