postmessage-client-server
=========================

> A simple promise-based client and server to communicate between pages and iframes with postmessage.

## Installation

In your project dir:

```shell
npm install --save postmessage-client-server
```

## Server

In your page loaded via iframe:

```js
'use strict';
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
  }
});
```
 
 
## Client
 
On your client webpage:
 
```js
var client = require('postmessage-client-server/client'),
  urlToServerPage = 'http://mycorp.com/serverFrame.html';
client(urlToServerPage)
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
      });
  });
```
  
---

Module submitted by [Erik Rasmussen](http://erikras.com/) [@erikras](https://twitter.com/erikras)
