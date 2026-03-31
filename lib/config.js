import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';

const CLAUDE_JSON_PATH = join(homedir(), '.claude.json');
const MCP_BASE_URL = 'https://mcp.wematch.com/sse';

export function parseApiKeyFromUrl(url) {
  try {
    const u = new URL(url);
    return u.searchParams.get('api_key');
  } catch {
    return null;
  }
}

export function buildMcpUrl(apiKey) {
  if (!apiKey) return MCP_BASE_URL;
  const params = new URLSearchParams({ api_key: apiKey });
  return `${MCP_BASE_URL}?${params.toString()}`;
}

export function getApiKey() {
  // 1. 환경변수 우선
  if (process.env.DA24_API_KEY) return process.env.DA24_API_KEY;

  // 2. ~/.claude.json에서 파싱
  try {
    const raw = readFileSync(CLAUDE_JSON_PATH, 'utf-8');
    const config = JSON.parse(raw);
    const url = config?.mcpServers?.da24?.url;
    if (url) return parseApiKeyFromUrl(url);
  } catch {
    // 파일 없거나 파싱 실패 — 무시
  }
  return null;
}

export function readClaudeConfig() {
  try {
    const raw = readFileSync(CLAUDE_JSON_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveMcpConfig(apiKey) {
  const config = readClaudeConfig();

  if (!config.mcpServers) config.mcpServers = {};

  // 기존 da24 설정 여부 반환 (init.js에서 덮어쓰기 확인에 사용)
  const existing = config.mcpServers.da24;

  config.mcpServers.da24 = {
    type: 'sse',
    url: buildMcpUrl(apiKey),
  };

  // 부모 디렉토리 없으면 생성
  mkdirSync(dirname(CLAUDE_JSON_PATH), { recursive: true });

  try {
    writeFileSync(CLAUDE_JSON_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (e) {
    if (e.code === 'EACCES') {
      throw new Error(`~/.claude.json 쓰기 권한이 없습니다. 권한을 확인해 주세요.`);
    }
    throw e;
  }

  return existing;
}
