<div align="center">

<a href="https://da24.co.kr"><img src="./assets/logo.png" alt="다이사 CLI" width="120" height="120"></a>
<br>

## [da24-cli — 다이사 이사 견적 CLI](https://da24.co.kr)

AI에서 이사 견적을 계산하고 접수할 수 있는 CLI 도구입니다.<br>
Claude Code slash command `/da24`를 한 번에 설치합니다.

<br>

[![npm](https://img.shields.io/npm/v/da24-cli.svg)](https://www.npmjs.com/package/da24-cli)
[![Node](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![Claude Code](https://img.shields.io/badge/Claude_Code-slash_command-D4A27F?logo=anthropic&logoColor=white)](https://claude.ai/code)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

</div>

---

## 설치

```bash
npx da24-cli init
```

Claude Code를 재시작하면 `/da24` slash command를 바로 사용할 수 있습니다.

<br>

---

## 사용법

### ![Claude Code](https://img.shields.io/badge/Claude_Code-D4A27F?logo=anthropic&logoColor=white) Claude Code slash command

> Claude Code 채팅창에서 `/da24`를 입력하세요. 터미널 명령어가 아닙니다.

```
/da24 원룸 이사 견적 계산해줘
```
```
/da24 침대(퀸) 1개, 냉장고(양문형) 1개, 드럼세탁기, 소파(3~4인용) 있어. 견적 알려줘
```
```
/da24 접수해줘. 홍길동, 010-1234-5678, 2026-05-01, 서울 강남구 → 경기 성남시
```

<br>

### 터미널 CLI

```bash
npx da24-cli estimate   # 대화형 견적 계산
npx da24-cli inquiry    # 대화형 이사 접수 (API 키 필요)
```

<br>

---

## 제공 기능

| 기능 | 설명 | API 키 |
|------|------|:------:|
| 견적 계산 | 짐 목록으로 소형이사 예상 견적 계산 | 불필요 |
| 이사 접수 | 다이사 플랫폼에 이사 견적 문의 접수 | 필요 |

<br>

---

## API 키

이사 접수 기능을 사용하려면 API 키가 필요합니다.
견적 계산은 API 키 없이도 사용 가능합니다.

> API 키 발급 문의: [lonnie@da24.co.kr](mailto:lonnie@da24.co.kr)

<br>

---

<div align="center">

[다이사](https://da24.co.kr) · [MCP 서버](https://github.com/marketdesigners/da24-mcp-server) · MIT License

</div>
