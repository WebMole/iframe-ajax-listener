/*
 * This is a usage example of the AjaxListener. In this example, we will capture
 * requests withing an iframe! :)
 */

var $ifr = $("#iframe");
var ifr = $ifr[0];
var counter = 0;

/**
 * basic callback to write captured data on page
 */
function callback() {
    $("#ajax-listener").append(
        "<li><span class='method'>" +
            this.method +
            "</span><a class='url' href='" + this.url + "'>" +
            this.url +
            "</a><pre class='data'><code>" +
            this.data + //@todo: escape html and display as code :)
            "</code></pre>"
    );
}

var ajaxSession = null;

$("#visit").click(function () {
    $('#iframeStatus').html('Loading').removeClass('ready');
    $ifr.attr('src', $("#url").val());
});

$ifr.load(function () {
    /*
     * We need to pass the target every time so we can listen to ajax on the iframe's XMLHttpRequest object
     *  since it's a new one on each page load (logically). We use the target to override open and send prototypes.
     *  To capture requests within the same page, simply use current window's XMLHttpRequest
     */
    var target = ifr.contentWindow.XMLHttpRequest;
    // First time loading
    if (ajaxSession === null)
    {
        ajaxSession = new AjaxListener(target, callback);
    }
    else
    {
        // update target
        ajaxSession.setTarget(target);
    }

    $('#iframeStatus').html('Ready').addClass('ready');
    $('#href').html(ifr.contentWindow.location.href);
    $('#href').attr("href", ifr.contentWindow.location.href);
    $('#host').html(ifr.contentWindow.location.host);
    $('#pathname').html(ifr.contentWindow.location.pathname);
    $('#protocol').html(ifr.contentWindow.location.protocol);
    $('#pagesLoaded').html(++counter);

    console.log("iFrame Loaded");
    console.log("Iframe's Window Object:");
    console.log(ifr.contentWindow);
    console.log("Iframe's Document:");
    console.log(ifr.contentDocument);
});