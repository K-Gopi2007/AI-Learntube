// Background script
console.log('LearnTube AI background service worker initialized.');

// Optional: listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('LearnTube AI Extension Installed');
});
