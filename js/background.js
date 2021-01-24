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

// 根据URL获取Cookie
async function getCookieByDomain(url) {
    let ok = 0;
    let data = new Map();

    // 解析传入的URL为Domain
    var arr = url.split("/");
    var domain = arr[0] + '//' + arr[2];

    // 获取指定URL的Cookie
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

// 获取植物状态
async function getFarmHome() {
    let getFarmHomeUrl = 'https://act.suning.com/act-wap-web/snfarm/gateway/getFarmHome.do?activityCode=snfarm';
    let response = await getResponseWithCookie(getFarmHomeUrl);
    console.log('getFarmHome Reponse=' + JSON.stringify(response));

    // 检查通讯结果
    if (response.ok != 1) {
        return { result: 1, data: response.data };
    }

    // 检查返回结果
    if (response.data.code != 1) {
        return { result: 2, data: response.data };
    }

    return { result: 0, data: response.data.data };
}


// 收割成熟植物
async function harvestCrops(cropId, fieldNo) {
    let harvestCropsUrl = 'https://act.suning.com/act-wap-web/snfarm/gateway/harvestCrops.do?activityCode=snfarm&cropId=' + cropId + '&fieldNo=' + fieldNo + '&referenceURL=https%3A%2F%2Fc.m.suning.com%2FnewFarm2020.html%3Fsafp%3Df73ee1cf.wapindex7.113456729859.6%26safpn%3D10001%23%2F&channel=WAP HTTP/1.1';
    let response = await getResponseWithCookie(harvestCropsUrl);
    console.log("harvestCrops Reponse=" + JSON.stringify(response));

    // 通讯失败
    if (response.ok != 1) {
        return { result: false, errMsg: '通讯失败' + response.data };
    }
    // 检查返回结果
    if (response.data.code != 1) {
        return { result: false, errMsg: '苏宁返回失败' + response.data.code };
    }
    return { result: true };
}

// 种植新植物
async function plantCrops(cropId, fieldNo) {
    let plantCropsUrl = 'https://act.suning.com/act-wap-web/snfarm/gateway/plantCrops.do?activityCode=snfarm&cropId=' + cropId + '&fieldNo=' + fieldNo;
    let response = await getResponseWithCookie(plantCropsUrl);
    console.log("plantCrops Reponse=" + JSON.stringify(response));

    // 通讯失败
    if (response.ok != 1) {
        return { result: false, errMsg: '通讯失败' + response.data };
    }
    // 检查返回结果
    if (response.data.code != 1) {
        return { result: false, errMsg: '苏宁返回失败' + response.data.code };
    }
    return { result: true };
}

// 记录下上次请求失败的Cookie中的AuthId, 
var RequestFailedForNoLoginAuthIdString = "";
var QueryCount = 0x0;
var plantCropId = '0001'; // 萝卜 0001 

// 自动执行函数
async function onAutoRun() {
    // 每隔五分钟才执行一次查询操作
    // if (QueryCount % 100 != 0x0) {
    //     return;
    // }

    // 添加计数
    QueryCount++;
    let url = 'https://c.m.suning.com/newFarm2020.html';

    // 确保打开了苏宁农庄
    var isOpen = await isUrlOpen(url);
    if (isOpen == false) {
        return;
    }

    // 获取指定界面的
    var CookieResult = await getCookieByDomain(url);
    // 获取Cookie失败
    if (CookieResult.ok == 0x0) {
        return;
    }

    // 判断是否有authId
    if (CookieResult.data.has('authId') == false) {
        return;
    }
    var authIdString = CookieResult.data.authId;
    if (authIdString == RequestFailedForNoLoginAuthIdString) {
        console.log("对比Authid认为登录已过期");
    }

    // 打开了苏宁的网页并且登录了，符合查询的条件了
    console.log("认为已经登录成功，且Cookie未过期");

    // 获取苏宁农场信息
    let getFarmHomeResponse = await getFarmHome();
    if (getFarmHomeResponse.code == 0x1) {
        console.log("获取土地情况网络通讯失败");
        return;
    } else if (getFarmHomeResponse.code == 0x2) {
        // 登录过期，刷新下界面，等下次查询
        if (getFarmHomeResponse.data.code == 0x2) {
            // 记录下失败的AuthId， 并刷新界面
            RequestFailedForNoLoginAuthIdString = authIdString;
            refreshTabByUrl(url);
        }
        onsole.log("网站返回请求失败");
        return;
    }

    // 输出信息
    let userFieldList = getFarmHomeResponse.data.result.userFieldList;
    for (var index = 0; index < userFieldList.length; index++) {
        var userField = userFieldList[index];
        var fieldNo = userField.fieldNo;
        // 土地处于种植状态
        if (userField.fieldStatus == 0x1) {
            console.log("当前土地处于种植状态。no=", fieldNo);

            // 判断成熟时间是否有效
            if (userField.cropRipeTime == undefined) {
                console.log("当前土地成熟时间为空。no=", fieldNo);
                continue;
            }

            // 判断当前土地是否已经成熟
            const curDate = Date.now();
            let cropRipeTimeDate = Date.parse(userField.cropRipeTime);
            if (curDate < cropRipeTimeDate) {
                console.log("当前土地未成熟。no=", fieldNo);
                console.log("curTime=", curDate.toString());
                console.log("cropRipeTime=", cropRipeTimeDate.toString());
                continue;
            }

            // 收获植物
            let response = await harvestCrops(userField.cropId, fieldNo);
            if (response.result == true) {
                console.log("收获成功。no=", fieldNo);
                console.log("cropId=", userField.cropId);
            } else {
                console.log("收获失败。no=", fieldNo);
                console.log('errMgs=', response.errMsg);
                refreshTabByUrl(url);
            }

            // 休息3秒
            await sleep(3000);
        }
        // 土地处于闲置状态
        else if (userField.fieldStatus == 0x0) {
            // 种植新植物
            console.log("当前土地处于荒芜状态。no=", fieldNo);
            let response = await plantCrops(plantCropId, fieldNo);
            if (response.result == true) {
                console.log("种植成功。no=", fieldNo);
                console.log("cropId=", plantCropId);
            } else {
                console.log("种植失败。no=", fieldNo);
                console.log('errMgs=', response.errMsg);
                refreshTabByUrl(url);
            }

            // 休息3秒
            await sleep(3000);
        }
    }

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