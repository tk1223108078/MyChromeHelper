
chrome.tabs.query({url: UrlText}, function(tabs) {
    // 向content中发送消息
    // https://developer.chrome.com/extensions/tabs#method-sendMessage
    chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {
        console.log(response);
    });
});
