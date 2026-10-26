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
npm install para-client-js --save
```

## Usage

Initialize the client in your code like so:

```js
import { ParaClient } from 'para-client-js';
var pc = new ParaClient('ACCESS_KEY', 'SECRET_KEY');
```

If your code runs in a browser environment, you should use a **blank secret key** and then call `signIn()`:

```
pc.signIn("password", "{email}::{password}", function(user) {
  // do something with the newly created user
});
```

It's a bad idea to hardcode your Para secret key in your code because it will run in an insecure client-side environment. Instead use the `signIn()` method to get an access token (JWT) with limited client permissions. Think of it like this: API key+secret = **full API access**, `paraClient.signIn()` = **limited API access** for clients with JWT tokens.
You can have a [special user object created](http://paraio.org/docs/#034-api-jwt-signin) just for your JS app and assign it special permissions so that your app can access a part of the Para API before authenticating another real user. [Read the documentation for more information about client permissions](http://paraio.org/docs/#012-permissions).
For granting resource permissions to your client users go to [console.paraio.org](https://console.paraio.org) where you can edit your app object and allow your users the call specific API methods.

## Browser usage

To use `para-client-js` in the browser run:

```sh
npm install
npm run build
```

This will generate `dist/browser/para-client-js.global.iife.js` which you can include directly in the browser:

```html
<html>
  <head>
    <script src="dist/browser/para-client-js.global.iife.js"></script>
  </head>
  <body>
    <script>
      var pc = new ParaClient('ACCESS_KEY', '');
    </script>
  </body>
</html>
```

## Development

- `npm run build` bundles ESM, CommonJS, and browser artifacts into `dist/` using [tsdown](https://tsdown.dev/). Types are emitted via `npm run types`.
- `npm test` runs ESLint, the type tests in `test/types`, and the fast unit tests in `test/unit`.
- Integration tests live under `test/integration` and require a running Para server. Copy `.env.example` to `.env`, adjust `PARA_*` values, then run `npm run test:integration`.

## Promises and callbacks

Most methods return a promise object and also accept a callback function as last parameter.
You can choose to either use callbacks or promises. For example:

```js
// using promises
pc.read('user', '1234').then(
  function (user) {
    // do something with user object
  },
  function (err) {
    // request failed
  }
);

// using callbacks
pc.read('user', '1234', function (user, err) {
  // do something with user object
});
```

## TypeScript

Type declarations ship with the package. You do not need to install a separate `@types` package.

The default export and the named export are the same class:

```ts
import ParaClient from 'para-client-js';
import { ParaClient as NamedParaClient } from 'para-client-js';

const first: ParaClient = new ParaClient('ACCESS_KEY', 'SECRET_KEY');
const second: NamedParaClient = new ParaClient('ACCESS_KEY', 'SECRET_KEY');
```

Most methods return a promise, so the callback is optional. The promise result is typed:

```ts
import { ParaClient, ParaObject, Pager } from 'para-client-js';

const pc = new ParaClient('ACCESS_KEY', 'SECRET_KEY');
const pager = new Pager(1, 'name', true, 10);

async function example(): Promise<void> {
  const created: ParaObject | null = await pc.create(new ParaObject());
  const user: ParaObject | null = await pc.read('user', '1234');
  const users: ParaObject[] = await pc.list('user', pager);
  const count: number = await pc.getCount('user', {});
  const allowed: boolean = await pc.isAllowedTo('*', 'utils/timestamp', 'GET');

  void [created, user, users, count, allowed];
}
```

`ParaObject` and `Pager` constructors accept optional arguments. `Constraint` provides static factory methods:

```ts
import { ParaObject, Pager, Constraint } from 'para-client-js';

const obj = new ParaObject('1234', 'user');
const empty = new ParaObject();
const pager = new Pager();
const descending: boolean = pager.desc;
const required: Constraint = Constraint.required();
```

Set `moduleResolution` to `bundler`, `node16`, or `nodenext`. With `node16` or `nodenext`, set `module` to the same value. TypeScript then reads the `exports` map and the `types` entry. A minimal `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

The `exports` map provides an ESM build and a CommonJS build. TypeScript resolves the matching declarations for each mode. Use `import` in ESM code. The default export is the `ParaClient` class. In CommonJS code, `require()` returns the module object, so use the named export:

```js
const { ParaClient } = require('para-client-js');
```

In the browser, use a blank secret key and call `signIn()`. AWS Signature Version 4 signing is not available in the browser:

```ts
import ParaClient from 'para-client-js';

const pc = new ParaClient('ACCESS_KEY', '');

async function signIn(): Promise<void> {
  const user = await pc.signIn('password', '{email}::{password}', true);
  void user;
}
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
