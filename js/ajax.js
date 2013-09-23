$(function() {
    $('#simpleCall').on('click', simpleAjaxRequest);
    $('#customCall').on('click', customAjaxRequest);

    defaultData = "html=<b>Hello!</b>&amp;delay=1";
    $("#data").attr("placeholder", defaultData);

    function simpleAjaxRequest()
    {
        $.ajax({
            async: true,
            cache: false,
            type: 'post',
            url: 'response.html',
            data: {
                html: '<p>This is echoed the response in HTML format</p>',
                delay: 1
            },
            dataType: 'html',
            beforeSend: function() {
                console.log('Fired prior to the request');
            },
            success: function(data) {
                console.log('Fired when the request is successfull');
                $('#response').append(data);
            },
            complete: function() {
                console.log('Fired when the request is complete');
            }
        });
    }

    function customAjaxRequest()
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

    function vanillaAjaxCall(methodeType, dataToSend) {
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

        function handler() {
            if (oReq.readyState == 4 /* complete */ ) {
                if (oReq.status == 200) {
                    $("#response").append(oReq.responseText);
                }
            }
        }

        oReq = getXMLHttpRequest();

        if (oReq != null) {
            oReq.open(methodeType, "response.html", true);
            oReq.onreadystatechange = handler;
            oReq.send(dataToSend);
        } else {
            window.alert("AJAX (XMLHTTP) not supported.");
        }
    }

    function jqueryAjaxCall(methodeType, dataToSend) {
        $.ajax({
            url: "response.html",
            data: dataToSend,
            type: methodeType,
            beforeSend: function ( xhr ) {
                xhr.overrideMimeType("text/plain; charset=x-user-defined");
            }
        }).done(function ( data ) {
            if( console && console.log ) {
                $("#response").append(data);
            }
        });
    }
});