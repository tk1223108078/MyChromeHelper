/*
 * Key值定义
 */
var define_fastitemlist_key = "www.taosijie.com.fastitemlist"

/*
 * 全局变量
 */
// 修改对话框
// 页面元素
var modifyDialog = null;
var modifyDialogNameInput = null;
var modifyDialogUrlInput = null;
var invalidUrlLabel = null;
var searchInput = null;
var searchSuggest = null;
var searchSuggestResult = null;

// 参数
var bingDataUrl = "";
var bingUrl = "";
var fastItemList = [];
var searchJson = {baidu:0, google:0};
var timeId = null;
var curFastItem = -1;

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
    divCommonPageItem.setAttribute("id", "fastitem"+index);
    elementsSetEventFunction(divCommonPageItem, "click", function(){
        ShortCutItemClick(index);
    });
    elementsSetEventFunction(divCommonPageItem, "mouseenter", ShortCutItemMouseEnter);
    elementsSetEventFunction(divCommonPageItem, "mouseleave", ShortCutItemMouseLeave);

    // icon
    var domainReg = /(.+?:\/\/.+?)\//i;
    if(index == -1){
        var iconUrl = "../img/itemadd.png";
    }else{
        var domain = url.match(domainReg)
        if(isUrl(url) && domain != null && domain.length >= 2){
            var iconUrl = domain[1] + '/favicon.ico';
        }else{
            var iconUrl = "../img/item.png";
        }
    }
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
    elementsSetEventFunction(divCommonPageItemModify, "click", function(){
        ShortCutModifyClick(index);
    });

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

// 刷新快捷列表
function UpdateFastItemList(){
    // 清空原有项
    for(var index = 0; ; index++)
    {
        var itemId = "fastitem"+index;
        var item = document.getElementById(itemId);
        if(item){
            var parentItem = item.parentNode;//获取div的父对象
            parentItem.removeChild(item);//通过div的父对象把它删除
        }else{
            break;
        }
    }
    // 删除可能存在的添加项
    var item = document.getElementById("fastitem-1");
    if(item){
        var parentItem = item.parentNode;//获取div的父对象
        parentItem.removeChild(item);//通过div的父对象把它删除
    }

    var needAddItem = true;
    // 添加新数据
    for(let index in fastItemList)
    {
        AddShortCutItem(index, fastItemList[index]);

        // 最多显示10个快捷项
        if(index == 9){
            needAddItem = false;    // 标记不需要添加项
            break;
        }
    }

    if(needAddItem){
        AddShortCutItem(-1, {"name":"添加", "url":""});
    }
}

function SaveFastItemDataToLocalStorage(){
    SetLocalStorageValueString(define_fastitemlist_key, JSON.stringify(fastItemList));
}

/*
 * 响应事件函数
 */
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

// 快捷项点击事件
function ShortCutItemClick(index){
    curFastItem = index;
    if(index != -1){
        var itemInfo = fastItemList[index];
        openUrlCurrentTab(encodeURI(itemInfo.url));
    }else{
        showModifyDialog("", "https://");
    }
}

// 快捷项修改按钮点击
function ShortCutModifyClick(index){
    // 阻止响应div的点击事件
    event.stopPropagation();
    curFastItem = index;
    if(index != -1){
        var item = fastItemList[index];
        showModifyDialog(item.name, item.url);
    }
}

// 对话框删除事件
function onClickDelete(){
    // 新的快捷项
    if(curFastItem == -1){

    }
    // 现有的快捷项
    else{
        // 删除数据
        fastItemList.splice(curFastItem, 1);
    }
    // 刷新界面
    UpdateFastItemList();
    SaveFastItemDataToLocalStorage();
    // 隐藏对话框
    hideModifyDialog();
}

// 对话框取消事件
function onClickCancel(){
    // 隐藏对话框
    hideModifyDialog();
}

// 对话框提交事件
function onClickSubmit(){
    // 格式化字符串
    var url = modifyDialogUrlInput.value;
    // 确保以/结尾
    if(!url.endsWith("/")){
        url += "/"
    }

    var item = {"name":modifyDialogNameInput.value, "url":url};
    // 新的快捷项
    if(curFastItem == -1){
        fastItemList[fastItemList.length] = item;
    }
    // 现有的快捷项
    else{
        // 数据中删除该项
        fastItemList[curFastItem] = item;
    }
    // 刷新界面
    UpdateFastItemList();
    SaveFastItemDataToLocalStorage();
    // 隐藏对话框
    hideModifyDialog()
}

// 搜索对话框键盘点击事件
async function onSearchInputKeyDown(event){
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
                // 测试https连通性
                var response = await getResponse(newUrl);
                if(response.ok == 0){
                    // 测试http连通性
                    newUrl = "http://"+ inputValue;
                }
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

// 搜索对话框键盘松开事件
function onSearchInputKeyUp(event){
    console.log(this.value);
    // 输入不为空时给出建议
    if(this.value.length != 0){
        // 设置建议值
         // 动态创建li标签
         var liObj = document.createElement("li");
         liObj.value = "121312";
         searchSuggestResult.appendChild(liObj);
        // 显示建议框
        elementsSetDisplay(searchSuggest, true);
    }
}

// 输入框失去焦点
function onSearchInputBlur(event){
    // 输入框失去焦点直接隐藏建议框
    //elementsSetDisplay(searchSuggest, false);
}

// 输入框变化事件
function onSearchInputChange(event){
   
}

/*
 * 初始化函数
 */
// 数据初始化
function initData(){
    modifyDialog = document.getElementById("dialog-allscreen");
    invalidUrlLabel = document.getElementById("invalid-url-label");
    bingDataUrl = "http://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1";
    bingUrl = "http://cn.bing.com";

    // 从本地存储中获取快捷项列表
    var fastitemlistString = GetLocalStorageValueString(define_fastitemlist_key);
    if(fastitemlistString != null){
        console.log(fastitemlistString);
        fastItemList = JSON.parse(fastitemlistString);
    }
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
    elementsSetEventFunction(searchInput, "keyup", onSearchInputKeyUp);
    elementsSetEventFunction(searchInput, "blur", onSearchInputBlur);
    elementsSetEventFunction(searchInput, "change", onSearchInputChange);
    searchInput.focus();
    // 搜索建议框
    searchSuggest = document.getElementById("search-suggest");
    searchSuggestResult = document.getElementById("search-suggest-result");
    // 启动时就进行可用性测试
    searchTest();

    // 每隔5秒进行测试
    timeId = setInterval(async function() {
        searchTest();
    }, 1000*10);
}

// 初始化快捷项列表
function initFastItemList(){
    UpdateFastItemList();
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
}

