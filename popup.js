// Popup script for website blocker extension

document.addEventListener('DOMContentLoaded', async () => {
  const blockCurrentBtn = document.getElementById('blockCurrentBtn');
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
