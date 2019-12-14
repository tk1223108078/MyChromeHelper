// 接收content发送来的消息
window.addEventListener("message", function(event) {
    var data = event.data;
    if(data && data.id == messgae_flag_key)
    {
        this.console.log(data.data);
    }
}, false);

window.postMessage({id:messgae_flag_key, data:"inject发送消息到content测试"}, '*');