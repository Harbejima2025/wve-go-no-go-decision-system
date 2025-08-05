document.getElementById('goNoGoForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const form = e.target;
  const data = {};
  const elements = form.elements;

  // Collect form data
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

  // Basic validation: check required select fields have value
  const requiredFields = form.querySelectorAll('select[required]');
  for (const field of requiredFields) {
    if (!data[field.name] || data[field.name] === '') {
      alert(`Please select a value for: ${field.previousElementSibling.textContent || field.name}`);
      field.focus();
      return;
    }
  }

  // Format data as readable text
  let output = 'Go/No-Go Decision Form Responses\n\n';
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      output += `${key}: ${data[key]}\n`;
    }
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
