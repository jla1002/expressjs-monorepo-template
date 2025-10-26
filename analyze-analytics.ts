import * as fs from 'node:fs';
import * as path from 'node:path';

const analyticsDir = '.claude/analytics';

// Deduplicate CSV by taking only odd-numbered data rows (skip duplicates)
function deduplicate(csvContent: string): string[][] {
  const lines = csvContent.trim().split('\n');

  
  const dataRows = lines.slice(2).filter((_, idx) => idx % 2 === 0);

  return dataRows.map(line => line.split(','));
}

// Read and parse commits
const commitsContent = fs.readFileSync(path.join(analyticsDir, 'commits.csv'), 'utf-8');
const commits = deduplicate(commitsContent);

// Read and parse costs
const costsContent = fs.readFileSync(path.join(analyticsDir, 'costs.csv'), 'utf-8');
const costs = deduplicate(costsContent);

// Read and parse sessions
const sessionsContent = fs.readFileSync(path.join(analyticsDir, 'sessions.csv'), 'utf-8');
const sessions = deduplicate(sessionsContent);

console.log('=== ANALYTICS METRICS ===\n');

// Session metrics
const latestSession = sessions[sessions.length - 1];
const sessionTotalCost = parseFloat(latestSession[9]);
const turnCount = parseInt(latestSession[8]);

console.log('SESSION METRICS:');
console.log(`Total Cost: $${sessionTotalCost.toFixed(6)}`);
console.log(`Turn Count: ${turnCount}`);
console.log(`Cost per Turn: $${(sessionTotalCost / turnCount).toFixed(6)}`);
console.log();

// Cost breakdown by turn
console.log('COST BY TURN:');
let totalFromTurns = 0;
costs.forEach(row => {
  const turnNum = row[2];
  const cost = parseFloat(row[9]);
  totalFromTurns += cost;
  console.log(`Turn ${turnNum}: $${cost.toFixed(6)}`);
});
console.log(`Sum of all turns: $${totalFromTurns.toFixed(6)}`);
console.log();

// Commit metrics
console.log('COMMIT METRICS:');
if (commits.length === 0) {
  console.log('No commits tracked yet');
} else {
  commits.forEach(row => {
    const sha = row[0].substring(0, 7);
    const message = row[5];
    const filesChanged = parseInt(row[8]);
    const insertions = parseInt(row[9]);
    const deletions = parseInt(row[10]);
    const totalLOC = parseInt(row[11]);

    console.log(`Commit: ${sha} - ${message}`);
    console.log(`  Files: ${filesChanged}, Lines: +${insertions}/-${deletions} (${totalLOC} total)`);
  });

  console.log();
  console.log('COST PER LOC (if commit was in this session):');
  commits.forEach(row => {
    const sha = row[0].substring(0, 7);
    const totalLOC = parseInt(row[11]);
    const costPerLOC = sessionTotalCost / totalLOC;
    console.log(`  ${sha}: $${costPerLOC.toFixed(6)} per line changed`);
  });
}

console.log();
console.log('TOKEN METRICS:');
let totalInputTokens = 0;
let totalOutputTokens = 0;
costs.forEach(row => {
  totalInputTokens += parseInt(row[4]);
  totalOutputTokens += parseInt(row[5]);
});
console.log(`Total Input Tokens: ${totalInputTokens}`);
console.log(`Total Output Tokens: ${totalOutputTokens}`);
console.log(`Total Tokens: ${totalInputTokens + totalOutputTokens}`);

if (commits.length > 0) {
  const totalLOC = commits.reduce((sum, row) => sum + parseInt(row[11]), 0);
  console.log(`Tokens per LOC: ${((totalInputTokens + totalOutputTokens) / totalLOC).toFixed(2)}`);
}
