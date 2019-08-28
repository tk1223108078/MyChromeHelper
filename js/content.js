var HasPostMessage = false;

// 注入函数至正常页面中
function InjectJsFile(){
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('js/inject.js');
    s.onload = function() {
        this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(s);
}

InjectJsFile();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(HasPostMessage){

        }else{
            window.postMessage({price: request.price, number: request.number}, '*');
            HasPostMessage = true;
        }
    }
);
