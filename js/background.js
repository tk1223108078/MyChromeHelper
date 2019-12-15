// chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
//     switch (request.type) {
//         case "alive":
//             sendResponse(searchJson);
//             break;
//         default: break;
//     }
// });

// // 桌面通知
// chrome.notifications.create(null, {
//     type: 'basic',
//     iconUrl: 'img/icon.png',
//     title: '标题',
//     message: '提示'
// });

// chrome.contextMenus.create({
//     type: 'normal', // 类型，可选：["normal", "checkbox", "radio", "separator"]，默认 normal
//     title: '菜单的名字', // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
//     contexts: ['page'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
//     onclick: function(){}, // 单击时触发的方法
//     parentId: 1, // 右键菜单项的父菜单项ID。指定父菜单项将会使此菜单项成为父菜单项的子菜单
//     documentUrlPatterns: 'https://*.baidu.com/*' // 只在某些页面显示此右键菜单
// });

// // 删除某一个菜单项
// chrome.contextMenus.remove(menuItemId);
// // 删除所有自定义右键菜单
// chrome.contextMenus.removeAll();
// // 更新某一个菜单项
// chrome.contextMenus.update(menuItemId, updateProperties);

// background页面是插件运行后就一直在后台运行的

// 获取本地存储中的历史页面列表
var historyPageListDataMap = new Map();
var historyPageListTimeMap = new Map();
var historyPageListString = GetLocalStorageValueString(localstorage_historypagelist_key);
if(historyPageListString != null){
    historyPageListDataMap = JsonStrToMap(historyPageListString);
    for (let[k,v] of historyPageListDataMap) {
        historyPageListTimeMap.set(v.time, v);
      }
}

// 定时函数
function onTime(){
    // 遍历现有的map清空最老的浏览记录
    // 当前map超过最大大小时，清理掉最老的十分之一的记录
    if(historyPageListDataMap.size > historypagelist_maxsize)
    {
        var historyPageListTimeArray = Array.from(historyPageListTimeMap);
        historyPageListTimeArray.sort(function(a,b){return a[0] - b[0]});
        var clearCurNumber = 0x0;
        for (var value of historyPageListTimeArray) {
            if(clearCurNumber < historypagelist_clearsize){
                historyPageListDataMap.delete(value.url);
                historyPageListTimeMap.delete(value.time);
                clearCurNumber++;
            }else{
                break;
            }
        }
    }

    // 存储浏览历史
    var historyPageListString = MapToJsonStr(historyPageListDataMap);
    SetLocalStorageValueString(historyPageListString);
}

// 接受content.js中发送来的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.id == messgae_flag_key){
        var pageInfo = request.data;
        historyPageListDataMap.set(pageInfo.url, pageInfo);
        historyPageListTimeMap.set(pageInfo.time, pageInfo);
        sendResponse('我已收到你的消息：' +JSON.stringify(request));
    }
});

// 启动定时任务
var timeId = setInterval(onTime, 1000*3);


