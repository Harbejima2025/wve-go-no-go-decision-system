const fs = require('fs');
const path = require('path');

// Directory containing all user responses
const responsesDir = path.join(__dirname, 'responses');
const outputFile = path.join(__dirname, 'consolidated.md');

// Initialize final content
let report = `# Consolidated Go/No-Go Responses\n\nGenerated on: ${new Date().toLocaleString()}\n\n`;

// Get all .json files in the responses directory
const files = fs.readdirSync(responsesDir).filter(file => file.endsWith('.json'));

if (files.length === 0) {
  console.log('⚠️ No response files found in /responses folder.');
  process.exit(1);
}

// Sort files by submission time (if needed)
files.sort();

files.forEach((file, index) => {
  const filePath = path.join(responsesDir, file);
  const rawData = fs.readFileSync(filePath);
  const data = JSON.parse(rawData);

  const name = data.name || `Respondent ${index + 1}`;
  const office = data.office || 'Unknown Office';
  const submittedAt = data.submitted_at || 'Unknown time';

  report += `---\n\n## 📌 ${name} (${office})\n📅 Submitted: ${submittedAt}\n\n`;

  Object.entries(data).forEach(([key, value]) => {
    if (['name', 'position', 'office', 'date', 'submitted_at'].includes(key)) return;

    // Format question and answer
    const question = key.replace(/_/g, ' ').replace(/\bq(\d_\d(_\d)?)\b/g, 'Question $1');
    report += `### ${question}\n${value}\n\n`;
  });
});

fs.writeFileSync(outputFile, report);
console.log(`✅ Consolidated report saved to ${outputFile}`);
