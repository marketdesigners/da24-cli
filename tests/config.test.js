import { strict as assert } from 'assert';
import { test } from 'node:test';
import { parseApiKeyFromUrl, buildMcpUrl } from '../lib/config.js';

test('parseApiKeyFromUrl - api_key 파라미터 파싱', () => {
  const url = 'https://mcp.wematch.com/sse?api_key=test-key-123';
  assert.equal(parseApiKeyFromUrl(url), 'test-key-123');
});

test('parseApiKeyFromUrl - api_key 없으면 null 반환', () => {
  const url = 'https://mcp.wematch.com/sse';
  assert.equal(parseApiKeyFromUrl(url), null);
});

test('buildMcpUrl - api_key 있으면 쿼리 파라미터 포함', () => {
  const url = buildMcpUrl('my-key');
  assert.equal(url, 'https://mcp.wematch.com/sse?api_key=my-key');
});

test('buildMcpUrl - api_key 없으면 기본 URL', () => {
  const url = buildMcpUrl(null);
  assert.equal(url, 'https://mcp.wematch.com/sse');
});
