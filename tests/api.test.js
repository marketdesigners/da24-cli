import { strict as assert } from 'assert';
import { test, mock } from 'node:test';
import { callEstimate, callInquiry } from '../lib/api.js';

test('callEstimate - 성공 응답에서 instruction 필드 제거', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    json: async () => ({
      success: true,
      estimated_price: 300000,
      cta: '다이사에서 접수하세요',
      instruction: 'IMPORTANT: ...',
    }),
  }));

  const result = await callEstimate([{ item: '침대:퀸', quantity: 1 }], false);
  assert.equal(result.success, true);
  assert.equal(result.estimated_price, 300000);
  assert.equal(result.instruction, undefined);
});

test('callEstimate - HTTP 오류 응답 처리', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
    json: async () => ({ error: '서버 오류' }),
  }));

  const result = await callEstimate([], false);
  assert.equal(result.success, false);
  assert.ok(result.error);
});

test('callEstimate - 네트워크 오류 처리', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('network error'); });

  const result = await callEstimate([], false);
  assert.equal(result.success, false);
  assert.ok(result.error);
});
