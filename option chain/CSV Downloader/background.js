chrome.browserAction.onClicked.addListener(start);

function start(tab) {
  const signal = true;
  chrome.tabs.sendMessage(tab.id, signal);
}
