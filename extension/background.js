// 扩展初始化时创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-lightnote",
    title: "保存到LightNote",
    contexts: ["selection"]
  });
});

// 处理右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-to-lightnote" && info.selectionText) {
    saveContent({
      content: info.selectionText,
      sourceUrl: tab.url,
      sourceTitle: tab.title
    });
  }
});

// 处理快捷键命令
chrome.commands.onCommand.addListener((command) => {
  if (command === "save-selection") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getSelection" }, (response) => {
        if (response && response.selection) {
          saveContent({
            content: response.selection,
            sourceUrl: tabs[0].url,
            sourceTitle: tabs[0].title
          });
        }
      });
    });
  }
});

// 保存内容到LightNote后端
async function saveContent(data) {
  try {
    // 显示保存中通知
    showNotification("正在保存到LightNote...");
    
    // 发送到后端API
    const response = await fetch("http://localhost:3001/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      showNotification("内容已成功保存到LightNote!");
    } else {
      showNotification("保存失败: " + (result.error || "未知错误"));
    }
  } catch (error) {
    console.error("保存内容出错:", error);
    showNotification("保存失败，请检查LightNote服务是否运行");
  }
}

// 显示通知
function showNotification(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon-128.png",
    title: "LightNote",
    message: message
  });
} 