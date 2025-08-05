// form-handler.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("goNoGoForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    let output = "Go/No-Go Decision Form Response\n\n";

    for (let [name, value] of formData.entries()) {
      output += `${name.replace(/_/g, ".")}: ${value}\n`;
    }

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `go_no_go_response_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
