import assert from 'node:assert/strict';

import { ParaObject, Pager } from '../../lib/index.js';

describe('ParaObject', function () {
  it('returns its tags and not its id', function () {
    const obj = new ParaObject('123', 'user');
    obj.setTags(['one', 'two']);
    assert.deepEqual(obj.getTags(), ['one', 'two']);
    assert.notEqual(obj.getTags(), obj.getId());
  });

  it('clears tags when set to null', function () {
    const obj = new ParaObject('123', 'user');
    obj.setTags(['one']);
    obj.setTags(null);
    assert.deepEqual(obj.getTags(), []);
  });

  it('initializes optional fields to safe defaults', function () {
    const obj = new ParaObject();
    assert.equal(obj.getAppid(), null);
    assert.equal(obj.getParentid(), null);
    assert.equal(obj.getCreatorid(), null);
    assert.equal(obj.getTimestamp(), 0);
    assert.equal(obj.getUpdated(), 0);
    assert.equal(obj.getVotes(), 0);
    assert.deepEqual(obj.getTags(), []);
  });
});

describe('Pager', function () {
  it('keeps desc=false', function () {
    assert.equal(new Pager(1, 'name', false, 10).desc, false);
  });

  it('defaults desc to true', function () {
    assert.equal(new Pager().desc, true);
    assert.equal(new Pager(1, 'name', true, 10).desc, true);
  });

  it('defaults page and limit', function () {
    const pager = new Pager();
    assert.equal(pager.page, 1);
    assert.equal(pager.limit, 30);
  });
});
