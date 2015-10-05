/**
 * Creates a server.
 * @param methods the methods to be called on the server
 */
export default function server(methods) {
  const clientWindow = window.parent === window ? window.opener : window.parent;
  window.addEventListener('message', event => {
    if (event.source !== clientWindow) {
      return;
    }
    let data;
    let method;
    try {
      data = JSON.parse(event.data);
    } catch (parseError) {
      // unable to parse data, so didn't come from client
    }
    if (data && data.postmessageClientServerMethod) {
      method = methods[data.postmessageClientServerMethod];
      if (method) {
        Promise.resolve(method.apply(null, data.args))
          .then(result => {
            event.source.postMessage(JSON.stringify({id: data.id, result: result}), event.origin);
          }, error => {
            event.source.postMessage(JSON.stringify({id: data.id, error: error}), event.origin);
          })
          .catch(caught => {
            event.source.postMessage(JSON.stringify({id: data.id, error: caught.message || caught}), event.origin);
          });
      } else {
        throw new Error('No method "' + data.postmessageClientServerMethod + '" found');
      }
    }
  });
  clientWindow.postMessage(JSON.stringify({postmessageClientServerInit: true}), '*');
}
