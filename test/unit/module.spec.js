import assert from 'node:assert/strict';

import ClientModule from '../../lib/index.js';

describe('Module shape', function () {
  it('exposes ParaClient constructor as default export', function () {
    assert.ok(ClientModule, 'module exports should be defined');
    assert.equal(typeof ClientModule, 'function', 'default export should be a constructor');

    const client = new ClientModule('test', 'secret', { endpoint: 'https://example.org' });
    assert.equal(client.accessKey, 'test');
  });

  it('re-exports helper classes', async function () {
    const { ParaObject, Pager, Constraint } = await import('../../lib/index.js');
    assert.equal(typeof ParaObject, 'function');
    assert.equal(typeof Pager, 'function');
    assert.equal(typeof Constraint, 'function');
  });
});
