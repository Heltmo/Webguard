// Popup script for website blocker extension

document.addEventListener('DOMContentLoaded', async () => {
  const blockCurrentBtn = document.getElementById('blockCurrentBtn');
  const addWebsiteBtn = document.getElementById('addWebsiteBtn');
  const websiteInput = document.getElementById('websiteInput');
  const removeWebsiteBtn = document.getElementById('removeWebsiteBtn');
  const unblockInput = document.getElementById('unblockInput');
  const statusDiv = document.getElementById('status');
  const sitesList = document.getElementById('sitesList');
  const emptyMessage = document.getElementById('emptyMessage');

  // Load and display blocked sites
  await loadBlockedSites();

  // Block current tab button handler
  blockCurrentBtn.addEventListener('click', async () => {
    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.url) {
        showStatus('Cannot block this page', 'error');
        return;
      }

      // Send message to background to block the site
      const response = await chrome.runtime.sendMessage({
        action: 'blockCurrentTab',
        url: tab.url
      });

      if (response.success) {
        showStatus(`Blocked: ${response.domain}`, 'success');
        await loadBlockedSites(); // Refresh list

        // Close the current tab after blocking
        setTimeout(() => {
          chrome.tabs.remove(tab.id);
        }, 500);
      } else {
        showStatus(response.error, 'error');
      }
    } catch (error) {
      showStatus('Error blocking site', 'error');
      console.error(error);
    }
  });

  // Add website manually button handler
  addWebsiteBtn.addEventListener('click', async () => {
    const input = websiteInput.value.trim();

    if (!input) {
      showStatus('Please enter a website', 'error');
      return;
    }

    try {
      // Extract domain from input
      let domain = input;

      // Remove protocol if present
      domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');

      // Remove trailing slash and path
      domain = domain.split('/')[0];

      // Basic validation
      if (!domain || domain.length < 3 || !domain.includes('.')) {
        showStatus('Please enter a valid website domain', 'error');
        return;
      }

      // Get current blocked sites
      const { blockedSites = [] } = await chrome.storage.sync.get('blockedSites');

      // Check if already blocked
      if (blockedSites.includes(domain)) {
        showStatus(`${domain} is already blocked`, 'error');
        return;
      }

      // Add to blocked sites
      blockedSites.push(domain);
      await chrome.storage.sync.set({ blockedSites });

      showStatus(`Blocked: ${domain}`, 'success');
      websiteInput.value = ''; // Clear input
      await loadBlockedSites(); // Refresh list
    } catch (error) {
      showStatus('Error adding website', 'error');
      console.error(error);
    }
  });

  // Allow Enter key to submit
  websiteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addWebsiteBtn.click();
    }
  });


  // Remove website manually button handler
  removeWebsiteBtn.addEventListener('click', async () => {
    const input = unblockInput.value.trim();

    if (!input) {
      showStatus('Please enter a website to unblock', 'error');
      return;
    }

    try {
      // Extract domain from input
      let domain = input;

      // Remove protocol if present
      domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');

      // Remove trailing slash and path
      domain = domain.split('/')[0];

      // Basic validation
      if (!domain || domain.length < 3 || !domain.includes('.')) {
        showStatus('Please enter a valid website domain', 'error');
        return;
      }

      // Get current blocked sites
      const { blockedSites = [] } = await chrome.storage.sync.get('blockedSites');

      // Check if site is actually blocked
      if (!blockedSites.includes(domain)) {
        showStatus(`${domain} is not in the block list`, 'error');
        return;
      }

      // Remove from blocked sites
      const updatedSites = blockedSites.filter(site => site !== domain);
      await chrome.storage.sync.set({ blockedSites: updatedSites });

      showStatus(`Unblocked: ${domain}`, 'success');
      unblockInput.value = ''; // Clear input
      await loadBlockedSites(); // Refresh list
    } catch (error) {
      showStatus('Error removing website', 'error');
      console.error(error);
    }
  });

  // Allow Enter key to submit for unblock input
  unblockInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      removeWebsiteBtn.click();
    }
  });



  // Load blocked sites from storage
  async function loadBlockedSites() {
    const { blockedSites = [] } = await chrome.storage.sync.get('blockedSites');

    // Clear current list
    sitesList.innerHTML = '';

    if (blockedSites.length === 0) {
      emptyMessage.style.display = 'block';
      return;
    }

    emptyMessage.style.display = 'none';

    // Add each site to the list
    blockedSites.forEach(site => {
      const li = document.createElement('li');

      const siteSpan = document.createElement('span');
      siteSpan.textContent = site;
      siteSpan.className = 'site-name';

      const unblockBtn = document.createElement('button');
      unblockBtn.textContent = '✕';
      unblockBtn.className = 'btn-unblock';
      unblockBtn.title = 'Unblock site';
      unblockBtn.addEventListener('click', () => unblockSite(site));

      li.appendChild(siteSpan);
      li.appendChild(unblockBtn);
      sitesList.appendChild(li);
    });
  }

  // Unblock a site
  async function unblockSite(siteToRemove) {
    const { blockedSites = [] } = await chrome.storage.sync.get('blockedSites');
    const updatedSites = blockedSites.filter(site => site !== siteToRemove);

    await chrome.storage.sync.set({ blockedSites: updatedSites });
    showStatus(`Unblocked: ${siteToRemove}`, 'success');
    await loadBlockedSites(); // Refresh list
  }

  // Show status message
  function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status status-${type}`;
    statusDiv.style.display = 'block';

    // Hide after 3 seconds
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.blockedSites) {
      loadBlockedSites();
    }
  });
});
