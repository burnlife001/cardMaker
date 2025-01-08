// 监听来自background.js的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openCardEditor') {
    // 创建卡片编辑器
    const selectedText = request.text;
    chrome.runtime.sendMessage({
      action: 'createCard',
      text: selectedText
    });
  }
});

// 处理文字选择事件
document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText) {
    chrome.runtime.sendMessage({
      action: 'createCard',
      text: selectedText
    });
  }
});