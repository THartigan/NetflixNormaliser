// background.js

console.log('Background script starting...');

let dailyLimitMinutes = 120; // Default daily limit
let allowedHours = { start: 18, end: 22 }; // Default allowed hours
let dailyUsage = 0;
let lastReset = Date.now();

// Load settings and usage data from storage
function loadDataFromStorage() {
  console.log('Loading data from storage...');
  chrome.storage.local.get(['dailyLimitMinutes', 'allowedHours', 'dailyUsage', 'lastReset'], (result) => {
    dailyLimitMinutes = result.dailyLimitMinutes || dailyLimitMinutes;
    allowedHours = result.allowedHours || allowedHours;
    dailyUsage = result.dailyUsage || 0;
    lastReset = result.lastReset || lastReset;
    console.log('Data loaded:', { dailyLimitMinutes, allowedHours, dailyUsage, lastReset });
  });
}

// Initialize data on startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup detected.');
  loadDataFromStorage();
  resetDailyUsageIfNeeded();
});

// Load data on installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed.');
  loadDataFromStorage();
});

// Reset usage at midnight
function resetDailyUsageIfNeeded() {
  console.log('Checking if daily usage reset is needed...');
  const now = new Date();
  const lastResetDate = new Date(lastReset);
  if (now.getDate() !== lastResetDate.getDate() || now - lastResetDate >= 86400000) {
    console.log('Resetting daily usage.');
    dailyUsage = 0;
    lastReset = now.getTime();
    chrome.storage.local.set({ dailyUsage, lastReset }, () => {
      updateBadge();
    });
  } else {
    console.log('No reset needed.');
  }
}

// Check if current time is within allowed hours
function isWithinAllowedHours() {
  const now = new Date();
  const currentHour = now.getHours();
  const withinHours = currentHour >= allowedHours.start && currentHour < allowedHours.end;
  console.log(`Current hour: ${currentHour}, Within allowed hours: ${withinHours}, Allowed Hours: ${allowedHours.start} - ${allowedHours.end}`);
  return withinHours;
}

// Track time spent on Netflix
let trackingTabs = {};

function startTracking(tabId) {
  if (trackingTabs[tabId]) return;

  console.log(`Starting tracking for tab ${tabId}.`);
  trackingTabs[tabId] = setInterval(() => {
    dailyUsage += 1; // Increment by 1 minute
    console.log(`Tab ${tabId}: Incremented daily usage to ${dailyUsage} minutes.`);
    chrome.storage.local.set({ dailyUsage }, () => {
      updateBadge();
    });

    // Check if daily limit is exceeded
    if (dailyUsage >= dailyLimitMinutes) {
      console.log(`Daily limit reached. Redirecting tab ${tabId} to blocked page.`);
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL('blocked.html?reason=limit') });
      stopTracking(tabId);
    }
  }, 60000); // Every minute
}

function stopTracking(tabId) {
  if (trackingTabs[tabId]) {
    console.log(`Stopping tracking for tab ${tabId}.`);
    clearInterval(trackingTabs[tabId]);
    delete trackingTabs[tabId];
  }
}

// Monitor tab updates to redirect when necessary
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('netflix.com')) {
    console.log(`Tab ${tabId} updated with Netflix URL.`);
    resetDailyUsageIfNeeded();
    // Check if access should be blocked
    if (!isWithinAllowedHours()) {
      console.log('Outside allowed hours. Redirecting to blocked page.');
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL('blocked.html?reason=hours') });
    } else if (dailyUsage >= dailyLimitMinutes) {
      console.log('Daily limit exceeded. Redirecting to blocked page.');
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL('blocked.html?reason=limit') });
    } else {
      startTracking(tabId);
    }
  } else if (trackingTabs[tabId]) {
    stopTracking(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  console.log(`Tab ${tabId} removed.`);
  stopTracking(tabId);
});

// Update badge text with remaining time
function updateBadge() {
  console.log('Updating badge text...');
  const remaining = Math.max(dailyLimitMinutes - dailyUsage, 0);
  const text = remaining > 0 ? remaining.toString() : '';
  console.log(`Badge text set to: ${text}`);
  chrome.browserAction.setBadgeText({ text });
}

// Listen for changes in storage and update cached data
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    console.log('Storage changes detected:', changes);
    if (changes.dailyLimitMinutes) {
      dailyLimitMinutes = changes.dailyLimitMinutes.newValue;
      updateBadge();
    }
    if (changes.allowedHours) {
      allowedHours = changes.allowedHours.newValue;
      console.log('Updated allowedHours:', allowedHours);
    }
    if (changes.dailyUsage) {
      dailyUsage = changes.dailyUsage.newValue;
      updateBadge();
    }
    if (changes.lastReset) {
      lastReset = changes.lastReset.newValue;
    }
  }
});

// Handle messages from other scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getUsageStats') {
    console.log('Received message to get usage stats.');
    const timeRemaining = Math.max(dailyLimitMinutes - dailyUsage, 0);
    sendResponse({
      dailyLimitMinutes,
      timeUsed: dailyUsage,
      timeRemaining,
      allowedHours
    });
    return true; // Indicates we will send a response asynchronously
  }
});
