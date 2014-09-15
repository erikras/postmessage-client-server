# postmessage-client-server [![npm version](https://img.shields.io/npm/v/postmessage-client-server.svg?style=flat)](https://www.npmjs.org/package/postmessage-client-server) [![npm downloads](https://img.shields.io/npm/dm/postmessage-client-server.svg?style=flat)](https://www.npmjs.org/package/postmessage-client-server) [![Dependency Status](https://img.shields.io/gemnasium/erikras/postmessage-client-server.svg?style=flat)](https://gemnasium.com/erikras/postmessage-client-server) [![WTFPL](https://img.shields.io/badge/license-WTFPL-brightgreen.svg?style=flat)](https://www.tldrlegal.com/l/wtfpl)

> A simple promise-based client and server to communicate between pages and iframes with postmessage.

All data passed will be serialized with JSON. Uses [when.js promises](https://github.com/cujojs/when).

## Installation

In your project dir:

```shell
npm install --save postmessage-client-server
```

## Server

In your page the iframe will load on your server:

```js
var server = require('postmessage-client-server/server');

server({
  // Include any methods you wish to call from the client
  bark: function (thing) {
    console.log('SERVER: Bark at', thing);
    return 'Barked at ' + thing;
  },
  sniff: function () {
    console.log('SERVER: Sniffing...');
    return ['grass', 'ball'];
  },
  beBad: function () {
    console.log('SERVER: About to misbehave...');
    throw 'Eating shoe';
  }
});
```
 
 
## Client
 
On your client webpage:
 
```js
var client = require('postmessage-client-server/client'),
  urlToServerPage = 'http://mycorp.com/serverFrame.html';

client(urlToServerPage) // adds an iframe to the given url in your page
  .then(function (send) {
    // now we have our send function: send(method, args)
    send('sniff')
      .then(function (stuffSmelt) {
        console.log('CLIENT: We smelt:', stuffSmelt);
        stuffSmelt.forEach(function (item) {
          send('bark', item)
            .then(function (result) {
              console.log('CLIENT: Bark result:', result);
            });
        });
        send('beBad')
          .then(function () {
            console.log('CLIENT: Not punished');  // won't happen
          }, function (reason) {
            console.log('CLIENT: Got punished for', reason);
          });
      });
  });
```
  
## Output

The console output from the above example would be:

```js
SERVER: Sniffing...
CLIENT: We smelt: ["grass", "ball"]
SERVER: Bark at grass
SERVER: Bark at ball
SERVER: About to misbehave...
CLIENT: Got punished for Eating shoe
CLIENT: Bark result: Barked at grass
CLIENT: Bark result: Barked at ball 
```

Remember that the calls are asynchronous, so the order may vary.

---

Module submitted by [Erik Rasmussen](https://www.npmjs.org/~erikras) [@erikras](https://twitter.com/erikras)