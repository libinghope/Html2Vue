let startX, startY, endX, endY;
let selectionBox = null;
let selecting = false;
let selectedElement = null;

document.addEventListener('mousedown', function (e) {
    console.log("content.js mousedown....");
// 阻止事件的默认行为和传播，以免触发页面本身的点击事件
    e.preventDefault();
    e.stopPropagation();
    // 获取被点击的元素
    var curElement = event.target;

    // 调用函数处理选中的元素
    handleElementSelection(curElement);
});

function handleElementSelection(element) {
    // 可以在这里添加更多的逻辑，例如检查元素类型等

    // 为选中的元素添加红色外框
    element.style.outline = '2px solid red';
}


document.addEventListener('mousemove1', function (e) {
    console.log("content.js mousemove....");
    if (!selecting) return;
    endX = e.pageX;
    endY = e.pageY;
    updateSelectionBox();
    e.preventDefault();
});

document.addEventListener('mouseup1', function (e) {
    if (selectionBox) {
        document.body.removeChild(selectionBox);
    }
    selecting = false;
    selectedElement = document.elementFromPoint(endX - window.scrollX, endY - window.scrollY);
    e.preventDefault();
});

function updateSelectionBox() {
    const minX = Math.min(startX, endX);
    const minY = Math.min(startY, endY);
    const maxX = Math.max(startX, endX);
    const maxY = Math.max(startY, endY);
    selectionBox.style.left = minX + 'px';
    selectionBox.style.top = minY + 'px';
    selectionBox.style.width = maxX - minX + 'px';
    selectionBox.style.height = maxY - minY + 'px';
}

function getRelevantCSS(element) {
  let styles = '';
  const sheets = document.styleSheets;
  for (let i = 0; i < sheets.length; i++) {
      const rules = sheets[i].rules || sheets[i].cssRules;
      for (let r = 0; r < rules.length; r++) {
          const rule = rules[r];
          if (element.matches(rule.selectorText)) {
              styles += rule.cssText + '\n';
          }
      }
  }
  return styles;
}

function enableSelectionMode() {
  // Your code to visually indicate that selection mode is active
  // For example, changing the cursor style to a crosshair
  document.body.style.cursor = 'crosshair';
  console.log("enableSelectionMode 执行");
  // You might also want to add some instructions or UI changes
  // to guide the user on how to select the area
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("收到消息......");
  if (request.action === "getSelectedElement") {
      if (selectedElement) {
          const extractedCSS = getRelevantCSS(selectedElement);
          sendResponse({
              html: selectedElement.outerHTML,
              css: extractedCSS
          });
      }
  }
  else if(request.action === "enableSelectionMode"){
    enableSelectionMode();
  }
});

