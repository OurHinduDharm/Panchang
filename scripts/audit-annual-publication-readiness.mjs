#!/usr/bin/env node
/**
 * Read-only preflight audit for the published 2026–2030 festival calendar.
 *
 * This tool does not calculate or approve observance dates. It checks that the
 * expected source files exist, are valid JSON, and carry explicit review
 * metadata. A passing file-level check is not a substitute for Drik Panchang
 * or shastric review.
 *
 * Usage: node scripts/audit-annual-publication-readiness.mjs [repo-root]
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.cwd());
const years = [2026, 2027, 2028, 2029, 2030];
const monthNames = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

async function readJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  let raw;
  try {
    raw = await fs.readFile(absolutePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return { state: 'missing' };
    throw error;
  }
  if (!raw.trim()) return { state: 'empty' };
  try {
    return { state: 'ok', value: JSON.parse(raw) };
  } catch (error) {
    return { state: 'invalid-json', error: error.message };
  }
}

function addIssue(issues, code, file, detail) {
  issues.push({ code, file, detail });
}

function auditMonth(year, month, file, result, issues) {
  if (result.state !== 'ok') {
    addIssue(issues, `month-${result.state}`, file,
      result.error || `Expected ${year}–${monthNames[month - 1]} JSON`);
    return { status: result.state, events: 0, reviewStatuses: {} };
  }

  const data = result.value;
  const events = Array.isArray(data.events) ? data.events : [];
  const reviewStatuses = {};
  if (data.year !== year || data.month !== month) {
    addIssue(issues, 'month-period-mismatch', file,
      `File is ${year}-${String(month).padStart(2, '0')}, metadata says ${data.year}-${data.month}`);
  }
  if (!Array.isArray(data.events)) {
    addIssue(issues, 'events-not-array', file, 'Expected an events array');
  }
  if (!data.status || data.status !== 'approved') {
    addIssue(issues, 'month-not-approved', file, `status=${data.status || 'missing'}`);
  }

  const sameDateTitles = new Map();
  for (const [index, event] of events.entries()) {
    const label = `${file}#events[${index}]`;
    const status = event.reviewStatus || 'missing';
    reviewStatuses[status] = (reviewStatuses[status] || 0) + 1;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date || '')) {
      addIssue(issues, 'invalid-event-date', label, `date=${event.date || 'missing'}`);
    } else {
      const date = new Date(`${event.date}T00:00:00Z`);
      if (Number.isNaN(date.getTime()) ||
          date.toISOString().slice(0, 10) !== event.date ||
          !event.date.startsWith(`${year}-${String(month).padStart(2, '0')}-`)) {
        addIssue(issues, 'event-date-outside-file-month', label, `date=${event.date}`);
      }
    }

    if (!event.title || !event.description) {
      addIssue(issues, 'missing-public-copy', label,
        `title=${Boolean(event.title)}, description=${Boolean(event.description)}`);
    }
    if (status !== 'approved') {
      addIssue(issues, 'event-not-approved', label, `reviewStatus=${status}`);
    }

    const url = typeof event.articleUrl === 'string' ? event.articleUrl.trim() : '';
    const articleLabel = typeof event.articleLabel === 'string' ? event.articleLabel.trim() : '';
    if (Boolean(url) !== Boolean(articleLabel)) {
      addIssue(issues, 'incomplete-article-link', label,
        `articleUrl=${Boolean(url)}, articleLabel=${Boolean(articleLabel)}`);
    }
    if (url && !/^https?:\/\//i.test(url)) {
      addIssue(issues, 'invalid-article-url', label, url);
    }

    const key = `${event.date || 'no-date'}::${event.title || 'no-title'}`;
    sameDateTitles.set(key, (sameDateTitles.get(key) || 0) + 1);
  }
  for (const [key, count] of sameDateTitles) {
    if (count > 1) addIssue(issues, 'duplicate-same-date-title', file, `${key} × ${count}`);
  }

  return { status: data.status || 'missing', events: events.length, reviewStatuses };
}

async function auditYear(year) {
  const issues = [];
  const months = [];
  let totalEvents = 0;
  const totalReviewStatuses = {};

  for (let month = 1; month <= 12; month += 1) {
    const file = `data/festivals/${year}-${String(month).padStart(2, '0')}.json`;
    const result = await readJson(file);
    const summary = auditMonth(year, month, file, result, issues);
    months.push({ month, ...summary });
    totalEvents += summary.events;
    for (const [status, count] of Object.entries(summary.reviewStatuses)) {
      totalReviewStatuses[status] = (totalReviewStatuses[status] || 0) + count;
    }
  }

  const annualPath = `data/ohd-annual-panchang-review-${year}.json`;
  const annual = await readJson(annualPath);
  if (annual.state !== 'ok') {
    addIssue(issues, `annual-review-${annual.state}`, annualPath,
      annual.error || 'Annual Panchang review export is missing, empty, or invalid');
  } else if (annual.value.calculationStatus !== 'approved') {
    addIssue(issues, 'annual-calculation-not-approved', annualPath,
      `calculationStatus=${annual.value.calculationStatus || 'missing'}`);
  }

  const dwadashiPath = `data/dwadashi/${year}.json`;
  const dwadashi = await readJson(dwadashiPath);
  if (dwadashi.state !== 'ok') {
    addIssue(issues, `dwadashi-${dwadashi.state}`, dwadashiPath,
      dwadashi.error || 'Annual Dwadashi JSON is missing, empty, or invalid');
  } else if (dwadashi.value.status !== 'approved') {
    addIssue(issues, 'dwadashi-not-approved', dwadashiPath,
      `status=${dwadashi.value.status || 'missing'}`);
  }

  const chaturmasPath = `data/chaturmas/${year}.json`;
  const chaturmas = await readJson(chaturmasPath);
  if (chaturmas.state !== 'ok') {
    addIssue(issues, `chaturmas-${chaturmas.state}`, chaturmasPath,
      chaturmas.error || 'Annual Chaturmas JSON is missing, empty, or invalid');
  } else if (chaturmas.value.status !== 'approved') {
    addIssue(issues, 'chaturmas-not-approved', chaturmasPath,
      `status=${chaturmas.value.status || 'missing'}`);
  }

  return {
    year,
    totalEvents,
    monthlyReviewStatuses: totalReviewStatuses,
    months,
    annualReviewState: annual.state,
    dwadashiState: dwadashi.state,
    chaturmasState: chaturmas.state,
    issueCount: issues.length,
    issues
  };
}

const reports = [];
for (const year of years) reports.push(await auditYear(year));

const summary = {
  audit: 'read-only; does not calculate dates or approve records',
  years: reports.map(({ year, totalEvents, monthlyReviewStatuses, annualReviewState,
    dwadashiState, chaturmasState, issueCount }) => ({
    year, totalEvents, monthlyReviewStatuses, annualReviewState,
    dwadashiState, chaturmasState, issueCount
  })),
  totalIssues: reports.reduce((sum, report) => sum + report.issueCount, 0),
  reports
};

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
if (summary.totalIssues > 0) process.exitCode = 1;
