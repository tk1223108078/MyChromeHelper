// var EnableKey = "www.taosijie.com.chrometool.Enable";
// var UrlKey = "www.taosijie.com.chrometool.Url";
// var MaxPriceKey = "www.taosijie.com.chrometool.MaxPrice";
// var MaxNumberKey = "www.taosijie.com.chrometool.MaxNumber";

// // 开关界面变化
// function ChangeSwitchStatus(switchele){
//     var imgdiv = switchele.children[0];
//     var childstrong = switchele.children[1].children[0].children[0];
//     if(imgdiv && childstrong){
//         if(imgdiv.className == "switchitemimgsel"){
//             imgdiv.className = "switchitemimgnosel";
//             childstrong.innerText = "关闭";
//             return "close";
//         }else if(imgdiv.className == "switchitemimgnosel"){
//             imgdiv.className = "switchitemimgsel";
//             childstrong.innerText = "开启";
//             return "open";
//         }
//     }
//     return null;
// }

// // 获取本地存储值
// function GetLocalStorageValue(key){
//     if(window.localStorage){
//         var value = window.localStorage.getItem(key);
//         return value;
//     }
//     return null;
// }

// // 设置本地存储
// function SetLocalStorageValue(key, value){
//     if(window.localStorage){
//         var value = window.localStorage.setItem(key, value);
//     }
// }

// // 设置功能开关
// if(GetLocalStorageValue(EnableKey) == "open"){
//     ChangeSwitchStatus(EnableDiv);
// }
// PriceMaxInput.value = GetLocalStorageValue(MaxPriceKey);
// NumberMaxInput.value = GetLocalStorageValue(MaxNumberKey);
// UrlInput.value = GetLocalStorageValue(UrlKey);

// 界面点击事件以及初始化界面显示
// 页面统计开关
var EnableDiv = document.getElementById("enbale");
var PriceMaxInput = document.getElementById("maxprice");
var NumberMaxInput = document.getElementById("maxnumber");
var UrlInput = document.getElementById("autobuyurl");
EnableDiv.onclick = function(){
    // // 更新配置至本地存储
    // var EnableValue = ChangeSwitchStatus(EnableDiv);
    // SetLocalStorageValue(EnableKey, EnableValue);
    // var PriceMaxText = PriceMaxInput.value;
    // SetLocalStorageValue(MaxPriceKey, PriceMaxText);
    // var NumberMaxText = NumberMaxInput.value;
    // SetLocalStorageValue(MaxNumberKey, NumberMaxText);
    // var UrlText = UrlInput.value;
    // SetLocalStorageValue(UrlKey, UrlText);

    // // 功能开关
    // var EnableValue = false;
    // if(GetLocalStorageValueString(EnableKey) == "open"){
    //     EnableValue = true;
    // }
    // // 价格
    // var PriceValue = 0.0;
    // let PriceTemp = GetLocalStorageValueString(MaxPriceKey);
    // if(PriceTemp){
    //     PriceValue = parseFloat(PriceTemp);
    // }
    // // 数量
    // var NumberValue = 0;
    // let NumberTemp = GetLocalStorageValueString(MaxNumberKey);
    // if(NumberTemp){
    //     NumberValue = parseInt(NumberTemp);
    // }
    var PriceMaxText = PriceMaxInput.value;
    var PriceValue = parseFloat(PriceMaxText);
    var NumberMaxText = NumberMaxInput.value;
    var NumberValue = parseInt(NumberMaxText);
    var UrlText = UrlInput.value;
    // // 发送消息
    // chrome.extension.sendRequest(
    //     {url: UrlText, price: PriceValue, number:NumberValue},
    //     function(response) {
            
    //     }
    // );
    chrome.tabs.query({url: UrlText}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {url: UrlText, price: PriceValue, number:NumberValue}, function(response) {
            console.log(response);
        });
    });
}
