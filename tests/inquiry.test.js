import { strict as assert } from 'assert';
import { test } from 'node:test';

// Date validation logic extracted for testing
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validateDate(v) {
  if (v === '미정') return true;
  if (!DATE_REGEX.test(v)) return 'YYYY-MM-DD 형식 또는 "미정" 입력';
  const d = new Date(v);
  return (d instanceof Date && !isNaN(d) && d.toISOString().startsWith(v))
    || '유효하지 않은 날짜입니다 (예: 2026-05-01)';
}

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
