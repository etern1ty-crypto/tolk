/**
 * Ищет CSS-переменные, которые где-то используются, но нигде не объявлены.
 *
 * Такой промах не роняет ни сборку, ни браузер: var(--нет-такой) молча
 * подставляет унаследованное значение. Из-за одной опечатки — var(--bg)
 * вместо var(--bg-primary) — главная кнопка на пустом экране чатов месяцами
 * рисовалась белым по белому, то есть отсутствовала.
 *
 * Запуск: node scripts/check-css-vars.mjs
 */
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

const files = globSync('src/**/*.{css,tsx,ts}');

const declared = new Set();
const used = new Map(); // имя -> где встретилось

for (const file of files) {
  const text = readFileSync(file, 'utf8');

  // Объявление: --имя: значение
  for (const m of text.matchAll(/(--[\w-]+)\s*:/g)) declared.add(m[1]);

  // Использование. Запасное значение (var(--x, чёрный)) снимает вопрос:
  // автор уже предусмотрел отсутствие переменной.
  for (const m of text.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
    if (!used.has(m[1])) used.set(m[1], []);
    used.get(m[1]).push(file);
  }
}

const missing = [...used.keys()].filter((name) => !declared.has(name)).sort();

if (missing.length === 0) {
  console.log(`✅ переменные CSS на месте (объявлено ${declared.size})`);
  process.exit(0);
}

console.error('❌ используются, но нигде не объявлены:\n');
for (const name of missing) {
  console.error(`  ${name}`);
  for (const file of [...new Set(used.get(name))]) console.error(`      ${file}`);
}
console.error('\nЛибо опечатка в имени, либо нужно запасное значение: var(--имя, запас)');
process.exit(1);
