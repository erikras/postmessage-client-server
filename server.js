'use strict';
var when = require('when'),
  /**
   * Creates a server.
   * @param methods the methods to be called on the server
   */
    server = function (methods) {
    var clientWindow = window.parent === window ? window.opener : window.parent;
    window.addEventListener('message', function (event) {
      if (event.source !== clientWindow) {
        return;
      }
      var data, method;
      try {
        data = JSON.parse(event.data);
      } catch (parseError) {
        // unable to parse data, so didn't come from client
      }
      if (data && data.postmessageClientServerMethod) {
        method = methods[data.postmessageClientServerMethod];
        if (method) {
          when(method.apply(null, data.args))
            .then(function (result) {
              event.source.postMessage(JSON.stringify({id: data.id, result: result}), event.origin);
            }, function (error) {
              event.source.postMessage(JSON.stringify({id: data.id, error: error}), event.origin);
            })
            .catch(function (e) {
              event.source.postMessage(JSON.stringify({id: data.id, error: e.message || e }), event.origin);
            });
        } else {
          throw 'No method "' + data.postmessageClientServerMethod + '" found';
        }
      }
    });
    clientWindow.postMessage(JSON.stringify({postmessageClientServerInit: true}), '*');
  };
module.exports = server;