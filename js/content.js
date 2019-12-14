// 注入函数至正常页面中
function InjectJsFile(jspath){
    var s = document.createElement('script');
    s.src = chrome.extension.getURL(jspath);
    s.onload = function() {
        this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(s);
}

InjectJsFile("js/common/define.js");
InjectJsFile("js/inject.js");

// 接收chrome插件内部的消息
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // 将从插件中接收的消息分发给所有的注入页面
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
        window.postMessage({id:messgae_flag_key, data:"content发送消息到inject测试"}, '*');
        HasPostMessage = true;
    }
);

window.addEventListener("message", function(event) {
    var data = event.data;
    if(data && data.id == messgae_flag_key)
    {
        this.console.log(data.data);
    }
}, false);
