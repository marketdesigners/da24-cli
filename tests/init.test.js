import { strict as assert } from 'assert';
import { test } from 'node:test';
import { init } from '../lib/init.js';

test('init - 함수로 export 되어 있음', () => {
  assert.equal(typeof init, 'function');
});
