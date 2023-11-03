let startX, startY, endX, endY;
let selectionBox = null;
let selecting = false;
let selectedElement = null;
let overlay = null;
let oldCursor = null;

document.addEventListener('mousedown', function (e) {
    console.log("content.js mousedown....");
// 阻止事件的默认行为和传播，以免触发页面本身的点击事件
    e.preventDefault();
    e.stopPropagation();
    // 调用函数处理选中的元素


    handleElementSelection(selectedElement);
    if(selecting===true){
        createFloatingButton(e.pageX, e.pageY);
    }

});

function handleElementSelection(element) {

}

document.addEventListener('mouseup', function (e) {
    if (selectionBox) {
        document.body.removeChild(selectionBox);
    }
    selecting = false;
    document.body.style.cursor = oldCursor;
    // selectedElement = document.elementFromPoint(endX - window.scrollX, endY - window.scrollY);
    e.preventDefault();
});


function getRelevantCSS(element) {
  let styles = '';
  const sheets = document.styleSheets;
  for (let i = 0; i < sheets.length; i++) {
      const rules = sheets[i] || sheets[i].cssRules;
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
    selecting= true;
    oldCursor = document.body.style.cursor;
    document.body.style.cursor = 'crosshair';
    console.log("enableSelectionMode 执行");
    document.addEventListener('mousemove', highlightElementUnderMouse);
}

function highlightElementUnderMouse(e)
{
    if(selecting==false) return;

    selectedElement = e.target;
    if(!overlay){
        overlay = document.createElement("div");
        document.body.appendChild(overlay);
    }

    // 设置蒙版样式
    overlay.style.position = 'absolute';
    overlay.style.pointerEvents = 'none'; // 确保蒙版不会阻止页面其他元素的点击事件
    overlay.style.border = '2px solid rgba(255, 0, 0, 0.5)'; // 边框颜色可以根据你的需求更改
    overlay.style.background = 'rgba(255, 255, 255, 0.7)'; // 半透明的蒙版
    overlay.style.zIndex = '9999'; // 确保蒙版在最上层

    // 将蒙版位置和大小调整到鼠标下的元素
    const rect = selectedElement.getBoundingClientRect();
    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
}

function createFloatingButton(x, y) {
    // 创建一个新的按钮元素
    const button = document.createElement('button');
    button.textContent = 'Export to Vue Component';
    button.style.position = 'fixed';
    button.style.left = `${x}px`;
    button.style.top = `${y + 5}px`; // 将按钮放在鼠标点击的下方
    button.style.zIndex = '10000';

    // 添加事件监听器，用于导出组件
    button.addEventListener('click', function() {
        exportElementToVueComponent(selectedElement);
    });

    // 将按钮添加到页面中
    document.body.appendChild(button);
    // 移除按钮的函数
    function removeButton() {
        document.body.removeChild(button);
    }

    // 如果用户点击了其他地方，移除按钮
    // document.addEventListener('click', function(event) {
    //     if (event.target !== button) {
    //         removeButton();
    //     }
    // }, { once: true }); // 使用 once 选项使事件只触发一次

    // 如果用户滚动页面，也移除按钮
    // window.addEventListener('scroll', removeButton, { once: true });
}

function exportElementToVueComponent(element) {
    const html = element.outerHTML;
    let cssText = getAllDescendantCss(element);
    console.log(cssText);

    //拼接出vue component的完整代码，并弹出下载窗口
        // 创建Vue组件字符串
        const vueComponentStr = `
        <template>
          <div>
            ${html}
          </div>
        </template>
        
        <script>
        export default {
          name: 'ExportedComponent'
          // 您可以在此添加更多的脚本代码，如methods, data等
        };
        </script>
        
        <style scoped>
        ${cssText}
        </style>
        `;
        
        // 创建一个Blob对象来存储Vue组件字符串
        const blob = new Blob([vueComponentStr], { type: 'text/vue;charset=utf-8' });
        const url = URL.createObjectURL(blob);
    
        // 创建一个链接元素用于下载
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'exported-component.vue'; // 组件文件的名称
    
        // 将链接元素添加到DOM中并触发点击事件以下载
        document.body.appendChild(downloadLink);
        downloadLink.click();
    
        // 清理：撤销Blob URL并从DOM中移除链接元素
        URL.revokeObjectURL(url);
        document.body.removeChild(downloadLink);
}

// Dummy function representing what a get-css library function might look like
function getCSS(element) {
    let styles = window.getComputedStyle(element);
    let elementCss = `${element.tagName} {\n`;

    for (let i = 0; i < styles.length; i++) {
        let styleName = styles[i];
        let styleValue = styles.getPropertyValue(styleName);
        if (styleValue) {
            elementCss += `  ${styleName}: ${styleValue};\n`;
        }
    }

    // Close the tag name
    elementCss += '}\n';

    // Handling pseudo-elements
    let pseudoElements = [':before', ':after'];
    pseudoElements.forEach((pseudo) => {
        let pseudoStyles = window.getComputedStyle(element, pseudo);
        let pseudoCss = '';
        for (let i = 0; i < pseudoStyles.length; i++) {
            let styleName = pseudoStyles[i];
            let styleValue = pseudoStyles.getPropertyValue(styleName);
            if (styleValue) {
                pseudoCss += `  ${styleName}: ${styleValue};\n`;
            }
        }
        if (pseudoCss) {
            elementCss += `${element.tagName}${pseudo} {\n ${pseudoCss} }\n`;
        }
    });

    return elementCss;
}

function getAllDescendantCss(element) {
    let allCss = getCSS(element);

    // Recursive function to process all children
    function processChildren(parentElement) {
        for (const child of parentElement.children) {
            allCss += getCSS(child);
            processChildren(child); // Recursively process all levels of children
        }
    }

    processChildren(element); // Start the recursive process

    return allCss;
}


//用来接收来自popup.js发来的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("收到消息......"+request);
  if (request === "getSelectedElement") {
      if (selectedElement) {
          const extractedCSS = getRelevantCSS(selectedElement);
          sendResponse({
              html: selectedElement.outerHTML,
              css: extractedCSS
          });
      }
  }
  else if(request === "enableSelectionMode"){
    console.log("enableSelectionMode 执行......");
    enableSelectionMode();
  }
});

