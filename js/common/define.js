var messgae_flag_key = "www.taosijie.com/mychromehelper"
var localstorage_fastitemlist_key = "www.taosijie.com/mychromehelper/fastitemlist"
var localstorage_historypagelist_key = "www.taosijie.com/mychromehelper/historypagelist"
// chrome的localstorage的存储大小约为5M，因此只记录1000条历史记录，应该没什么问题
var historypagelist_maxsize = 1000;
var historypagelist_clearsize = historypagelist_maxsize/10;