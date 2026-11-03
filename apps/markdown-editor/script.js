const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

function updatePreview() {
  // Parse markdown to HTML
  const rawHtml = marked.parse(editor.value);
  // Sanitize the HTML for security
  const safeHtml = DOMPurify.sanitize(rawHtml);
  preview.innerHTML = safeHtml;
}

editor.addEventListener('input', updatePreview);

// DPA / GDPR compliance: secure wipe on unload, zero data-at-rest
function secureWipe() {
  editor.value = '';
  preview.innerHTML = '';
  // Clear selection
  const sel = window.getSelection();
  if (sel) sel.removeAllRanges();
}

window.addEventListener('beforeunload', secureWipe);
window.addEventListener('pagehide', secureWipe);

updatePreview();
