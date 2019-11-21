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
function AddShortCutItem(index){
    // Item
    var divCommonPageItem = document.createElement("div");
    divCommonPageItem.setAttribute("class", "common-page-item");
    divCommonPageItem.setAttribute("id", "ShortCut"+index);
    // 点击事件
    divCommonPageItem.setAttribute("onclick", "ShortCutItemClick("+index+")");
    divCommonPageItem.setAttribute("onmouseenter", "ShortCutItemMouseEnter("+index+")");
    divCommonPageItem.setAttribute("onmouseleave", "ShortCutItemMouseLeave("+index+")");

    // icon
    var divCommonPageItemIcon = document.createElement("div");
    divCommonPageItemIcon.setAttribute("class", "common-page-item-icon");
    var imgCommonPageItemIcon = document.createElement("img");
    imgCommonPageItemIcon.setAttribute("src", "../img/search.png");
    divCommonPageItemIcon.appendChild(imgCommonPageItemIcon);

    // label
    var divCommonPageItemLabel = document.createElement("div");
    divCommonPageItemLabel.setAttribute("class", "common-page-item-label");
    var spanCommonPageItemLabel = document.createElement("span");
    spanCommonPageItemLabel.textContent = "测试";
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
            console.log(imageData);
            let backGroundImageUrl = "url(http://cn.bing.com"+imageData+")";
            document.body.style.backgroundImage = backGroundImageUrl;
        }
    }
}

// 界面加载事件
window.onload = function(){
    // 设置背景图片
    setBodyBackgroundImage();

    // 添加Item事件
    for(var index = 0x0; index < 10; index++){
        AddShortCutItem(index);
    }

}

