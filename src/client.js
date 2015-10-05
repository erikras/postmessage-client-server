/**
 * Creates a client to talk to a server
 * @param target  the url where the server is
 * @param targetWindow  the window where the server is. if null, an iframe will be created
 * @returns {promise|*|Q.promise} a promise that will be resolved with the send(method, params) function
 * when the client has connected to the server
 */
export default function client(target, targetWindow) {
  const targetOrigin = target.match(/(.+\/\/[^\/]+)\/?/)[1];
  const promises = [];
  let getTargetWindow;
  let count = 0;
  const send = (method, ...args) => {
    var id = count++;
    return new Promise(function(resolve, reject) {
      promises[id] = {
        resolve: resolve,
        reject: reject
      };
      getTargetWindow()
        .postMessage(JSON.stringify({id: id, postmessageClientServerMethod: method, args: args}), targetOrigin);
    });
  };
  if (targetWindow) {
    getTargetWindow = () => targetWindow;
  } else {
    const iframe = document.createElement('iframe');
    iframe.src = target;
    iframe.style.cssText = 'position:absolute;left:-2px;top:-2px;width:1px;height:1px;';
    getTargetWindow = () => iframe.contentWindow;
    document.body.appendChild(iframe);
  }

  return new Promise(resolve => {
    window.addEventListener('message', event => {
      if (event.source !== getTargetWindow() || event.origin !== targetOrigin) {
        return;
      }
      const data = JSON.parse(event.data);
      if (data.postmessageClientServerInit) {
        // initialized handshake, return send function
        resolve(send);
      } else {
        const callPromise = promises[data.id];
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
}
