export default function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

assert.ok = assert;
assert.fail = function fail(message) {
  throw new Error(message || 'Assertion failed');
};
assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${actual} to equal ${expected}`);
  }
};
