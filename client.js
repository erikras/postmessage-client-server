'use strict';
var when = require('when'),
  toArray = function (array) {
    var index = -1,
      length = array ? array.length : 0,
      result = Array(length);
    while (++index < length) {
      result[index] = array[index];
    }
    return result;
  },
  /**
   * Creates a client to talk to a server
   * @param target  the url where the server is
   * @param targetWindow  the window where the server is. if null, an iframe will be created
   * @returns {promise|*|Q.promise} a promise that will be resolved with the send(method, params) function
   * when the client has connected to the server
   */
    client = function (target, targetWindow) {
    var getTargetWindow,
      targetOrigin = target.match(/(.+\/\/[^\/]+)\/?/)[1],
      iframe,
      promises = [],
      count = 0,
      send = function (method) {
        var deferred = when.defer(),
          id = count++;
        promises[id] = deferred;
        getTargetWindow().postMessage(JSON.stringify({id: id, postmessageClientServerMethod: method, args: toArray(arguments).slice(1)}),
          targetOrigin);
        return deferred.promise;
      };
    if (targetWindow) {
      getTargetWindow = function () {
        return targetWindow;
      };
    } else {
      iframe = document.createElement('iframe');
      iframe.src = target;
      iframe.style.cssText = 'position:absolute;left:-2px;top:-2px;width:1px;height:1px;';
      getTargetWindow = function () {
        return iframe.contentWindow;
      };
      document.body.appendChild(iframe);
    }

    return when.promise(function (resolve, reject, notify) {
      window.addEventListener('message', function (event) {
        if (event.source !== getTargetWindow() || event.origin !== targetOrigin) {
          return;
        }
        var data = JSON.parse(event.data),
          callPromise;
        if (data.postmessageClientServerInit) {
          // initialized handshake, return send function
          resolve(send);
        } else {
          callPromise = promises[data.id];
          if (callPromise) {
            delete promises[data.id];
            if (data.error) {
              callPromise.reject(data.error);
            } else {
              callPromise.resolve(data.result);
            }
          } else {
            throw 'Cannot find call promise for id ' + data.id;
          }
        }
      });
    });
  };
module.exports = client;