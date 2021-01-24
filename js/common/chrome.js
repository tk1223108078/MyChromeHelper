// 获取当前选项卡ID
function getCurrentTabId(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (callback) callback(tabs.length ? tabs[0].id : null);
    });
}

// 当前标签打开某个链接
function openUrlCurrentTab(url) {
    getCurrentTabId(tabId => {
        chrome.tabs.update(tabId, { url: url });
    })
}

// 新标签打开某个链接
function openUrlNewTab(url) {
    chrome.tabs.create({
        'url': url
    });
}

// 注入JS文件至页面中
function InjectJsFile(jspath) {
    var s = document.createElement('script');
    s.src = chrome.extension.getURL(jspath);
    s.onload = function() {
        this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(s);
}

var isUrlOpen = async function(url) {
    var result = false;
    let promise = new Promise((resolve, reject) => {
        chrome.tabs.query({}, tabs => {
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].url.search(url) != -1) {
                    result = true;
                    resolve(result);
                }
            }
        });
    })

    try {
        let promiseResult = await promise;
        result = promiseResult;
    } catch (error) {}
    return result;
}

var refreshTabByUrl = async function(url) {
    var result = false;
    let promise = new Promise((resolve, reject) => {
        chrome.tabs.query({}, tabs => {
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].url.search(url) != -1) {
                    chrome.tabs.reload(tabs[i].id);
                    result = true;
                    resolve(result);
                }
            }
        });
    })

    try {
        let promiseResult = await promise;
        result = promiseResult;
    } catch (error) {}
    return result;
}