var ifr = $("#iframe")[0];
defaultData = "html=<b>Hello!</b>&amp;delay=1"
$("#data").attr("placeholder", defaultData);

initAjaxListener();

$("#call").click(ajaxCall);

function ajaxCall()
{
    var method = $("#method").val();
    var library = $("#library").val();

    var data;

    if ($("#data").val() !== "")
        data = $("#data").val();
    else
        data = defaultData;

    if (library === "js")
    {
        vanillaAjaxCall(method, data);
    }
    else if (library === "jquery")
    {
        jqueryAjaxCall(method, data);
    }
}



function initAjaxListener() {
    var s_ajaxListener = new Object();
    s_ajaxListener.tempOpen = ifr.contentWindow.XMLHttpRequest.prototype.open;
    s_ajaxListener.tempSend = ifr.contentWindow.XMLHttpRequest.prototype.send;

    s_ajaxListener.callback = function() {
        // this.method  --> the ajax method used
        // this.url     --> the url of the requested script (including query string, if any). (urlencoded)
        // this.data --> the data sent, if any. (urlencoded)

        $("#ajax-listener").append(

            "<li><span class='method'>"
                + this.method +
                "</span><a class='url' href='" + this.url + "'>"
                + this.url
                + "</a><pre class='data'><code>"
                + this.data //@todo: escape html and display as code :)
                + "</code></pre>"
        );
    }


    function superCallback(callback) {
        var sendTime = new Date().getTime();

        // State changed inside this function
        return function() {
            var startTime = new Date().getTime();
            if (callback != undefined)
                callback();
            var endTime = new Date().getTime();
            console.log("AJAXListener :: State #" + this.readyState + " - Callback Time: " + (endTime - startTime) + "ms - Ellapsed Time (After Callback): " + (startTime - sendTime) + "ms");
            if (this.readyState == 4)
                console.log(this);
        }
    }

    ifr.contentWindow.XMLHttpRequest.prototype.open = function (method, url) {
        if (!method)
            var method = '';
        if (!url)
            var url = '';

        this.onreadystatechange = superCallback(this.onreadystatechange);

        s_ajaxListener.tempOpen.apply(this, arguments);
        s_ajaxListener.method = method;
        s_ajaxListener.url = url;

        if (method.toLowerCase() == "get") {
            s_ajaxListener.data = url.split('?');
            s_ajaxListener.data = s_ajaxListener.data[1];
        }
    }

    ifr.contentWindow.XMLHttpRequest.prototype.send = function (method, url) {
        if (!method)
            var method = '';
        if (!url)
            var url = '';

        this.onreadystatechange = superCallback(this.onreadystatechange);

        s_ajaxListener.tempSend.apply(this, arguments);
        if (s_ajaxListener.method.toLowerCase() == "post")
            s_ajaxListener.data = method;
        s_ajaxListener.callback();
    }
}
