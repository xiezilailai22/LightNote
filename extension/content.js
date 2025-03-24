// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelection") {
    // 获取用户选中的文本
    const selection = window.getSelection().toString().trim();
    sendResponse({ selection: selection });
  }
  
  // 返回true以支持异步响应
  return true;
}); 