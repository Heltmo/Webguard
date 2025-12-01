// background.js – NUCLEAR BLOCKER (FINAL)

// ===== DEFAULT BLOCKED SITES =====
const DEFAULT_BLOCKED_SITES = [
  'facebook.com', 'fb.com', 'messenger.com',
  'instagram.com',
  'twitter.com', 'x.com',
  'tiktok.com',
  'snapchat.com',
  'reddit.com', 'old.reddit.com',
  'youtube.com',
  'netflix.com',
  'twitch.tv', 'twitch.com',
  'hulu.com',
  'disneyplus.com',
  'pornhub.com', 'xvideos.com', 'xnxx.com',
  'youporn.com', 'redtube.com',
  'pornhub.org', 'pornhubpremium.com',
  'roblox.com',
  'discord.com', 'discordapp.com',
  'amazon.com', 'ebay.com', 'aliexpress.com',
  'cnn.com', 'foxnews.com', 'nytimes.com'
];

// High base for dynamic rule IDs (safe within 32-bit signed int limit)
const BASE_RULE_ID = 1_000_000_000;

// Re-entry guard to avoid overlapping updates
let isUpdatingRules = false;

// ===== MAIN FUNCTION =====
async function applyNuclearBlock() {
  if (isUpdatingRules) {
    console.log('NUCLEAR: Update already in progress, skipping.');
    return;
  }

  isUpdatingRules = true;
  try {
    console.log('NUCLEAR: Starting...');

    // Get existing sites from storage
    const { blockedSites } = await chrome.storage.sync.get('blockedSites');
    let finalSites;

    // FIRST TIME: initialize with the default nuclear list
    if (!Array.isArray(blockedSites) || blockedSites.length === 0) {
      finalSites = DEFAULT_BLOCKED_SITES.slice();
      await chrome.storage.sync.set({ blockedSites: finalSites });
      console.log('NUCLEAR: Initialized with default sites:', finalSites.length);
    } else {
      // AFTER THAT: trust storage as the single source of truth
      finalSites = [...new Set(blockedSites)];
      console.log('NUCLEAR: Using stored sites:', finalSites.length);
    }

    // Sanity check for ID range
    const maxId = BASE_RULE_ID + finalSites.length;
    if (maxId > 2_147_483_647) {
      throw new Error('Too many rules for selected BASE_RULE_ID range.');
    }

    // CLEAR EXISTING DYNAMIC RULES
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    if (existingRules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRules.map(rule => rule.id)
      });
      console.log('NUCLEAR: Removed existing rules:', existingRules.length);
    }

    // BUILD NEW RULES — SIMPLE, RELIABLE
    const newRules = finalSites.map((site, index) => {
      const domain = site.replace(/^www\./, '').trim();

      return {
        id: BASE_RULE_ID + index,
        priority: 1,
        action: { type: 'block' },
        condition: {
          // Any URL whose string contains this domain will be blocked
          urlFilter: domain,
          resourceTypes: ['main_frame']
        }
      };
    });

    // ADD NEW RULES
    await chrome.declarativeNetRequest.updateDynamicRules({ addRules: newRules });
    console.log('NUCLEAR BLOCKER ACTIVE:', finalSites.length, 'sites blocked');
  } catch (error) {
    console.error('NUCLEAR FAILED:', error);
  } finally {
    isUpdatingRules = false;
  }
}

// ===== LIFECYCLE HOOKS =====

// On install / update
chrome.runtime.onInstalled.addListener(() => {
  applyNuclearBlock();
});

// When blockedSites changes in storage (e.g. popup adds/removes a domain)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.blockedSites) {
    applyNuclearBlock();
  }
});

// ===== UTIL: EXTRACT DOMAIN FROM URL =====
function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch (error) {
    return null;
  }
}

// ===== POPUP / MESSAGE HANDLER =====
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'blockCurrentTab') {
    handleBlockCurrentTab(message.url).then(sendResponse);
    return true; // Keep channel open
  }
  if (message.action === 'unblockDomain') {
    handleUnblockDomain(message.domain).then(sendResponse);
    return true;
  }
});

// ===== HANDLE BLOCKING THE CURRENT TAB'S DOMAIN =====
async function handleBlockCurrentTab(url) {
  const domain = extractDomain(url);
  if (!domain) {
    return { success: false, error: 'Invalid URL' };
  }

  const { blockedSites } = await chrome.storage.sync.get('blockedSites');
  const current = Array.isArray(blockedSites) ? blockedSites : [];

  if (current.includes(domain)) {
    return { success: false, error: 'Already blocked' };
  }

  const updatedSites = [...current, domain];
  await chrome.storage.sync.set({ blockedSites: updatedSites });

  return { success: true, domain };
}

// ===== HANDLE UNBLOCKING A DOMAIN =====
async function handleUnblockDomain(domain) {
  const { blockedSites } = await chrome.storage.sync.get('blockedSites');
  const current = Array.isArray(blockedSites) ? blockedSites : [];

  const filtered = current.filter(d => d !== domain);
  if (filtered.length === current.length) {
    return { success: false, error: 'Domain not found' };
  }

  await chrome.storage.sync.set({ blockedSites: filtered });
  return { success: true, domain };
}
