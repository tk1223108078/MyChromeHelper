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

// 获取本地存储内容
function GetLocalStorageValueString(key){
    if(window.localStorage){
        var value = window.localStorage.getItem(key);
        return value;
    }
    return null;
}