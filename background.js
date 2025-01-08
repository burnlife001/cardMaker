// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'createCard',
    title: '制作分享卡片',
    contexts: ['selection']
  });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'createCard') {
    // 直接打开编辑器页面
    const url = chrome.runtime.getURL('popup.html') + `?text=${encodeURIComponent(info.selectionText)}`;
    chrome.tabs.create({ url });
  }
});

// 处理来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'createCard') {
    const url = chrome.runtime.getURL('popup.html') + `?text=${encodeURIComponent(request.text)}`;
    chrome.tabs.create({ url });
  }
});