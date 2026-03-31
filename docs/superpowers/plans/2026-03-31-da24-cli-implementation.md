# da24 CLI Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `npx da24` 명령어로 이사 견적 계산/접수를 하고, Claude Code slash command로도 사용할 수 있는 npm 패키지를 만든다.

**Architecture:** Node.js 18+ 기반 CLI로 `init`, `estimate`, `inquiry` 3개 명령어를 제공한다. 터미널 CLI는 `mcp.wematch.com` REST API를 직접 호출하고, Claude Code slash command(`/da24`)는 MCP 서버 툴을 호출하는 프롬프트 가이드 역할을 한다.

**Tech Stack:** Node.js 18+, inquirer 9.x (ESM), 내장 fetch/readline/node:test

---

## File Structure

```
da24-cli/
├── bin/
│   └── da24.js          ← CLI 진입점 (명령어 라우팅)
├── lib/
│   ├── init.js          ← ~/.claude.json MCP 설정 추가
│   ├── estimate.js      ← 대화형 메뉴 + REST API 견적 계산
│   ├── inquiry.js       ← 대화형 메뉴 + REST API 이사 접수
│   ├── api.js           ← REST API 호출 공통 모듈
│   ├── items.js         ← 짐 항목 카테고리/옵션 데이터
│   └── config.js        ← API 키 읽기/쓰기 (~/.claude.json 파싱)
├── skills/
│   └── da24.md          ← Claude Code slash command 스킬 (MCP 툴 호출 가이드)
├── tests/
│   ├── api.test.js
│   ├── config.test.js
│   └── init.test.js
├── package.json
└── README.md
```

---

## Task 1: 프로젝트 초기화

**Files:**
- Create: `package.json`
- Create: `bin/da24.js`
- Create: `.gitignore`

- [ ] **Step 1: package.json 생성**

```json
{
  "name": "da24",
  "version": "0.1.0",
  "description": "다이사 이사 견적 계산 및 접수 CLI — Claude Code slash command 플러그인",
  "bin": {
    "da24": "./bin/da24.js"
  },
  "type": "module",
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "test": "node --test tests/*.test.js"
  },
  "dependencies": {
    "inquirer": "9.2.12"
  },
  "keywords": ["da24", "이사", "견적", "mcp", "claude"],
  "license": "MIT"
}
```

- [ ] **Step 2: bin/da24.js 생성**

```js
#!/usr/bin/env node
import { init } from '../lib/init.js';
import { estimate } from '../lib/estimate.js';
import { inquiry } from '../lib/inquiry.js';

const command = process.argv[2];

try {
  switch (command) {
    case 'init':
      await init();
      break;
    case 'estimate':
      await estimate();
      break;
    case 'inquiry':
      await inquiry();
      break;
    default:
      console.log(`
다이사 CLI — 이사 견적 계산 및 접수

사용법:
  npx da24 init       Claude Code MCP 설정 추가
  npx da24 estimate   이사 견적 계산
  npx da24 inquiry    이사 접수

Claude Code에서:
  /da24 원룸 이사 견적 계산해줘
      `);
  }
} catch (e) {
  console.error('오류:', e.message);
  process.exit(1);
}
```

- [ ] **Step 3: .gitignore 생성**

```
node_modules/
.env
.DS_Store
*.swp
coverage/
dist/
```

- [ ] **Step 4: 의존성 설치**

```bash
cd ~/IdeaProjects/da24-cli
npm install
```

Expected: `node_modules/` 생성, `package-lock.json` 생성

- [ ] **Step 5: 커밋**

```bash
git add package.json bin/da24.js .gitignore package-lock.json
git commit -m "feat: 프로젝트 초기화 및 CLI 진입점 추가"
```

---

## Task 2: config.js — API 키 읽기/쓰기

**Files:**
- Create: `lib/config.js`
- Create: `tests/config.test.js`

- [ ] **Step 1: 테스트 작성**

```js
// tests/config.test.js
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
```

- [ ] **Step 2: 테스트 실행 (실패 확인)**

```bash
node --test tests/config.test.js
```

Expected: FAIL — `lib/config.js` 없음

- [ ] **Step 3: lib/config.js 구현**

```js
// lib/config.js
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
```

- [ ] **Step 4: 테스트 실행 (통과 확인)**

```bash
node --test tests/config.test.js
```

Expected: PASS — 4 tests passed

- [ ] **Step 5: 커밋**

```bash
git add lib/config.js tests/config.test.js
git commit -m "feat: config.js — API 키 읽기/쓰기 및 ~/.claude.json MCP 설정"
```

---

## Task 3: api.js — REST API 호출 공통 모듈

**Files:**
- Create: `lib/api.js`
- Create: `tests/api.test.js`

- [ ] **Step 1: 테스트 작성**

```js
// tests/api.test.js
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
```

- [ ] **Step 2: 테스트 실행 (실패 확인)**

```bash
node --test tests/api.test.js
```

Expected: FAIL

- [ ] **Step 3: lib/api.js 구현**

```js
// lib/api.js
const BASE_URL = 'https://mcp.wematch.com';
const TIMEOUT_MS = 30000;

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function callEstimate(items, needPacking) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/rest/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, need_packing: needPacking }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || res.statusText };
    }

    // instruction 필드 제거 (내부 지침, 사용자 노출 불필요)
    const { instruction, ...rest } = data;
    return rest;
  } catch (e) {
    if (e.name === 'AbortError') {
      return { success: false, error: 'API 요청 시간 초과 (30초)' };
    }
    return { success: false, error: e.message };
  }
}

export async function callInquiry(payload, apiKey) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/rest/inquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || res.statusText };
    }

    return data;
  } catch (e) {
    if (e.name === 'AbortError') {
      return { success: false, error: 'API 요청 시간 초과 (30초)' };
    }
    return { success: false, error: e.message };
  }
}
```

- [ ] **Step 4: 테스트 실행 (통과 확인)**

```bash
node --test tests/api.test.js
```

Expected: PASS — 3 tests passed

- [ ] **Step 5: 커밋**

```bash
git add lib/api.js tests/api.test.js
git commit -m "feat: api.js — REST API 호출 공통 모듈 (timeout, 오류 처리)"
```

---

## Task 4: init.js — Claude Code MCP 설정 자동 추가

**Files:**
- Create: `lib/init.js`
- Create: `tests/init.test.js`

- [ ] **Step 1: 테스트 작성**

```js
// tests/init.test.js
import { strict as assert } from 'assert';
import { test } from 'node:test';
import { init } from '../lib/init.js';

test('init - 함수로 export 되어 있음', () => {
  assert.equal(typeof init, 'function');
});
```

- [ ] **Step 2: 테스트 실행 (실패 확인)**

```bash
node --test tests/init.test.js
```

Expected: FAIL

- [ ] **Step 3: lib/init.js 구현**

```js
// lib/init.js
import inquirer from 'inquirer';
import { saveMcpConfig, readClaudeConfig } from './config.js';

export async function init() {
  console.log('\n다이사 Claude Code 플러그인 설정\n');

  // 기존 설정 확인
  const config = readClaudeConfig();
  const existingDa24 = config?.mcpServers?.da24;

  if (existingDa24) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: '이미 da24 MCP 설정이 있습니다. 덮어쓸까요?',
        default: false,
      },
    ]);
    if (!overwrite) {
      console.log('취소됐습니다.');
      return;
    }
  }

  const { apiKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: 'API 키 입력 (이사 접수 기능 사용 시 필요, 없으면 엔터):',
    },
  ]);

  const key = apiKey.trim() || null;

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `~/.claude.json에 da24 MCP 설정을 추가합니다. 계속할까요?`,
      default: true,
    },
  ]);

  if (!confirm) {
    console.log('취소됐습니다.');
    return;
  }

  saveMcpConfig(key);

  console.log('\n✅ 설정 완료!');
  console.log('Claude Code를 재시작하고 아래처럼 써보세요:\n');
  console.log('  /da24 원룸 이사 견적 계산해줘');
  console.log('  /da24 접수해줘. 홍길동, 010-1234-5678, 2026-05-01, 서울 강남구 → 경기 성남시\n');

  if (!key) {
    console.log('💡 이사 접수 기능을 사용하려면 API 키가 필요합니다.');
    console.log('   문의: lonnie@da24.co.kr\n');
  }
}
```

- [ ] **Step 4: 테스트 실행 (통과 확인)**

```bash
node --test tests/init.test.js
```

Expected: PASS

- [ ] **Step 5: 수동 테스트**

```bash
node bin/da24.js init
```

Expected: 대화형 프롬프트 → ~/.claude.json 업데이트 확인

- [ ] **Step 6: 커밋**

```bash
git add lib/init.js tests/init.test.js
git commit -m "feat: init.js — Claude Code MCP 설정 자동 추가 (덮어쓰기 확인 포함)"
```

---

## Task 5: items.js + estimate.js — 대화형 견적 계산

**Files:**
- Create: `lib/items.js`
- Create: `lib/estimate.js`

- [ ] **Step 1: lib/items.js 생성**

```js
// lib/items.js
export const CATEGORIES = [
  { name: '침대', options: ['싱글', '슈퍼싱글', '더블', '퀸', '킹', '싱글(프레임없음)', '슈퍼싱글(프레임없음)', '더블(프레임없음)', '퀸(프레임없음)', '킹(프레임없음)'] },
  { name: '옷장', options: ['100cm미만', '100~150cm', '150~200cm', '200cm초과'] },
  { name: '소파', options: ['1~2인용', '3~4인용'] },
  { name: '냉장고', options: ['미니', '일반형', '양문형'] },
  { name: '세탁기', options: ['통돌이15kg이하', '통돌이15kg초과', '드럼15kg이하', '드럼15kg초과'] },
  { name: '건조기', options: ['15kg이하', '15kg초과'] },
  { name: '에어컨', options: ['스탠드형', '벽걸이형'] },
  { name: '책상', options: ['사각1~2인용', '사각3~4인용', '원형1~2인용', '원형3~4인용'] },
  { name: '의자', options: ['등받이', '보조'] },
  { name: '테이블', options: ['사각1~2인용', '사각3~4인용', '원형1~2인용', '원형3~4인용'] },
  { name: '화장대', options: ['좌식', '일반'] },
  { name: '수납장', options: ['신발장', '진열장', 'TV장식장'] },
  { name: '서랍장', options: ['3단이하', '4단이상'] },
  { name: 'TV', options: ['일반', '벽걸이'] },
  { name: '모니터', options: ['일반'] },
  { name: '의류관리기', options: ['일반'] },
  { name: '전자레인지', options: ['일반'] },
  { name: '정수기', options: ['일반'] },
  { name: '가스레인지', options: ['일반'] },
  { name: '비데', options: ['일반'] },
  { name: '공기청정기', options: ['일반'] },
  { name: '캣타워', options: ['일반'] },
  { name: '운동용품', options: ['일반'] },
  { name: '잔짐박스', options: ['1~6개', '6~11개', '11~16개', '16~21개', '21~26개', '26~31개', '31~36개', '36~41개', '41~46개', '46~51개', '51~56개', '56~61개'] },
];
```

- [ ] **Step 2: lib/estimate.js 구현**

```js
// lib/estimate.js
import inquirer from 'inquirer';
import { CATEGORIES } from './items.js';
import { callEstimate } from './api.js';

async function selectItemOption(categoryName) {
  const category = CATEGORIES.find(c => c.name === categoryName);

  const { option } = await inquirer.prompt([
    {
      type: 'list',
      name: 'option',
      message: `${categoryName} 옵션:`,
      choices: category.options,
    },
  ]);

  const { quantity } = await inquirer.prompt([
    {
      type: 'number',
      name: 'quantity',
      message: `${categoryName} 수량:`,
      default: 1,
      validate: (v) => (v > 0) || '1 이상 입력하세요.',
    },
  ]);

  return { item: `${categoryName}:${option}`, quantity };
}

export async function estimate() {
  console.log('\n이사 견적 계산\n');

  const { selectedCategories } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedCategories',
      message: '짐 항목을 선택하세요 (스페이스로 선택, 엔터로 확인):',
      choices: CATEGORIES.map(c => c.name),
      validate: (v) => v.length > 0 || '최소 1개 이상 선택하세요.',
    },
  ]);

  const items = [];
  for (const categoryName of selectedCategories) {
    const item = await selectItemOption(categoryName);
    items.push(item);
  }

  const { needPacking } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'needPacking',
      message: '포장 서비스가 필요하신가요?',
      default: false,
    },
  ]);

  console.log('\n견적 계산 중...\n');
  const result = await callEstimate(items, needPacking);

  if (!result.success) {
    console.error(`❌ 오류: ${result.error}`);
    return;
  }

  console.log(`💰 예상 견적: ${result.estimated_price?.toLocaleString()}원`);
  if (result.recommend_family_moving) {
    console.log('⚠️  짐 규모가 커서 가정이사를 권장합니다.');
  }
  console.log(`\n${result.cta}\n`);
}
```

- [ ] **Step 3: 수동 테스트**

```bash
node bin/da24.js estimate
```

Expected: 대화형 메뉴 → 견적 결과 출력

- [ ] **Step 4: 커밋**

```bash
git add lib/items.js lib/estimate.js
git commit -m "feat: estimate.js — 대화형 짐 선택 및 견적 계산"
```

---

## Task 6: inquiry.js — 대화형 이사 접수

**Files:**
- Create: `lib/inquiry.js`

- [ ] **Step 1: lib/inquiry.js 구현**

```js
// lib/inquiry.js
import inquirer from 'inquirer';
import { callInquiry } from './api.js';
import { getApiKey } from './config.js';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

async function promptPersonalInfo() {
  return inquirer.prompt([
    { type: 'input', name: 'name', message: '이름:', validate: v => !!v.trim() || '필수 입력' },
    { type: 'input', name: 'tel', message: '연락처 (예: 010-1234-5678):', validate: v => !!v.trim() || '필수 입력' },
  ]);
}

async function promptMovingType() {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'moving_type',
      message: '이사 유형:',
      choices: ['가정이사', '원룸이사', '사무실이사', '보관이사', '용달이사'],
    },
  ]);
}

async function promptMovingDate() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'moving_date',
      message: '이사 날짜 (YYYY-MM-DD 또는 "미정"):',
      validate: v => v === '미정' || DATE_REGEX.test(v) || 'YYYY-MM-DD 형식 또는 "미정" 입력',
      filter: v => v === '미정' ? 'undecided' : v,
    },
  ]);
}

async function promptAddress(label) {
  return inquirer.prompt([
    { type: 'input', name: 'sido', message: `${label} 시/도 (예: 서울):`, validate: v => !!v.trim() || '필수 입력' },
    { type: 'input', name: 'gugun', message: `${label} 구/군 (예: 강남구):`, validate: v => !!v.trim() || '필수 입력' },
  ]);
}

export async function inquiry() {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.log('\n⚠️  이사 접수에는 API 키가 필요합니다.');
    console.log('   npx da24 init 을 실행하여 API 키를 설정하세요.');
    console.log('   API 키 발급 문의: lonnie@da24.co.kr\n');
    return;
  }

  console.log('\n이사 접수\n');

  const personal = await promptPersonalInfo();
  const { moving_type } = await promptMovingType();
  const { moving_date } = await promptMovingDate();
  const from = await promptAddress('출발지');
  const to = await promptAddress('도착지');

  const { memo } = await inquirer.prompt([
    { type: 'input', name: 'memo', message: '메모 (선택):' },
  ]);

  const payload = {
    name: personal.name,
    tel: personal.tel,
    moving_type,
    moving_date,
    sido: from.sido,
    gugun: from.gugun,
    sido2: to.sido,
    gugun2: to.gugun,
    memo: memo || '',
  };

  console.log('\n접수 중...\n');
  const result = await callInquiry(payload, apiKey);

  if (result.success) {
    console.log(`✅ 접수 완료! 접수 번호: ${result.inquiry_id}`);
    console.log('다이사(https://da24.co.kr)에서 업체 견적을 확인하세요.\n');
  } else {
    console.error(`❌ 접수 실패: ${result.error}\n`);
  }
}
```

- [ ] **Step 2: 수동 테스트 (API 키 없을 때)**

```bash
node bin/da24.js inquiry
```

Expected: API 키 없다는 안내 메시지

- [ ] **Step 3: 커밋**

```bash
git add lib/inquiry.js
git commit -m "feat: inquiry.js — 대화형 이사 접수 (날짜 유효성 검증 포함)"
```

---

## Task 7: skills/da24.md — Claude Code slash command 스킬

**Files:**
- Create: `skills/da24.md`

- [ ] **Step 1: skills 디렉토리 생성 및 da24.md 작성**

```bash
mkdir -p skills
```

```markdown
---
name: da24
description: 다이사 이사 견적 계산 및 접수. 사용자가 이사 견적을 묻거나 접수를 요청할 때 사용.
---

# 다이사 이사 견적 상담

## 역할
다이사(da24.co.kr) MCP 서버의 calculate_estimate / create_inquiry 툴을 사용하여
이사 견적을 계산하고 접수를 처리한다.

## 견적 계산

사용자가 짐 목록을 말하면 calculate_estimate 툴을 호출한다.
짐 항목은 "카테고리:옵션" 형식으로 변환한다.

**사용자 표현 변환 가이드:**
- 침대: 싱글|슈퍼싱글|더블|퀸|킹
- 옷장: 100cm미만|100~150cm|150~200cm|200cm초과
- 소파: 1~2인용|3~4인용
- 냉장고: 미니|일반형|양문형
- 세탁기: 통돌이15kg이하|통돌이15kg초과|드럼15kg이하|드럼15kg초과
- 잔짐박스: 1~6개|6~11개|... (5개 단위)

견적 결과에는 반드시 cta 필드의 다이사 링크를 포함한다.
이후 접수 방법 선택지를 제시한다:
1. AI 접수: 이름, 연락처, 날짜, 주소 제공 시 바로 접수
2. 직접 접수: https://da24.co.kr

## 이사 접수

사용자가 접수를 원하면 create_inquiry 툴을 호출한다.
필수 정보: 이름, 연락처, 이사유형, 날짜, 출발지(시/도, 구/군), 도착지(시/도, 구/군)
날짜 미정 시: moving_date = "undecided"
```

- [ ] **Step 2: 커밋**

```bash
git add skills/da24.md
git commit -m "feat: skills/da24.md — Claude Code slash command 스킬 추가"
```

---

## Task 8: README 및 npm 배포 준비

**Files:**
- Create: `README.md`

- [ ] **Step 1: README.md 작성**

```markdown
# da24 — 다이사 이사 견적 CLI

AI에서 이사 견적을 계산하고 접수할 수 있는 CLI 도구입니다.

## 설치 (Claude Code)

\`\`\`bash
npx da24 init
\`\`\`

Claude Code를 재시작하면 `/da24` 명령어를 바로 사용할 수 있습니다.

## 사용법

### Claude Code에서
\`\`\`
/da24 원룸 이사 견적 계산해줘
/da24 접수해줘. 홍길동, 010-1234-5678, 2026-05-01, 서울 강남구 → 경기 성남시
\`\`\`

### 터미널에서
\`\`\`bash
npx da24 estimate   # 견적 계산
npx da24 inquiry    # 이사 접수 (API 키 필요)
\`\`\`

## API 키

이사 접수 기능을 사용하려면 API 키가 필요합니다.
발급 문의: lonnie@da24.co.kr

## 관련 링크

- [다이사](https://da24.co.kr)
- [MCP 서버](https://github.com/marketdesigners/da24-mcp-server)
```

- [ ] **Step 2: 전체 테스트 실행**

```bash
node --test tests/*.test.js
```

Expected: 전체 PASS

- [ ] **Step 3: npm pack dry-run**

```bash
npm pack --dry-run
```

Expected: 패키지 파일 목록 출력, `node_modules` 미포함 확인

- [ ] **Step 4: 최종 커밋 및 푸시**

```bash
git add README.md
git commit -m "docs: README 및 npm 배포 준비"
git push origin main
```

---

## 완료 후 npm 배포

```bash
npm login
npm publish
```

배포 후 `npx da24 init` 으로 즉시 사용 가능.
