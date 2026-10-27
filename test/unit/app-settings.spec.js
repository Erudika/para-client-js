import assert from 'node:assert/strict';

import ParaClient from '../../lib/index.js';

describe('addAppSetting', function () {
  function makeClient() {
    const pc = new ParaClient('app:key', 'secret');
    const calls = [];
    pc.invokePut = async function (path, body) {
      calls.push({ path, body });
      return { path, body };
    };
    pc.getEntity = async function (request) {
      return request;
    };
    return { pc, calls };
  }

  it('writes numeric and boolean values', async function () {
    const { pc, calls } = makeClient();

    await pc.addAppSetting('prop1', 1);
    await pc.addAppSetting('prop2', true);

    assert.deepEqual(calls, [
      { path: '_settings/prop1', body: { value: 1 } },
      { path: '_settings/prop2', body: { value: true } }
    ]);
  });

  it('writes falsy values', async function () {
    const { pc, calls } = makeClient();

    await pc.addAppSetting('zero', 0);
    await pc.addAppSetting('no', false);
    await pc.addAppSetting('empty', '');

    assert.deepEqual(
      calls.map(function (call) {
        return call.body.value;
      }),
      [0, false, '']
    );
  });

  it('skips null and undefined values', async function () {
    const { pc, calls } = makeClient();

    await pc.addAppSetting('a', null);
    await pc.addAppSetting('b', undefined);

    assert.equal(calls.length, 0);
  });

  it('skips a blank key', async function () {
    const { pc, calls } = makeClient();

    await pc.addAppSetting('', 1);
    await pc.addAppSetting('   ', true);

    assert.equal(calls.length, 0);
  });
});
