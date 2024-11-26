// popup.js

console.log('Popup script loaded.');

function updatePopup() {
  console.log('Updating popup with usage statistics.');
  browser.storage.local.get(['dailyUsage', 'dailyLimitMinutes', 'allowedHours']).then((result) => {
    const dailyLimitMinutes = result.dailyLimitMinutes || 120;
    const timeUsed = result.dailyUsage || 0;
    const timeRemaining = Math.max(dailyLimitMinutes - timeUsed, 0);
    const allowedHours = result.allowedHours || { start: 18, end: 22 };

    document.getElementById('dailyLimit').textContent = dailyLimitMinutes;
    document.getElementById('timeUsed').textContent = timeUsed;
    document.getElementById('timeRemaining').textContent = timeRemaining;
    document.getElementById('allowedHours').textContent = `${allowedHours.start}:00 - ${allowedHours.end}:00`;

    console.log('Popup updated:', {
      dailyLimitMinutes,
      timeUsed,
      timeRemaining,
      allowedHours,
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup DOM content loaded.');
  updatePopup();
});
