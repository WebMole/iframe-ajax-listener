/**
 * A request caught by the AjaxListener
 */
function caughtRequest()
{
    this.m_data = null;
    this.m_url = null;
    this.m_status = null;
    this.m_response = null;
    this.m_method = null;
}

/**
 * Listen to ajax requests, hijack them and inject custom request. Strongly inspired from
 *    http://stackoverflow.com/questions/3596583/javascript-detect-an-ajax-event
 * @param {*} target The XMLHttpRequest object to override
 * @param {function} callback The custom function called to manipulate request data
 *   Examples of what is accessible within the callback
 *   this.method  --> the ajax method used
 *   this.url     --> the url of the requested script (including query string, if any). (urlencoded)
 *   this.data --> the data sent, if any. (urlencoded)
 *
 */
function AjaxListener(target, callback)
{
    this.capturedRequests = [];
    var s_ajaxListener = new Object();

    /**
     * update target and override prototypes
     * @param target
     */
    this.setTarget = function(target) {
        s_ajaxListener.target = target;
        s_ajaxListener.tempOpen = target.prototype.open;
        s_ajaxListener.tempSend = target.prototype.send;
        s_ajaxListener.target.prototype.open = s_ajaxListener.customXHROpen;
        s_ajaxListener.target.prototype.send = s_ajaxListener.customXHRSend;
        console.log("AJAXListener :: AjaxListener Ready");
    };

    this.setCallback = function(callback)
    {
        s_ajaxListener.callback = callback;
    };


    /**
     * This is a function that execute prior to the initial callback.
     *    Actual implementation captures time of the request
     * @param {function} callback The original callback that should execute
     *    by default
     * @return {function} Tricky function executed instead of initialHandler
     */
    s_ajaxListener.superCallback = function() {
        console.log("AJAXListener :: Super Callback");
        this.isSuperHandled = true;
        var sendTime = new Date().getTime();
        // State changed inside this function

        /**
         * @param handler {function} the handler of the original request. Must call it on every state change.
         */
        var handlerWrapper = function(handler) {
            var startTime = new Date().getTime();
            if (s_ajaxListener.originalCallback === undefined)
            {
                console.error("AJAXListener :: Super callback << No handler defined");
            }
            else
            {
                console.log("AJAXListener :: Super callback << Calling handler");
                try {
                    s_ajaxListener.originalCallback.apply(s_ajaxListener.target);
                }
                catch (e)
                {
                    console.error("AJAXListener :: Super callback << Something went wrong with handler");
                    console.error(e);
                }
            }

            var endTime = new Date().getTime();

            console.log("AJAXListener :: Super callback << handler Time: " + (endTime - startTime) + "ms - Ellapsed Time (After handler): " + (startTime - sendTime) + "ms");
            console.log("AJAXListener :: Super callback << Request:");
        };

        return handlerWrapper();
    };

    /**
     * Custom xmlHTTPRequest Open implementation that should be used as the prototype
     *    of the Window Target's xmlHTTPRequest.open to execute our own callbacks
     */
    s_ajaxListener.customXHROpen = function(method, url, async)
    {
        if (!method)
        {
            method = '';
        }

        if (!url)
        {
            url = '';
        }

        // Runs XMLHttpRequest.open with original args and modified callback
        s_ajaxListener.tempOpen.apply(this, arguments);

        s_ajaxListener.method = method;
        s_ajaxListener.url = url;

        if (s_ajaxListener.method.toLowerCase() === "get") {
            console.log("AjaxListener :: open >> GET Captured");
        }
        else if (s_ajaxListener.method.toLowerCase() === "post") {
            console.log("AjaxListener :: open >> POST Captured with data", s_ajaxListener.data);
        }
        else if (s_ajaxListener.method.toLowerCase() === "options") {
            console.log("AjaxListener :: open >> OPTIONS Captured");
        }
        else if (s_ajaxListener.method.toLowerCase() === "head")  {
            console.log("AjaxListener :: open >> HEAD Captured");
        }
        else if (s_ajaxListener.method.toLowerCase() === "PUT") {
            console.log("AjaxListener :: open >> PUT Captured");
        }
        else if (s_ajaxListener.method.toLowerCase() === "delete") {
            console.log("AjaxListener :: open >> DELETE Captured");
        }
    };

    /**
     * Custom xmlHTTPRequest Send implementation that should be used as the prototype
     *    of the Window Target's xmlHTTPRequest.send to execute our own callbacks
     * @params {string} Only used for POST requests, it's the data sent ;)
     */
    s_ajaxListener.customXHRSend = function(params) {
        console.log(s_ajaxListener.target);
        if (params === null)
        {
            console.log("AjaxListener :: send >> data is null");
        }
        else if (params === undefined)
        {
            console.log("AjaxListener :: send >> data is undefined");
        }
        else
        {
            // The should be some data only when method is post :)
            s_ajaxListener.data = params;
        }

        // Attach the superCallback to the onReadyStateChange
        s_ajaxListener.originalCallback = this.onreadystatechange;
        this.onreadystatechange = s_ajaxListener.superCallback;

        // Call the original xmlHTTPRequest.send method
        s_ajaxListener.tempSend.apply(this, arguments);

        console.log("AjaxListener :: send >> Calling Custom Callback");
        s_ajaxListener.callback();
    };


    // Construct
    this.setTarget(target);
    this.setCallback(callback);
}

var getParams = function(url) {
    var regex = /[?&]([^=#]+)=([^&#]*)/g, params = {}, match;
    while(match = regex.exec(url)) {
        params[match[1]] = match[2];
    }
    return params;
}