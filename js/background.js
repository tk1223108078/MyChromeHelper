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

// 复制文本至剪贴板
function text2clip(text) {
    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = text;
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    body.removeChild(copyFrom);
}

// 通知
function notify(msg) {
    if (window.Notification) { new Notification(chrome.app.getDetails().name, { icon: chrome.app.getDetails().icons['48'], body: msg }); }
}

async function getIdFromCookie() {
    let promise1 = new Promise((resolve, reject) => {
        chrome.tabs.getSelected(null, function(tab) {
            var url = tab.url;
            var arr = url.split("/");
            var result = arr[0] + '//' + arr[2]

            resolve(result)
        })
    })

    let domain = await promise1;
    console.log("domain", domain);
    let stringCookie = "";
    let promise = new Promise((resolve, reject) => {
        chrome.cookies.getAll({
            url: domain
        }, async function(cookies) {
            for (var i = 0; i < cookies.length; i++) {
                if (cookies[i].name.length > 0 && cookies[i].value.length > 0) {
                    stringCookie = stringCookie + cookies[i].name + "=" + cookies[i].value + "; ";
                }
            }
            resolve(stringCookie);

        });
    })
    try {
        let result = await promise;
        return result;
    } catch (error) {
        return false;
    }
}

// 获取Cookie
async function showCookie() {
    let cookieString = await getIdFromCookie();
    text2clip(cookieString);
    notify("Cookies 已经成功复制到剪切板。");
}

/**
 * 自动脚本
 */

// 根据Domain获取Cookie
async function getCookieByDomain(domain) {
    let ok = 0;
    let data = new Map();
    let promise = new Promise((resolve, reject) => {
        chrome.cookies.getAll({ url: domain }, cookies => {
            for (var i = 0; i < cookies.length; i++) {
                if (cookies[i].name.length > 0 && cookies[i].value.length > 0) {
                    data.set(cookies[i].name, cookies[i].value);
                }
            }
            resolve(data);
        });
    })

    try {
        let result = await promise;
        if (result.size > 0) {
            ok = 1;
            data = result;
        }
    } catch (error) {
        data = "发生异常, error=" + error;
    }
    // 返回值
    return { "ok": ok, "data": data };
}

// 自动执行函数
async function onAutoRun() {
    let url = 'https://c.m.suning.com/newFarm2020.html';
    // 确保打开了苏宁农庄
    var isOpen = await isUrlOpen(url);
    if (isOpen == false) {
        return;
    }

    // 获取指定界面的
    var getCookieResult = await getCookieByDomain("https://c.m.suning.com");
    console.log("1");
}

// 启动定时任务
var timeAutoRun = setInterval(onAutoRun, 1000 * 3);


/**
 * 统计相关
 */

// 获取本地存储中的历史页面列表
var historyPageListDataMap = new Map();
var historyPageListTimeMap = new Map();
var historyPageListString = GetLocalStorageValueString(localstorage_historypagelist_key);
if (historyPageListString != null) {
    historyPageListDataMap = JsonStrToMap(historyPageListString);
    for (let [k, v] of historyPageListDataMap) {
        historyPageListTimeMap.set(v.time, v);
    }
}

// 定时函数
function onTime() {
    // 遍历现有的map清空最老的浏览记录
    // 当前map超过最大大小时，清理掉最老的十分之一的记录
    if (historyPageListDataMap.size > historypagelist_maxsize) {
        var historyPageListTimeArray = Array.from(historyPageListTimeMap);
        historyPageListTimeArray.sort(function(a, b) { return a[0] - b[0] });
        var clearCurNumber = 0x0;
        for (var value of historyPageListTimeArray) {
            if (clearCurNumber < historypagelist_clearsize) {
                historyPageListDataMap.delete(value.url);
                historyPageListTimeMap.delete(value.time);
                clearCurNumber++;
            } else {
                break;
            }
        }
    }

    // 存储浏览历史
    var historyPageListString = MapToJsonStr(historyPageListDataMap);
    SetLocalStorageValueString(historyPageListString);
}

// 从历史列表中获取推荐列表
function getSuggestList(value) {
    var rv = [];
    var searchValueLowerCase = value.toLowerCase();
    var historyPageListTimeArray = Array.from(historyPageListTimeMap);
    // 倒序
    historyPageListTimeArray.sort(function(a, b) { return b[0] - a[0] });
    var selectNumber = 0x0;
    for (var item of historyPageListTimeArray) {
        var url = item[1].url;
        var title = item[1].title;
        // 看url和title有没有匹配的
        if (url.toLowerCase().indexOf(searchValueLowerCase) != -1 || title.toLowerCase().indexOf(searchValueLowerCase) != -1) {
            if (selectNumber <= suggestlist_maxsize) {
                rv.push({ url: url, title: title });
                selectNumber++;
            } else {
                break;
            }
        }
    }
    return rv;
}

// 接受content.js中发送来的消息
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.id == messgae_id_key) {
        // 历史页面统计
        if (request.action == messgae_action_pagerecord) {
            var pageInfo = request.data;
            // 删除timemap中的旧值
            if (historyPageListDataMap.has(pageInfo.url)) {
                var item = historyPageListDataMap.get(pageInfo.url);
                historyPageListTimeMap.delete(item.time);
            }
            // 更新下俩个map中的值
            historyPageListTimeMap.set(pageInfo.time, pageInfo);
            historyPageListDataMap.set(pageInfo.url, pageInfo);
        }
        // 搜索建议
        else if (request.action == messgae_action_searchsuggest) {
            var searchValue = request.data;
            sendResponse(getSuggestList(searchValue));
        }
    }
});

// 启动定时任务
var timeId = setInterval(onTime, 1000 * 3);