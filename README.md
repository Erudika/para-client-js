![Logo](https://s3-eu-west-1.amazonaws.com/org.paraio/para.png)

# JavaScript Client for Para

[![npm version](https://badge.fury.io/js/para-client-js.svg)](http://badge.fury.io/js/para-client-js)
[![Join the chat at https://gitter.im/Erudika/para](https://badges.gitter.im/Erudika/para.svg)](https://gitter.im/Erudika/para?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## What is this?

**Para** was designed as a simple and modular backend framework for object persistence and retrieval.
It helps you build applications faster by taking care of the backend. It works on three levels -
objects are stored in a NoSQL data store or any old relational database, then automatically indexed
by a search engine and finally, cached.

This is the JavaScript client for Para.

### Quick start

```sh
$ npm install para-client-js --save
```

## Usage

Initialize the client in your Node.js code like so:

```js
var ParaClient = require('para-client-js');
var pc = new ParaClient('ACCESS_KEY', 'SECRET_KEY');
```

## Browser usage

To use `para-client-js` in the browser run:

```
$ npm install
$ npm run build
```
This will generate a **"bundle.js"** file which you can use inside your HTML code:
```html
<html>
  <head>
    <script src="bundle.js"></script>
  </head>
  <body>
    <script>
      var ParaClient = require('para-client-js');
      var pc = new ParaClient('ACCESS_KEY', 'SECRET_KEY');
    </script>
  </body>
</html>
```

## Promises and callbacks

All methods return a promise object and also accept a callback function as last parameter.
You can choose to either use callbacks or promises. For example:

```js
// using promises
pc.read("user", "1234").then(function (user) {
	// do something with user object
}, function (err) {
	// request failed
});

// using callbacks
pc.read("user", "1234", function (user, err) {
	// do something with user object
});
```

## Documentation

### [Read the Docs](https://paraio.org/docs)

## Contributing

1. Fork this repository and clone the fork to your machine
2. Create a branch (`git checkout -b my-new-feature`)
3. Implement a new feature or fix a bug and add some tests
4. Commit your changes (`git commit -am 'Added a new feature'`)
5. Push the branch to **your fork** on GitHub (`git push origin my-new-feature`)
6. Create new Pull Request from your fork

For more information see [CONTRIBUTING.md](https://github.com/Erudika/para/blob/master/CONTRIBUTING.md)

## License
[Apache 2.0](LICENSE)
