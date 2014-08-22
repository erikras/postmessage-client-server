'use strict';
var Q = require('q'),
  server = function (methods) {
    window.addEventListener('message', function (event) {
      if (event.source !== window.parent) {
        return;
      }
      var method = methods[event.data.method];
      if (method) {
        Q(method.apply(null, event.data.args))
          .then(function (result) {
            event.source.postMessage(JSON.stringify({id: event.data.id, result: result}), event.origin);
          }, function (error) {
            event.source.postMessage(JSON.stringify({id: event.data.id, error: error}), event.origin);
          });
      } else {
        throw 'No method "' + event.data.method + '" found';
      }
    });
    window.parent.postMessage(JSON.stringify({postmessageClientServerInit: true}), '*');
  };
module.exports = server;
