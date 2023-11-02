document.getElementById('selectArea').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log("sendMessage: enableSelectionMode");
      chrome.tabs.sendMessage(tabs[0].id,"enableSelectionMode");
  });
});

document.getElementById('exportVue').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "exportToVue" }, (response) => {
      console.log("Exported Vue Data: ", response);
      // Handle Vue template generation here
  });
});

