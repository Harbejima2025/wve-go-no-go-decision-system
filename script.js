document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('goNoGoForm');

  // Update summary panel on select change
  form.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', updateSummaryPanel);
  });

  updateSummaryPanel(); // initial call

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Simple validation: required selects must have value
    const requiredSelects = form.querySelectorAll('select[required]');
    for (const sel of requiredSelects) {
      if (!sel.value) {
        alert(`Please select a rating for: ${sel.previousElementSibling.textContent}`);
        sel.focus();
        return;
      }
    }

    // Collect form data
    const data = {};
    for (const element of form.elements) {
      if (element.name) {
        data[element.name] = element.value;
      }
    }

    // Confirm submission summary
    const summary = buildSummaryText(data);
    if (!confirm(`Please confirm your submission:\n\n${summary}`)) {
      return;
    }

    // Download JSON locally
    downloadJSON(data, 'GoNoGo_Submission.json');

    // Send to backend API
    await saveToServer(data);
  });

  function buildSummaryText(data) {
    let text = '';
    for (const [key, val] of Object.entries(data)) {
      if (key.endsWith('_comments') && val.trim() !== '') {
        const baseKey = key.replace('_comments', '');
        text += `${baseKey} comments: ${val}\n`;
      } else if (!key.endsWith('_comments')) {
        text += `${key}: ${val}\n`;
      }
    }
    return text;
  }

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function saveToServer(data) {
    try {
      const response = await fetch('https://your-server-url/api/save-to-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resJson = await response.json();
      if (response.ok) {
        alert('Data saved successfully to GitHub!');
      } else {
        alert('Failed to save data to server: ' + resJson.message);
      }
    } catch (err) {
      alert('Error connecting to server: ' + err.message);
    }
  }

  function updateSummaryPanel() {
    const elements = form.elements;
    const categoriesCount = {
      'Strength': 0,
      'Neutral': 0,
      'Weakness': 0,
      'Must address': 0,
      'Success not possible': 0,
      "Don't know": 0,
    };
    let totalRated = 0;

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (el.tagName.toLowerCase() === 'select' && el.name) {
        const val = el.value;
        if (categoriesCount.hasOwnProperty(val)) {
          categoriesCount[val]++;
          if (val !== "Don't know" && val !== "") {
            totalRated++;
          }
        }
      }
    }

    const summaryDiv = document.getElementById('summaryCounts');
    summaryDiv.innerHTML = '';

    const colors = {
      'Strength': 'green',
      'Neutral': 'goldenrod',
      'Weakness': 'orange',
      'Must address': 'red',
      'Success not possible': 'darkred',
      "Don't know": 'gray',
    };

    for (const [cat, count] of Object.entries(categoriesCount)) {
      const span = document.createElement('span');
      span.textContent = `${cat}: ${count}  `;
      span.style.color = colors[cat];
      span.style.fontWeight = (cat === 'Must address' || cat === 'Success not possible') ? 'bold' : 'normal';
      summaryDiv.appendChild(span);
    }

    const progressBar = document.getElementById('strengthProgress');
    if (totalRated > 0) {
      const percentStrength = (categoriesCount['Strength'] / totalRated) * 100;
      progressBar.value = percentStrength.toFixed(2);
    } else {
      progressBar.value = 0;
    }
  }
});
