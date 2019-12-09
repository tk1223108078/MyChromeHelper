/*
 * 全局变量
 */
// 修改对话框
// 页面元素
var modifyDialog = null;
var modifyDialogNameInput = null;
var modifyDialogUrlInput = null;
var searchInput = null;

// 参数
var bingDataUrl = "";
var bingUrl = "";
var fastItemList = [];
var searchJson = {baidu:0, google:0};
var timeId = null;

/*
 * 辅助函数：通用
 */
// 通用辅助函数
// 获取网络请求信息
var getResponse = async function(url) {
    let ok = 0;
    let data = "";
    try{
        let response = await fetch(url, {
            headers:{
                'Set-Cookie': 'HttpOnly;Secure;SameSite=Strict'
              }
        });
        if(response.ok && response.status == 200){
            // 标记通讯成功，并且设置返回值
            ok = 1;
            data = await response.json();
        }else{
            data = "网络请求失败，ok="+response.ok+", status="+response.status;
        }
    }catch(error){
        data = "发生异常, error="+error;
    }
    // 返回值
    return {"ok":ok, "data":data};
}

// 设置元素显示还是隐藏
function elementsSetDisplay(item, show){
    if(item){
        if(show == true){
            item.style.display="block"
        }else{
            item.style.display="none"
        }
    }else{
        console.error("[elementsSetDisplay] 需要设置的元素无效");
    }
}

// 为元素设置响应事件
function elementsSetEventFunction(item, eventName, fucntion){
    if(item){
        item.addEventListener(eventName, fucntion);
    }else{
        console.error("[elementsSetEventFunction] 需要设置的元素无效");
    }
}

// 判断输入是否是URL
function isUrl(str_url) {// 验证url
    var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
    + "?(([0-9a-zA-Z_!~*'().&=+$%-]+: )?[0-9a-zA-Z_!~*'().&=+$%-]+@)?" // ftp的user@
    + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
    + "|" // 允许IP和DOMAIN（域名）
    + "([0-9a-zA-Z_!~*'()-]+\.)*" // 域名- www.
    + "([0-9a-zA-Z][0-9a-zA-Z-]{0,61})?[0-9a-zA-Z]\." // 二级域名
    + "[a-zA-Z]{2,6})" // first level domain- .com or .museum
    + "(:[0-9]{1,4})?" // 端口- :80
    + "((/?)|" // a slash isn't required if there is no file name
    + "(/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+/?)$";
    var re = new RegExp(strRegex);
    return re.test(str_url);
}

// 判断地址是否可用

/*
 * 辅助函数：Chrome插件相关辅助函数
 */
// 获取当前选项卡ID
function getCurrentTabId(callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        if(callback) callback(tabs.length ? tabs[0].id: null);
    });
}

// 当前标签打开某个链接
function openUrlCurrentTab(url)
{
    getCurrentTabId(tabId => {
        chrome.tabs.update(tabId, {url: url});
    })
}

// 新标签打开某个链接
function openUrlNewTab(url){
    chrome.tabs.create({
        'url': url
    });
}

/*
 * 辅助函数：页面辅助函数
 */
// 快捷项添加
function AddShortCutItem(index, itemJson){
    var itemName = itemJson.name;
    var url = itemJson.url;
    // Item
    var divCommonPageItem = document.createElement("div");
    divCommonPageItem.setAttribute("class", "common-page-item");
    divCommonPageItem.setAttribute("id", "ShortCut"+index);
    elementsSetEventFunction(divCommonPageItem, "click", ShortCutItemClick);
    elementsSetEventFunction(divCommonPageItem, "mouseenter", ShortCutItemMouseEnter);
    elementsSetEventFunction(divCommonPageItem, "mouseleave", ShortCutItemMouseLeave);

    // icon
    var domainReg = /(.+?:\/\/.+?)\//i;
    var iconUrl = url.match(domainReg)[1] + '/favicon.ico';
    var divCommonPageItemIcon = document.createElement("div");
    divCommonPageItemIcon.setAttribute("class", "common-page-item-icon");
    var imgCommonPageItemIcon = document.createElement("img");
    imgCommonPageItemIcon.setAttribute("src", iconUrl);
    divCommonPageItemIcon.appendChild(imgCommonPageItemIcon);

    // label
    var divCommonPageItemLabel = document.createElement("div");
    divCommonPageItemLabel.setAttribute("class", "common-page-item-label");
    var spanCommonPageItemLabel = document.createElement("span");
    spanCommonPageItemLabel.textContent = itemName;
    divCommonPageItemLabel.appendChild(spanCommonPageItemLabel);

    // modify
    var divCommonPageItemModify = document.createElement("div");
    divCommonPageItemModify.setAttribute("class", "common-page-item-modify");
    divCommonPageItemModify.setAttribute("title", "修改快捷方式");
    divCommonPageItemModify.setAttribute("aria-label", "修改快捷方式");
    divCommonPageItemModify.setAttribute("id", "ShortCutModify"+index);
    elementsSetEventFunction(divCommonPageItemModify, "click", ShortCutModifyClick);

    // 填充到Item的div中
    divCommonPageItem.appendChild(divCommonPageItemIcon);
    divCommonPageItem.appendChild(divCommonPageItemLabel);
    divCommonPageItem.appendChild(divCommonPageItemModify);

    // 添加到主页面上
    document.getElementById("common-pages").appendChild(divCommonPageItem);
}

// 显示快捷项修改界面
function showModifyDialog(title, url){
    elementsSetDisplay(modifyDialog, true);
    if(modifyDialogNameInput){
        modifyDialogNameInput.value = title;
    }
    if(modifyDialogUrlInput){
        modifyDialogUrlInput.value = url;
        modifyDialogUrlInput.focus();
    }
}

// 隐藏快捷项修改界面
function hideModifyDialog(){
    elementsSetDisplay(modifyDialog, false);
}

// 搜索引擎测试
async function searchTest(){
    var baiduUrl = "https://www.baidu.com";
    var response = await getResponse(baiduUrl);
    if(response.ok == 0){
        searchJson.baidu = 0;
    }else{
        searchJson.baidu = 1;
    }
    var googleUrl = "https://www.google.com";
    var response = await getResponse(googleUrl);
    if(response.ok == 0){
        searchJson.google = 0;
    }else{
        searchJson.google = 1;
    }
}

/*
 * 响应事件函数
 */
// 快捷项点击事件
function ShortCutItemClick(param){
    //alert("itemclick"+index);
}

// 快捷项鼠标移入
function ShortCutItemMouseEnter(param){
    var Item  = param.target;
    if(Item){
        Item.setAttribute("class", "common-page-item-select");
    }
    var modifyBtn  = Item.children[2];
    elementsSetDisplay(modifyBtn, true);
}

// 快捷项鼠标移出
function ShortCutItemMouseLeave(param){
    var Item  = param.target;
    if(Item){
        Item.setAttribute("class", "common-page-item");
    }
    var modifyBtn  = Item.children[2];
    elementsSetDisplay(modifyBtn, false);
}

// 快捷项修改按钮点击
function ShortCutModifyClick(param){
    // 阻止响应div的点击事件
    event.stopPropagation();
    // 显示修改对话框
    showModifyDialog("百度", "https://www.baidu.com");
}

// 对话框删除事件
function onClickDelete(){
    hideModifyDialog();
}

// 对话框取消事件
function onClickCancel(){
    hideModifyDialog();
}

// 对话框提交事件
function onClickSubmit(){
    hideModifyDialog()
}

// 搜索对话框键盘点击事件
function onSearchInputKeyDown(event){
    // 处理enter事件
    if(event.keyCode == 13)
    {
        var inputValue = searchInput.value;
        var newUrl;
        var netErr = false;
        // 处理URL
        if(isUrl(inputValue)){
            // 保证是网址
            if(inputValue.indexOf("http://") != 0 && inputValue.indexOf("https://") != 0){
                newUrl = "https://"+ inputValue;
            }
        }else{
            if(searchJson.google == 1){
                newUrl = "https://www.google.com/search?q="+inputValue;
            }else if(searchJson.baidu == 1){
                newUrl = "https://www.baidu.com/s?wd="+inputValue;
            }else{
                netErr = true;
            }
        }
        // 没有网络错误时，打开新的页面
        if(netErr == false){
            openUrlCurrentTab(encodeURI(newUrl));
        }else{
            
        }
    }
}

/*
 * 初始化函数
 */
// 数据初始化
function initData(){
    modifyDialog = document.getElementById("dialog-allscreen");
    bingDataUrl = "http://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1";
    bingUrl = "http://cn.bing.com";
}

// 初始化背景图片
// 获取bing的每日图片作为body的背景图片
async function initBodyBackup(){
    var response = await getResponse(bingDataUrl);
    if(response.ok){
        console.log(response.data);
        if(response.data.images.length){
            let imageData = response.data.images[0].url;
            let backGroundImageUrl = "url("+bingUrl+imageData+")";
            document.body.style.backgroundImage = backGroundImageUrl;
        }
    }
}

// 初始化搜索
function initSearch(){
    // 添加搜索输入框的事件
    searchInput = document.getElementById("search-box-input");
    elementsSetEventFunction(searchInput, "keydown", onSearchInputKeyDown);
    searchInput.focus();

    // 启动时就进行可用性测试
    searchTest();

    // 每隔5秒进行测试
    timeId = setInterval(async function() {
        searchTest();
    }, 1000*5);
}

// 初始化快捷项列表
function initFastItemList(){
    let fastItemString = "";
    fastItemString = localStorage.MyChromeHelper_FastItemList;
    if(fastItemString == undefined){
        console.log("未找到本地设置的快捷项");
    }else{
        fastItemList = JSON.parse(fastItemString);
    }

    var jsonLength= 0x0;
    for(let fastItem in fastItemList)
    {
        jsonLength++;
        AddShortCutItem(jsonLength, fastItem);

        // 最多显示10个快捷项
        if(jsonLength == 10){
            break;
        }
    }

    // 当快捷项小于10个时，添加一个用于添加快捷项的项
    if(jsonLength.length < 10){

    }
}

// 初始化对话框
function initDialog(){
    // 对话框按钮事件添加
    var deleteBtn = document.getElementById("delete");
    deleteBtn.addEventListener("click", onClickDelete);
    var cancelBtn = document.getElementById("cancel");
    cancelBtn.addEventListener("click", onClickCancel);
    var submitBtn = document.getElementById("submit");
    submitBtn.addEventListener("click", onClickSubmit);

    modifyDialogNameInput = document.getElementById("title-field");
    modifyDialogUrlInput = document.getElementById("url-field");
}

// 界面加载事件
window.onload = function(){
    // 数据初始化
    initData();
    // 背景
    initBodyBackup();
    // 搜索模块
    initSearch();
    // 快捷项列表
    initFastItemList();
    // 初始化对话框
    initDialog();
    
    // 测试代码
    AddShortCutItem(1, {"name":"测试", "url":"https://www.baidu.com/"});   
}

