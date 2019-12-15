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
function isUrl(str) {// 验证url
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
          '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}

// 获取本地存储内容
function GetLocalStorageValueString(key){
    if(window.localStorage){
        var value = window.localStorage.getItem(key);
        return value;
    }
    return null;
}

// 获取本地存储内容
function SetLocalStorageValueString(key, value){
    if(window.localStorage){
        window.localStorage.setItem(key, value);
    }
}

// map转换为对象
function MapToObj(map){
    let obj= Object.create(null);
    for (let[k,v] of map) {
      obj[k] = v;
    }
    return obj;
}

// map转换为json字符串
function MapToJsonStr(map) {
    return JSON.stringify(this.MapToObj(map));
}

// 对象转换为map
function ObjToMap(obj){
    let map = new Map();
    for (let k of Object.keys(obj)) {
        map.set(k,obj[k]);
    }
    return map;
}

// json字符串转换为map
function JsonStrToMap(jsonStr){
    return this.ObjToMap(JSON.parse(jsonStr));
}