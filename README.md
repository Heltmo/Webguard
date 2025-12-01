WebGuard – Chrome Website Blocker (Manifest V3)

WebGuard is a minimal, fast Chrome extension that blocks distracting websites using Chrome’s modern declarativeNetRequest API (Manifest V3).
It stores your block list in chrome.storage.sync, so your settings follow you across devices.

Features

🚫 Blocks porn and distracting sites by default

➕ Block any website with one click

🔄 Syncs blocked sites across all Chrome browsers

⚡ Real-time rule updates using dynamic DNR

🎯 Clean, simple popup UI

🔐 Secure, efficient, Manifest V3 architecture

Installation

Download or clone this repository.

Open Chrome → chrome://extensions/

Enable Developer mode (top-right).

Click Load unpacked.

Select the Webguard folder.

The extension is now installed.

Usage
Block the Current Tab

Click the WebGuard icon.

Click Block Current Tab.

The site is added to the block list and immediately blocked.

Unblock a Site

Click the WebGuard icon.

In the list, click ✕ next to the domain.

View All Blocked Sites

Just open the popup — your synced block list is shown instantly.

Default Blocked Sites

facebook.com

youtube.com

(You can customize or remove these in background.js)

File Structure
Webguard/
├── manifest.json      # Extension manifest (MV3)
├── background.js      # Service worker: DNR rules + sync logic
├── popup.html         # Popup UI
├── popup.js           # Popup interactions
├── popup.css          # Popup styling
├── icon16.png
├── icon48.png
├── icon128.png
└── rules.json         # (Optional) placeholder for static rules

How It Works
🧩 DeclarativeNetRequest (DNR)

Blocks sites using Chrome’s efficient MV3 rules engine

No content scripts needed for basic blocking

🔧 Dynamic Rules

When you add/remove a site, WebGuard updates rules instantly

💾 chrome.storage.sync

Syncs all blocked sites across your Chrome profile

🛠 Service Worker

Runs in the background

Manages syncing, rule updates, and popup communication

Permissions Explained
Permission	Reason
declarativeNetRequest	Block websites via rules
declarativeNetRequestFeedback	Read/update rules
storage	Save block list
activeTab	Get the URL of the current tab
host_permissions	Required to block arbitrary domains
Customization
Change default blocked sites:

Edit this line in background.js:

const DEFAULT_BLOCKED_SITES = ['facebook.com', 'youtube.com'];

Add your own icons:

Replace icon16.png, icon48.png, icon128.png with your preferred PNGs.

License

MIT — free to modify and use.
