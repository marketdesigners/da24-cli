#!/usr/bin/env node

const command = process.argv[2];

try {
  switch (command) {
    case 'init': {
      const { init } = await import('../lib/init.js');
      await init();
      break;
    }
    case 'estimate': {
      const { estimate } = await import('../lib/estimate.js');
      await estimate();
      break;
    }
    case 'inquiry': {
      const { inquiry } = await import('../lib/inquiry.js');
      await inquiry();
      break;
    }
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
