[![npm version](https://img.shields.io/npm/v/postmessage-client-server.svg?style=flat)](https://www.npmjs.org/package/postmessage-client-server) [![npm downloads](https://img.shields.io/npm/dm/postmessage-client-server.svg?style=flat)](https://www.npmjs.org/package/postmessage-client-server)

# postmessage-client-server

> A simple promise-based client and server to communicate between pages and iframes with postmessage.

All data passed will be serialized with JSON.

## Installation

In your project dir:

```shell
npm install --save postmessage-client-server
```

## Server

In your page the iframe will load on your server:

```js
import {server} from 'postmessage-client-server';

server({
  // Include any methods you wish to call from the client
  bark(thing) {
    console.log('SERVER: Bark at', thing);
    return 'Barked at ' + thing;
  },
  sniff() {
    console.log('SERVER: Sniffing...');
    return ['grass', 'ball'];
  },
  beBad() {
    console.log('SERVER: About to misbehave...');
    throw 'Eating shoe';
  }
});
```
 
 
## Client
 
On your client webpage:
 
```js
import {client} from 'postmessage-client-server';

const urlToServerPage = 'http://mycorp.com/serverFrame.html';

client(urlToServerPage) // adds an iframe to the given url in your page
  .then(send => {
    // now we have our send function: send(method, args)
    send('sniff')
      .then(stuffSmelt => {
        console.log('CLIENT: We smelt:', stuffSmelt);
        stuffSmelt.forEach(item => {
          send('bark', item)
            .then(result => {
              console.log('CLIENT: Bark result:', result);
            });
        });
        send('beBad')
          .then(() => {
            console.log('CLIENT: Not punished');  // won't happen
          }, reason => {
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
