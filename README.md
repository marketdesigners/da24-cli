# da24 — 다이사 이사 견적 CLI

AI에서 이사 견적을 계산하고 접수할 수 있는 CLI 도구입니다.

## 설치 (Claude Code)

```bash
npx da24 init
```

Claude Code를 재시작하면 `/da24` 명령어를 바로 사용할 수 있습니다.

## 사용법

### Claude Code에서
```
/da24 원룸 이사 견적 계산해줘
/da24 접수해줘. 홍길동, 010-1234-5678, 2026-05-01, 서울 강남구 → 경기 성남시
```

### 터미널에서
```bash
npx da24 estimate   # 견적 계산
npx da24 inquiry    # 이사 접수 (API 키 필요)
```

## API 키

이사 접수 기능을 사용하려면 API 키가 필요합니다.
발급 문의: lonnie@da24.co.kr

## 관련 링크

- [다이사](https://da24.co.kr)
- [MCP 서버](https://github.com/marketdesigners/da24-mcp-server)
