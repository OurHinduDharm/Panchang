import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(new URL('../scripts/audit-annual-publication-readiness.mjs', import.meta.url));
const years = [2026, 2027, 2028, 2029, 2030];

async function createCompleteFixture(root) {
  for (const year of years) {
    for (let month = 1; month <= 12; month += 1) {
      const directory = path.join(root, 'data', 'festivals');
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(
        path.join(directory, `${year}-${String(month).padStart(2, '0')}.json`),
        JSON.stringify({ year, month, status: 'approved', events: [] })
      );
    }

    const annualDirectory = path.join(root, 'data');
    const dwadashiDirectory = path.join(root, 'data', 'dwadashi');
    const chaturmasDirectory = path.join(root, 'data', 'chaturmas');
    await Promise.all([
      fs.mkdir(dwadashiDirectory, { recursive: true }),
      fs.mkdir(chaturmasDirectory, { recursive: true })
    ]);
    await fs.writeFile(
      path.join(annualDirectory, `ohd-annual-panchang-review-${year}.json`),
      JSON.stringify({ calculationStatus: 'approved' })
    );
    await fs.writeFile(
      path.join(dwadashiDirectory, `${year}.json`),
      JSON.stringify({ status: 'approved' })
    );
    await fs.writeFile(
      path.join(chaturmasDirectory, `${year}.json`),
      JSON.stringify({ status: 'approved' })
    );
  }
}

test('annual readiness audit passes a complete approved fixture', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ohd-annual-audit-'));
  try {
    await createCompleteFixture(root);
    const run = spawnSync(process.execPath, [scriptPath, root], { encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr || run.stdout);
    const report = JSON.parse(run.stdout);
    assert.equal(report.totalIssues, 0);
    assert.equal(report.years.length, 5);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('annual readiness audit reports missing annual data without approving it', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ohd-annual-audit-'));
  try {
    await createCompleteFixture(root);
    await fs.rm(path.join(root, 'data', 'dwadashi', '2028.json'));
    const run = spawnSync(process.execPath, [scriptPath, root], { encoding: 'utf8' });
    assert.equal(run.status, 1);
    const report = JSON.parse(run.stdout);
    const issue = report.reports.find(year => year.year === 2028)
      .issues.find(item => item.code === 'dwadashi-missing');
    assert.ok(issue, 'expected missing 2028 Dwadashi data to be reported');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
