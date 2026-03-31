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
      validate: v => {
        if (v === '미정') return true;
        if (!DATE_REGEX.test(v)) return 'YYYY-MM-DD 형식 또는 "미정" 입력';
        const d = new Date(v);
        return (d instanceof Date && !isNaN(d) && d.toISOString().startsWith(v))
          || '유효하지 않은 날짜입니다 (예: 2026-05-01)';
      },
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
