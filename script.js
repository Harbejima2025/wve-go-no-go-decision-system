document.getElementById('goNoGoForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const form = e.target;
  const data = {};
  const elements = form.elements;

  // Check opportunity type selection
  const opportunityType = document.querySelector('input[name="opportunityType"]:checked');
  if (!opportunityType) {
    alert('Please select the Opportunity Type (Grant or Contract).');
    return;
  }
  data['Opportunity Type'] = opportunityType.value;

  // Collect form data & validate
  const selectValues = [];
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (el.name && !el.disabled) {
      if (el.type === 'radio') {
        if (el.checked) {
          data[el.name] = el.value;
        }
      } else if (el.tagName.toLowerCase() === 'select' || el.tagName.toLowerCase() === 'textarea' || el.type === 'text') {
        data[el.name] = el.value.trim();
      }
    }
  }

  // Validation for required select fields
  const requiredSelects = form.querySelectorAll('select[required]');
  for (const field of requiredSelects) {
    if (!data[field.name] || data[field.name] === '') {
      alert(`Please select a value for: ${field.previousElementSibling.textContent || field.name}`);
      field.focus();
      return;
    }
  }

  // Validation: For any select with "Must address" or "Success not possible", explanation textarea must be filled
  const criticalValues = ['Must address', 'Success not possible'];
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (el.tagName.toLowerCase() === 'select') {
      const val = el.value;
      if (criticalValues.includes(val)) {
        // Find corresponding explanation textarea
        const commentId = el.id + '_comment';
        const commentEl = document.getElementById(commentId);
        if (commentEl) {
          if (!commentEl.value.trim()) {
            alert(`Please provide explanation for: ${el.previousElementSibling.textContent || el.name} because it is marked as "${val}".`);
            commentEl.focus();
            return;
          }
        }
      }
    }
  }

  // Aggregation: count how many answers fall into each category
  const categoriesCount = {
    'Strength': 0,
    'Neutral': 0,
    'Weakness': 0,
    'Must address': 0,
    'Success not possible': 0,
    "Don't know": 0,
  };

  // Only count the select fields inside the form (skip opportunityType radios)
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (el.tagName.toLowerCase() === 'select' && el.name) {
      const val = el.value;
      if (categoriesCount.hasOwnProperty(val)) {
        categoriesCount[val]++;
      }
    }
  }

  // Build the summary string
  let summary = '--- Risk and Opportunity Summary ---\n';
  for (const [cat, count] of Object.entries(categoriesCount)) {
    summary += `${cat}: ${count}\n`;
  }
  summary += '\n';

  // Format the full output
  let output = 'Go/No-Go Decision Form Responses\n\n';
  output += `Opportunity Type: ${data['Opportunity Type']}\n\n`;
  output += summary;

  // Add detailed responses
  for (const key in data) {
    if (data.hasOwnProperty(key) && key !== 'Opportunity Type') {
      output += `${key}: ${data[key]}\n`;
    }
  }

  // Show summary to user in a confirm dialog
  const proceed = confirm(summary + '\nDo you want to download your responses?');
  if (!proceed) {
    return;
  }

  // Trigger file download
  const blob = new Blob([output], { type: 'text/plain' });
  const filename = `GoNoGo_Responses_${new Date().toISOString().slice(0, 10)}.txt`;

  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }, 0);
  }
});
