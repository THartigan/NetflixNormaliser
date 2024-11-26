// options.js

console.log('Options script loaded.');

function saveOptions() {
  console.log('Saving options...');
  const dailyLimitMinutes = parseInt(document.getElementById('dailyLimit').value) || 120;
  const startHour = parseInt(document.getElementById('startHour').value) || 18;
  const endHour = parseInt(document.getElementById('endHour').value) || 22;

  const allowedHours = { start: startHour, end: endHour };

  chrome.storage.local.set({
    dailyLimitMinutes,
    allowedHours
  }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Settings saved.';
    setTimeout(() => { status.textContent = ''; }, 2000);
    console.log('Options saved:', { dailyLimitMinutes, allowedHours });
  });
}

function restoreOptions() {
  console.log('Restoring options...');
  chrome.storage.local.get(['dailyLimitMinutes', 'allowedHours'], (result) => {
    document.getElementById('dailyLimit').value = result.dailyLimitMinutes || 120;
    document.getElementById('startHour').value = (result.allowedHours && result.allowedHours.start) || 18;
    document.getElementById('endHour').value = (result.allowedHours && result.allowedHours.end) || 22;
    console.log('Options restored:', result);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Options DOM content loaded.');
  restoreOptions();
});

document.getElementById('saveButton').addEventListener('click', saveOptions);
