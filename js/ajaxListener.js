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
     * @param {function} initialCallback The original callback that should execute
     *    by default
     * @return {function} Tricky function executed instead of initialCallback
     */
    s_ajaxListener.superCallback = function(initialCallback) {
        console.log("AJAXListener :: Super Callback");
        this.isSuperHandled = true;
        var sendTime = new Date().getTime();

        /**
         * @param callback {function} the callbackback of the original request. Must call it on every state change. 
         */
        var callbackWrapper = function(callback) {
            var startTime = new Date().getTime();
            if (callback === undefined)
            {
                console.log("AJAXListener :: Super Callback << No Callback defined");
            }
            else
            {
                console.log("AJAXListener :: Super Callback << Calling callback");
                try {
                    callback();
                }
                catch (e)
                {
                    console.log("AJAXListener :: Super Callback << Something went wrong with callback");
                    console.log(e);
                }
            }

            if (s_ajaxListener.target.onStateChange === undefined)
            {
                // Tricky
                console.log("AJAXListener :: Super Callback << onStateChange not defined");
                //s_ajaxListener.target.onStateChange = s_ajaxListener.onStateChangeCallback(s_ajaxListener.superCallback(undefined));
            }
            else
            {
                console.log("AJAXListener :: Super Callback << onStateChange defined, our callback will handle it");
                s_ajaxListener.target.onStateChange = s_ajaxListener.onStateChangeCallback(callback);
            }

            var endTime = new Date().getTime();

            console.log("AJAXListener :: Super Callback << State #" + s_ajaxListener.target.readyState + " - Callback Time: " + (endTime - startTime) + "ms - Ellapsed Time (After Callback): " + (startTime - sendTime) + "ms");
            console.log("AJAXListener :: Super Callback << Request:");
            console.log(s_ajaxListener.target);
        };

        // State changed inside this function
        return callbackWrapper(initialCallback);
    };

    /**
     * Callback executed on StateChange inside the superCallback
     * @param {function} initialCallback The original callback that should execute
     *    by default
     */
    s_ajaxListener.onStateChangeCallback = function(initialCallback)
    {
        // Inside the current function, `this` should be an xmlHTTPRequest
        console.log(s_ajaxListener);
        if (this.readyState === 4)
        {
            console.log(this);
        }
        // let's call the request's onStateChange original callback if defined
        if (initialCallback !== undefined && initialCallback !== null)
        {
            try
            {
                initialCallback();
            }
            catch(e)
            {
                console.log("AjaxListener :: onStateChangeCallback >> Something went wrong with initialCallback");
                console.log(e);
            }
        }
        else
        {
            if (initialCallback === undefined)
            {
                console.log("AjaxListener :: onStateChangeCallback >> initialCallback is undefined");
            }
            else
            {
                console.log("AjaxListener :: onStateChangeCallback >> initialCallback is null");
            }
        }
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
            s_ajaxListener.data = url.split('?')[1];
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
        console.log(s_ajaxListener);
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
        this.onreadystatechange = s_ajaxListener.superCallback(this.onreadystatechange);

        // Call the original xmlHTTPRequest.send method

        console.log("debug bellow");
        console.log(this);
        console.log("debug up");

        s_ajaxListener.tempSend.apply(this, arguments);

        console.log("AjaxListener :: send >> Calling Custom Callback");
        s_ajaxListener.callback();
    };

    this.setTarget(target);
    this.setCallback(callback);
}

