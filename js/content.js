// // 获取本地存储中的历史页面列表
// var historyPageListMap = new Map();
// var historyPageListString = GetLocalStorageValueString(localstorage_historypagelist_key);
// if(historyPageListString != null){
//     historyPageListMap = JsonStrToMap(historyPageListString);
// }

// 注入到当前页面中
// 为什么要注入了，因为content中是获取不到原页面中的元素的，只能通过注入到原页面中的js才能获取
InjectJsFile("js/common/common.js");
InjectJsFile("js/common/chrome.js");
InjectJsFile("js/common/define.js");
InjectJsFile("js/inject.js");

// 接受inject.js中的消息
window.addEventListener("message", function(event) {
    var data = event.data;
    if(data && data.id == messgae_id_key)
    {
        var pageInfo = data.data;
        var key = pageInfo.url;
        var time = new Date().getTime();
        var value = {title:pageInfo.title, time:time};
        historyPageListDataMap.set(key, value);
        var historyPageListMapString = MapToJsonStr(historyPageListDataMap);
        SetLocalStorageValueString(localstorage_historypagelist_key, historyPageListMapString);
    }
}, false);

// 接收chrome插件内部的消息
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // 将从插件中接收的消息分发给所有的注入页面
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
        window.postMessage({id:messgae_id_key, data:"content发送消息到inject测试"}, '*');
        HasPostMessage = true;
    }
);

window.onload = function(){
    // 获取当前页面标题和url
    var title = document.title;
    var url = window.location.href; /* 获取完整URL */  
    var time = new Date().getTime();
    var data = {title:title, url:url, time:time};
    // 向backgrond.js发送消息
    chrome.runtime.sendMessage(
        {id: messgae_id_key, action:messgae_action_pagerecord, data:data},
        function(response) {
            console.log("接收的返回消息"+JSON.stringify(response));
        }
    );
    // window.postMessage({id:messgae_flag_key, data:{title:title, url:url}}, '*');
}
