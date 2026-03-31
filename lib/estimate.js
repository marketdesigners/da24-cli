import inquirer from 'inquirer';
import { CATEGORIES } from './items.js';
import { callEstimate } from './api.js';

async function selectItemOption(categoryName) {
  const category = CATEGORIES.find(c => c.name === categoryName);
  if (!category) throw new Error(`알 수 없는 짐 항목: ${categoryName}`);

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
      validate: (v) => (Number.isFinite(v) && v > 0) || '1 이상의 숫자를 입력하세요.',
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
  if (result.cta) console.log(`\n${result.cta}\n`);
}
