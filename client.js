'use strict';
var Q = require('q'),
  toArray = function (array) {
    var index = -1,
      length = array ? array.length : 0,
      result = Array(length);
    while (++index < length) {
      result[index] = array[index];
    }
    return result;
  },
  client = function (target) {
    var deferred = Q.defer(),
      iframe = document.createElement('iframe'),
      targetOrigin = target.match(/(.+\/\/[^/]+)\/?/)[1],
      promises = [],
      count = 0,
      send = function (method) {
        var deferred = Q.defer(),
          id = count++;
        promises[id] = deferred;
        iframe.contentWindow.postMessage({id: id, method: method, args: toArray(arguments).slice(1)}, target);
        return deferred.promise;
      };
    iframe.src = target;
    iframe.style.cssText = 'position:absolute;left:-2px;top:-2px;width:1px;height:1px;';

    window.addEventListener('message', function (event) {
      if (event.source !== iframe.contentWindow || event.origin !== targetOrigin) {
        return;
      }
      var data = JSON.parse(event.data);
      if (data.postmessageClientServerInit) {
        // initialized handshake, return send function
        deferred.resolve(send);
      } else {
        var callPromise = promises[data.id];
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
    document.body.appendChild(iframe);
    return deferred.promise;
  };
Q.stopUnhandledRejectionTracking();
module.exports = client;
