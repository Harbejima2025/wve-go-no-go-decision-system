document.getElementById('goNoGoForm').addEventListener('submit', function (e) {
  e.preventDefault(); // Stop normal form submission

  const form = e.target;
  const formData = new FormData(form);
  const data = {};

  // Build the data object from form fields
  formData.forEach((value, key) => {
    data[key] = value.trim();
  });

  // Add a timestamp
  data.submitted_at = new Date().toISOString();

  // Generate a unique filename using name + timestamp
  const namePart = data.name.replace(/\s+/g, '_').toLowerCase();
  const timestampPart = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `responses/${namePart}_${timestampPart}.json`;

  // Convert to JSON string
  const json = JSON.stringify(data, null, 2);

  // Trigger download of JSON file
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);

  // Notify user
  alert('✅ Your response has been saved as a JSON file.\nPlease send it to the consolidation team or upload to the GitHub folder.');

  // Optional: Reset form
  form.reset();
});

