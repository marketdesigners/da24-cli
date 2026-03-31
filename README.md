# da24-cli — 다이사 이사 견적 CLI

AI에서 이사 견적을 계산하고 접수할 수 있는 CLI 도구입니다.
Claude Code slash command `/da24`를 자동으로 설치합니다.

## 설치

```bash
npx da24-cli init
```

Claude Code를 재시작하면 `/da24` slash command를 바로 사용할 수 있습니다.

## 사용법

### Claude Code에서

```
/da24 원룸 이사 견적 계산해줘
/da24 접수해줘. 홍길동, 010-1234-5678, 2026-05-01, 서울 강남구 → 경기 성남시
```

> `/da24`는 Claude Code 채팅창에서 입력하는 slash command입니다. 터미널 명령어가 아닙니다.

### 터미널에서

```bash
npx da24-cli estimate   # 견적 계산
npx da24-cli inquiry    # 이사 접수 (API 키 필요)
```

## API 키

이사 접수 기능(`create_inquiry`)을 사용하려면 API 키가 필요합니다.
견적 계산(`calculate_estimate`)은 API 키 없이도 사용 가능합니다.

발급 문의: lonnie@da24.co.kr

## 관련 링크

- [다이사](https://da24.co.kr)
- [MCP 서버](https://github.com/marketdesigners/da24-mcp-server)
