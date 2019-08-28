var EnableKey = "www.taosijie.com.chrometool.Enable";
var UrlKey = "www.taosijie.com.chrometool.Url";
var MaxPriceKey = "www.taosijie.com.chrometool.MaxPrice";
var MaxNumberKey = "www.taosijie.com.chrometool.MaxNumber";

// 获取本地存储值
function GetLocalStorageValueString(key){
    if(window.localStorage){
        var value = window.localStorage.getItem(key);
        return value;
    }
    return null;
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
    switch (request.type) {
        case "autobuy":
            var OpenUrl = request.url;
            var ConfigUrl = GetLocalStorageValueString(UrlKey);

            // 功能开关
            var EnableValue = false;
            if(OpenUrl == ConfigUrl){
                if(GetLocalStorageValueString(EnableKey) == "open"){
                    EnableValue = true;
                }
            }

            // 价格
            var PriceValue = 0.0;
            let PriceTemp = GetLocalStorageValueString(MaxPriceKey);
            if(PriceTemp){
                PriceValue = parseFloat(PriceTemp);
            }
            // 数量
            var NumberValue = 0;
            let NumberTemp = GetLocalStorageValueString(MaxNumberKey);
            if(NumberTemp){
                NumberValue = parseInt(NumberTemp);
            }
            sendResponse({Enable:EnableValue, Price:PriceValue, Number:NumberValue});
            
            break;
        default: break;
    }
});

// 桌面通知
chrome.notifications.create(null, {
    type: 'basic',
    iconUrl: 'img/icon.png',
    title: '标题',
    message: '提示'
});

chrome.contextMenus.create({
    type: 'normal', // 类型，可选：["normal", "checkbox", "radio", "separator"]，默认 normal
    title: '菜单的名字', // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
    contexts: ['page'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
    onclick: function(){}, // 单击时触发的方法
    parentId: 1, // 右键菜单项的父菜单项ID。指定父菜单项将会使此菜单项成为父菜单项的子菜单
    documentUrlPatterns: 'https://*.baidu.com/*' // 只在某些页面显示此右键菜单
});
// 删除某一个菜单项
chrome.contextMenus.remove(menuItemId);
// 删除所有自定义右键菜单
chrome.contextMenus.removeAll();
// 更新某一个菜单项
chrome.contextMenus.update(menuItemId, updateProperties);