'use strict';
var Q = require('q'),
  server = function (methods) {
    window.addEventListener('message', function (event) {
      if (event.source !== window.parent) {
        return;
      }
      var data, method;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        // unable to parse data, so didn't come from client
      }
      if(data) {
        method = methods[data.method];
        if (method) {
          try {
            Q(method.apply(null, data.args))
              .then(function (result) {
                event.source.postMessage(JSON.stringify({id: data.id, result: result}), event.origin);
              }, function (error) {
                event.source.postMessage(JSON.stringify({id: data.id, error: error}), event.origin);
              });
          } catch (e) {
            event.source.postMessage(JSON.stringify({id: data.id, error: e.message || e }), event.origin);
          }
        } else {
          throw 'No method "' + data.method + '" found';
        }
      }
    });
    window.parent.postMessage(JSON.stringify({postmessageClientServerInit: true}), '*');
  };
module.exports = server;
