
function copyCookie(){
    var bg = chrome.extension.getBackgroundPage();
    bg.showCookie();
}

// 界面加载事件
window.onload = function(){
    // 添加点击事件
    var copyCookieBtn = document.getElementById("copyCookie");
    copyCookieBtn.addEventListener("click", copyCookie);
}

/*chrome.tabs.query({url: UrlText}, function(tabs) {
    // 向content中发送消息
    // https://developer.chrome.com/extensions/tabs#method-sendMessage
    chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {
        console.log(response);
    });
});*/