import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'out');
mkdirSync(outDir, { recursive: true });

// [파일, 캔버스 폭, 출력명]  — 높이는 .canvas 실제 높이로 자동
const jobs = [
  ['main-652x488.html', 652, '00-main'],
  ['detail-01-hook.html', 1000, '01-hook'],
  ['detail-02-problem.html', 1000, '02-problem'],
  ['detail-03-solution.html', 1000, '03-solution'],
  ['detail-04-interaction.html', 1000, '04-interaction'],
  ['detail-05-demos.html', 1000, '05-demos'],
  ['detail-06-responsive.html', 1000, '06-responsive'],
  ['detail-07-packages.html', 1000, '07-packages'],
  ['detail-08-process.html', 1000, '08-process'],
  ['detail-09-closing.html', 1000, '09-closing'],
];

const browser = await chromium.launch();
// 메인은 1배(크몽 규격 652×488 정확), 상세는 2배(선명도, 폭 2000=허용 상한 내)
const page1 = await browser.newPage({ deviceScaleFactor: 1 });
const page2 = await browser.newPage({ deviceScaleFactor: 1.5 });

for (const [file, width, name] of jobs) {
  const page = name === '00-main' ? page1 : page2;
  await page.setViewportSize({ width, height: 800 });
  await page.goto(pathToFileURL(join(__dirname, file)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const el = await page.$('.canvas');
  const box = await el.boundingBox();
  const out = join(outDir, `${name}.png`);
  await el.screenshot({ path: out });
  console.log(`✓ ${name}.png  (${Math.round(box.width)}×${Math.round(box.height)} @2x)`);
}

await browser.close();
console.log('\n완료 → docs/images/out/');
