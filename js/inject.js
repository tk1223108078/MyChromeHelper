// 接收content发送来的消息
window.addEventListener("message", function(event) {
    var data = event.data;
    if(data && data.id == messgae_flag_key)
    {
        this.console.log(data.data);
    }
}, false);

window.onload = function(){
    // 获取当前页面标题和url
    var title = document.title;
    var url = window.location.href; /* 获取完整URL */  
    var host = window.location.host; /* 获取主机地址和端口号 */   
    window.postMessage({id:messgae_flag_key, data:{title:title, url:url}}, '*');
}