// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
  // 获取"打开LightNote应用"按钮元素
  const openAppButton = document.getElementById('openApp');
  
  // 添加点击事件处理程序
  openAppButton.addEventListener('click', () => {
    // 打开LightNote应用页面
    chrome.tabs.create({ url: 'http://localhost:3000' });
    
    // 关闭弹出窗口
    window.close();
  });
}); 