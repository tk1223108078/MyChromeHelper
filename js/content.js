// 注入函数至正常页面中
function InjectJsFile(){
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('js/inject.js');
    s.onload = function() {
        this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(s);
}

InjectJsFile();

// 接收chrome插件内部的消息
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // 将从插件中接收的消息分发给所有的注入页面
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
        window.postMessage({price: request.price, number: request.number}, '*');
        HasPostMessage = true;
    }
);
