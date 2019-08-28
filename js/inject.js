var g_timer;                    // 定时器
var g_FunctionEnable = false;   // 功能开关
var g_PriceMax = 0.0;           // 最大买入价格
var g_MaxNumber = 0x0;          // 最大买入个数
// var g_FunctionEnable = true;    // 功能开关
// var g_PriceMax = 0.08;           // 最大买入价格
// var g_BuyMaxNum = 5;          // 最大买入个数
var g_StopBuy = false;          // 是否停止购买
var g_CurBuyNum = 0x0;          // 现在买入的个数
var g_HasStartBuy = false;          // 当前页面是否已经开始购买了
var g_PageCheckComplete = false;    // 当前页面是否已经购买结束了
var g_PreComplePageNum = 0x0;       // 上次完成的页面号
var g_CurPageBuyList= [];           // 当前页面需要购买的物品列表

// 完成当前页面购买
function PageAutoBuy(){
    var ResultRow = document.getElementById("searchResultsRows");
    if(!ResultRow){
        console.log("结果列表元素无效");
        g_PageCheckComplete = true;
        return;
    }
    var PriceSpanList = ResultRow.getElementsByClassName("market_listing_price market_listing_price_with_fee");
    if(!PriceSpanList || PriceSpanList.length == 0x0){    
        g_PageCheckComplete = true;
        console.log("价格列表获取失败");
        return;
    }

    if(!g_rgAssets){
        console.log("商品信息数据无效");
        g_PageCheckComplete = true;
        return;
    }

    g_HasStartBuy = true;
    // 第一层
    for(var FirstFloorKey in g_rgAssets)
    {
        console.log("第一层Key="+FirstFloorKey);
        var FirstFloorJsonItem = g_rgAssets[FirstFloorKey];
        // 第二层
        for(var SecondFloorKey in FirstFloorJsonItem)
        {
            console.log("第二层Key="+SecondFloorKey);
            var SecondFloorJsonItem = FirstFloorJsonItem[SecondFloorKey];
            var GoodsItemIndex = -1;
            // 这一层是所有物品的信息
            for(var GoodsID in SecondFloorJsonItem)
            {
                GoodsItemIndex++;
                console.log("物品ID="+GoodsID+".Index="+GoodsItemIndex);
                var NeedBuy = true;
                var GoodsItem =  SecondFloorJsonItem[GoodsID];
                // 获取描述数据，json数组
                var GoodsDescriptionsList = GoodsItem["descriptions"];
                for(var Index = 0x0; Index < GoodsDescriptionsList.length; Index++)
                {
                    var DescriptionValue = GoodsDescriptionsList[Index]["value"];
                    // 需要解锁，标记不需要购买退出循环
                    if(DescriptionValue.indexOf("（需要解锁）") != -1){
                        NeedBuy = false;
                        break;
                    }
                }
                
                // 判断是否需要购买
                if(!NeedBuy){
                    console.log("不购买");
                    continue;
                }

                // 走到这里需要购买
                console.log("购买");
                var PriceDiv = PriceSpanList[GoodsItemIndex];
                if(!PriceDiv){
                    console.log("价格元素无效");
                    continue;
                }

                // 获取价格
                var PriceText = PriceDiv.innerText;
                var PriceNum= PriceText.replace(/[^0-9.]/ig,"");
                console.log("商品价格：" + PriceNum);

                // 判断价格
                if(PriceNum > g_PriceMax){
                    console.log("价格高于买入价格放弃买入");
                    // 标记需要停止购买
                    g_StopBuy = true;
                    continue;
                }
                
                // 插入到数组中
                g_CurPageBuyList.push(GoodsItemIndex);
            }
        }
    }
    // 标记当前页面已经检查完毕
    g_PageCheckComplete = true;
}

function Buy(){
    // 获取对话框元素
    var BuyDialog = document.getElementById("market_buynow_dialog");
    var ResultRow = document.getElementById("searchResultsRows");

    if(!BuyDialog || !ResultRow){
        console.log("购买对话框或者结果列表元素无效");
        return;
    }

    // 获取对话框中的几个元素
    // 条款复选框
    var ClauseCheckBox = document.getElementById("market_buynow_dialog_accept_ssa");
    // 关闭按钮
    var CloseBtn = document.getElementById("market_buynow_dialog_cancel_close");
    // 购买按钮
    var BuyBtn = document.getElementById("market_buynow_dialog_purchase");

    // 已经点开了购买对话框
    if(BuyDialog.style.display != "none")
    {
        // 关闭按钮有效
        if(CloseBtn.style.display != "none")
        {
            g_CurPageBuyList.pop();
            g_CurBuyNum++;
            // 点击关闭按钮
            CloseBtn.click();
            console.log("购买成功，关闭对话框.当前购买数量：" + g_CurBuyNum);

            // 判断已经买入的数量
            if(g_CurBuyNum > g_MaxNumber){
                console.log("购买数量已经足够放弃买入，且标记停止购买");
                // 标记需要停止购买
                g_StopBuy = true;
                return;
            }
        }
        else
        {
            // 购买按钮有效
            if(BuyBtn.style.display != "none")
            {
                // 点击购买按钮
                BuyBtn.click();
                console.log("点击购买按钮");

                // 查看是否有错误提示框
                var ErrDialogDiv = document.getElementById("market_buynow_dialog_error");
                if(ErrDialogDiv.style.display != "none")
                {
                    // 未点击同意条款
                    var ErrSpan = document.getElementById("market_buynow_dialog_error_text");
                    if(ErrSpan.innerText == "您必须同意《Steam 订户协议》中的条款才能完成本次交易。")
                    {
                        // 点击同意复选框
                        ClauseCheckBox.click();
                        // 再点击一次购买按钮
                        BuyBtn.click();
                        console.log("点击同意条款并再次点击购买");
                    }
                    else
                    {
                        var CancleBtn = document.getElementById("market_buynow_dialog_cancel");
                        CancleBtn.click();
                        // 从待购买列表中删除
                        g_CurPageBuyList.pop();
                        // 还有可能购买失败的情况，可能被别人购买了
                        console.log("出现了其他错误，取消购买该物品");
                    }
                }
                else
                {
                    console.log("错误对话框暂时没有显示");
                }
            }
            // 购买按钮无效
            else
            {
                var ThrobberDiv = document.getElementById("market_buynow_dialog_purchase_throbber");
                // 正在处理
                if(ThrobberDiv.style.display != "none")
                {
                    console.log("正在购买中");
                }
                else
                {
                    console.log("未知情况");
                }
            }
        }
    }
    else
    {
        console.log("没有购买对话框，且当前页面有其他物品需要购买");
        var GoodsIndex = g_CurPageBuyList[g_CurPageBuyList.length - 1];
        var GoodsListBuyBtnList = ResultRow.getElementsByClassName("market_listing_buy_button");
        if(!GoodsListBuyBtnList || GoodsIndex >= GoodsListBuyBtnList.length){
            console.log("物品列表购买按钮无效");
            return;
        }
        // 点击购买按钮
        GoodsListBuyBtnList[GoodsIndex].children[0].click();
        console.log("购买第"+GoodsIndex+"号物品");
    }
}

// 主函数
function AutoBuyMain(){
    // 功能开关是否开启
    if(g_FunctionEnable == false){
        console.log("功能尚未开启");
        return;
    }
    if(g_StopBuy == true){
        console.log("购买结束");
        alert("购买结束");
        return;
    }

    // 购买列表不为空说明还需要继续购买
    if(g_CurPageBuyList.length != 0){
        console.log("购买对话框有效，开始购买物品");
        Buy();
        return;
    }

    // 下一页按钮
    var NextPageBtn = document.getElementById("searchResults_btn_next");
    // 当前页面信息
    var CurPageSpanList = document.getElementsByClassName("market_paging_pagelink active");
    // 元素检查
    if(!CurPageSpanList || !NextPageBtn){
        g_StopBuy = true;
        console.log("必要元素信息获取失败");
        alert("必要元素信息获取失败,请确认是需要自动扫货的网页");
        return;
    }
    // 获取当前页数
    var CurPageText = CurPageSpanList[0].innerText;
    var CurPageNum= CurPageText.replace(/[^0-9.]/ig,"");

    if(g_PageCheckComplete){
        if(NextPageBtn.className == "pagebtn disabled"){
            console.log("所有页面都已经购买过了");
        }else{
            console.log("当前"+CurPageNum+"页，购买结束，点击下一页");
            g_PreComplePageNum = CurPageNum;
            // 点击下一页
            NextPageBtn.click();
            g_HasStartBuy = false;
            g_PageCheckComplete = false;
        }
    }else{
        if(g_HasStartBuy){
            console.log("当前"+CurPageNum+"页，开始遍历购买但是没有购买结束");
        }else{
            if(g_PreComplePageNum == CurPageNum){
                console.log("当前页面和上次完成页面号码一样.可能是请求过多，获取下一页信息请求被拒绝");
                // 点击下一页
                NextPageBtn.click();
                g_HasStartBuy = false;
                g_PageCheckComplete = false;
            }else{
                console.log("当前"+CurPageNum+"页，开始查看是否需要购买物品");
                PageAutoBuy();
            }
        }
    }
}

function AutoBuySet(Enable, MaxPrice, MaxNumber){
    // 功能开始起效
    if(Enable == true && g_FunctionEnable == false)
    {
        g_FunctionEnable = Enable;
        g_PriceMax = MaxPrice;
        g_MaxNumber = MaxNumber;
        if(g_timer == null){
            alert("确认开启自动购买的功能吗？ \n 最大价格:"+g_PriceMax+";最大数量："+g_MaxNumber+" \n 如需终止功能请直接关闭页面");
            // 开启功能
            g_timer = window.setInterval(AutoBuyMain, 3000/*3秒钟检查一次界面*/);
            console.log("开启功能");
        }
    }
    else if(Enable == false && g_FunctionEnable == true)
    {
        g_FunctionEnable = Enable;
        g_PriceMax = MaxPrice;
        g_MaxNumber = MaxNumber;
        if(g_timer){
            // 关闭功能
            clearInterval(g_timer);
            g_timer = null;
            console.log("关闭功能");
        }
    }else{
        if(MaxPrice != g_PriceMax){
            g_PriceMax = MaxPrice;
            console.log("更新价格");
        }
        if(MaxNumber != g_MaxNumber){
            g_MaxNumber = MaxNumber;
            console.log("更新数量");
        }
    }
}

//AutoBuyMain();
window.addEventListener("message", function(event) {
    console.log("autobuy.js 价格："+event.data.price+"; 数量："+event.data.number+";");
    if(!(event.data.price == null || event.data.price == undefined) && !(event.data.number == null || event.data.number == undefined)){
        AutoBuySet(true, event.data.price, event.data.number);
    }
}, false);