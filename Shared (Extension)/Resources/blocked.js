//
//  blocked.js
//  NetflixNormaliser
//
//  Created by Thomas Hartigan on 26/11/2024.
//


// blocked.js

console.log('Blocked page script loaded.');

function updateBlockedPage() {
  console.log('Updating blocked page content.');
  const urlParams = new URLSearchParams(window.location.search);
  const reason = urlParams.get('reason') || 'limit';

  const messageElement = document.getElementById('message');
  const statusElement = document.getElementById('status');

  if (reason === 'limit') {
    messageElement.textContent = 'You have reached your daily usage limit for Netflix.';
  } else if (reason === 'hours') {
    messageElement.textContent = 'Netflix access is restricted during these hours.';
  }

  // Fetch usage stats to display remaining time (if any)
  browser.runtime.sendMessage({ action: 'getUsageStats' }).then((result) => {
    const { dailyLimitMinutes, timeUsed, timeRemaining, allowedHours } = result;
    statusElement.textContent = `Time Used: ${timeUsed} minutes of ${dailyLimitMinutes} minutes allowed. Allowed hours: ${allowedHours.start}:00 - ${allowedHours.end}:00`;
    console.log('Blocked page updated with usage stats:', result);
  }).catch((error) => {
    console.error('Error fetching usage stats:', error);
  });
}

// Event listener for the "Adjust Settings" button
document.getElementById('optionsButton').addEventListener('click', () => {
  // Open the options page
  browser.runtime.openOptionsPage().catch((error) => {
    console.error('Error opening options page:', error);
  });
});

document.addEventListener('DOMContentLoaded', updateBlockedPage);
