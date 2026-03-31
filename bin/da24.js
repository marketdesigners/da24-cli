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
