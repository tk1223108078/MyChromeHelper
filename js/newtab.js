// 鼠标移入
function itemmouseover(item){
    item.style.opacity = 0.5;
}

// 鼠标移出
function itemouseout(item){
    item.style.opacity = 1;
}

// 为Item设置各种事件
function AddItemtEvent(){
    var items = document.getElementsByClassName("common-page-item");
    for(let index in items){
        item = items[index];
        item.setAttribute('id', 'pageitem-' + index);
        var itembyid = document.getElementById('pageitem-' + index);
        itembyid.onmousemove = itemmouseover(itembyid);
        itembyid.onmouseout = itemouseout(itembyid);
    }
}

// 界面加载事件
window.onload = function(){
    // 添加Item事件
    AddItemtEvent();
}

