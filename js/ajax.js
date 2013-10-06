/**
 * Simple Ajax methods
 *
 * Note about parameters
 * CONNECT, TRACE, or TRACK aren't used with AJAX
 *  More info here: http://www.w3.org/TR/XMLHttpRequest/#the-open()-method
 */

$(function() {
    var defaultData = "html=<b>Hello!</b>&amp;delay=1";
    $("#data").attr("placeholder", defaultData);

    $('#customCall').on('click', customAjaxRequest);

    /**
     * Determine what to do
     */
    function customAjaxRequest()
    {
        var method = $("#method").val();
        var library = $("#library").val();
        var useSend = $("#useSend").prop("checked");
        var useOpen = $("#useOpen").prop("checked");

        var data = null;

        if ($("#data").val() !== "")
        {
            data = $("#data").val();
        }
        else
        {
            data = defaultData;
        }

        if (library === "vanilla")
        {
            vanillaAjaxCall(method, data, useSend, useOpen);
        }
        else if (library === "jquery")
        {
            jqueryAjaxCall(method, data, useSend, useOpen);
        }
    }

    /**
     * Pure Javascript ajax Call
     * @param methodType {string} The method of the request. Available parameters:
     *  "OPTIONS", "GET", "HEAD", "POST", "PUT", "DELETE"
     * @param dataToSend {string} Data send using send method
     * @param useSend {boolean} whether to send data or not
     * @param useOpen {boolean} whether to execute the open method
     */
    function vanillaAjaxCall(methodType, dataToSend, useSend, useOpen) {
        function getXMLHttpRequest() {
            if (window.XMLHttpRequest) {
                return new window.XMLHttpRequest;
            } else {
                try {
                    return new ActiveXObject("MSXML2.XMLHTTP");
                } catch (ex) {
                    return null;
                }
            }
        }

        /**
         * function executed on onReadyStateChange
         */
        function handler() {
            if (request.readyState === 4 /* complete */ ) {
                if (request.status === 200) {
                    $("#response").append(request.responseText);
                }
            }
        }

        var request = getXMLHttpRequest();

        if (request !== null) {
            if (useOpen)
            {
                request.open(methodType, "response.html", true);
            }
            request.onreadystatechange = handler;
            if (useSend)
            {
                request.send(dataToSend);
            }
        } else {
            console.error("AJAX (getXMLHttpRequest()) not supported.");
        }
    }

    /**
     * jQuery ajax Call
     * @param methodType {string} The method of the request. Available parameters:
     *  "OPTIONS", "GET", "HEAD", "POST", "PUT", "DELETE"
     * @param dataToSend {string} Data send using send method
     * @param useSend {boolean} whether to send data or not
     * @param useOpen {boolean} whether to execute the open method
     */
    function jqueryAjaxCall(methodType, dataToSend, useSend, useOpen) {
        $.ajax({
            url: "response.html",
            data: dataToSend,
            type: methodType,
            beforeSend: function ( xhr ) {
                // force charset to  x-user-defined
                xhr.overrideMimeType("text/plain; charset=x-user-defined");
            }
        }).done(function ( data ) {
            if( console && console.log ) {
                $("#response").append(data);
            }
        });
    }
});