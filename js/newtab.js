function ShortCutItemClick(index){
    alert("itemclick"+index);
}

function ShortCutItemMouseEnter(index){
    var Item  = document.getElementById("ShortCut"+index);
    if(Item){
        Item.setAttribute("class", "common-page-item-select");
    }
    var Modify  = document.getElementById("ShortCutModify"+index);
    if(Modify){
        Modify.style.display="block";
    }
}

function ShortCutItemMouseLeave(index){
    var Item  = document.getElementById("ShortCut"+index);
    if(Item){
        Item.setAttribute("class", "common-page-item");
    }
    var Modify  = document.getElementById("ShortCutModify"+index);
    if(Modify){
        Modify.style.display="none";
    }
}

function ShortCutModifyClick(index){
    alert("ModifyClick"+index);
    // 阻止响应div的点击事件
    event.stopPropagation();
}



// 添加快捷方式Item
function AddShortCutItem(index, itemJson){
    var itemName = itemJson.name;
    var url = itemJson.url;
    // Item
    var divCommonPageItem = document.createElement("div");
    divCommonPageItem.setAttribute("class", "common-page-item");
    divCommonPageItem.setAttribute("id", "ShortCut"+index);
    // 点击事件
    divCommonPageItem.setAttribute("onclick", "ShortCutItemClick("+index+")");
    divCommonPageItem.setAttribute("onmouseenter", "ShortCutItemMouseEnter("+index+")");
    divCommonPageItem.setAttribute("onmouseleave", "ShortCutItemMouseLeave("+index+")");

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
    // 点击事件
    divCommonPageItemModify.setAttribute("onclick", "ShortCutModifyClick("+index+")");

    // 填充到Item的div中
    divCommonPageItem.appendChild(divCommonPageItemIcon);
    divCommonPageItem.appendChild(divCommonPageItemLabel);
    divCommonPageItem.appendChild(divCommonPageItemModify);

    // 添加到主页面上
    document.getElementById("common-pages").appendChild(divCommonPageItem);
}

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

// 或者bing的每日图片作为body的背景图片
async function setBodyBackgroundImage(){
    var getBingImageUrl = "http://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1";
    var response = await getResponse(getBingImageUrl);
    if(response.ok){
        console.log(response.data);
        if(response.data.images.length){
            let imageData = response.data.images[0].url;
            let backGroundImageUrl = "url(http://cn.bing.com"+imageData+")";
            document.body.style.backgroundImage = backGroundImageUrl;
        }
    }
}

function setFastItemList(){
    let fastItemString = "";
    fastItemString = localStorage.MyChromeHelper_FastItemList;
    let fastItemListJson = [];
    if(fastItemString == undefined){
        console.log("未找到本地设置的快捷项");
    }else{
        fastItemListJson = JSON.parse(fastItemString);
    }

    var jsonLength= 0x0;
    for(let fastItem in fastItemListJson)
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

// 界面加载事件
window.onload = function(){
    // 设置背景图片
    setBodyBackgroundImage();

    // 添加Item事件
    setFastItemList();

    AddShortCutItem(1, {"name":"测试", "url":"https://www.baidu.com/"});
}

