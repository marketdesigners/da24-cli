import inquirer from 'inquirer';
import { saveMcpConfig, readClaudeConfig } from './config.js';

export async function init() {
  console.log('\n다이사 Claude Code 플러그인 설정\n');

  // 기존 설정 확인 (saveMcpConfig 호출 전에 확인)
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
      type: 'password',
      mask: '*',
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

  try {
    saveMcpConfig(key);
  } catch (e) {
    console.error(`\n설정 저장 실패: ${e.message}`);
    return;
  }

  console.log('\n✅ 설정 완료!');
  console.log('Claude Code를 재시작하면 /da24 slash command를 사용할 수 있습니다.\n');
  console.log('📌 Claude Code 채팅창에서:');
  console.log('  /da24 원룸 이사 견적 계산해줘');
  console.log('  /da24 접수해줘. 홍길동, 010-1234-5678, 2026-05-01, 서울 강남구 → 경기 성남시\n');
  console.log('📌 터미널에서:');
  console.log('  npx da24-cli estimate   # 견적 계산');
  console.log('  npx da24-cli inquiry    # 이사 접수\n');

  if (!key) {
    console.log('💡 이사 접수 기능을 사용하려면 API 키가 필요합니다.');
    console.log('   문의: lonnie@da24.co.kr\n');
  }
}
