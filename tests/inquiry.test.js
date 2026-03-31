import { strict as assert } from 'assert';
import { test } from 'node:test';
import { validateDate } from '../lib/inquiry.js';

test('날짜 검증 - 유효한 날짜 통과', () => {
  assert.equal(validateDate('2026-05-01'), true);
});

test('날짜 검증 - 미정 통과', () => {
  assert.equal(validateDate('미정'), true);
});

test('날짜 검증 - 형식 오류 거부', () => {
  assert.notEqual(validateDate('2026/05/01'), true);
});

test('날짜 검증 - 존재하지 않는 날짜 거부 (2025-02-30)', () => {
  assert.notEqual(validateDate('2025-02-30'), true);
});

test('날짜 검증 - 잘못된 월 거부 (2025-13-01)', () => {
  assert.notEqual(validateDate('2025-13-01'), true);
});
