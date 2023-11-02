chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "exportToVue") {
      chrome.scripting.executeScript({
          target: { tabId: sender.tab.id },
          function: getSelectedElementData
      }, (results) => {
          if (results && results[0]) {
              sendResponse(results[0].result);
          }
      });
      return true;
  }
});

function getSelectedElementData() {
  chrome.runtime.sendMessage({ action: "getSelectedElement" });
}
