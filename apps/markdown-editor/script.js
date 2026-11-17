const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const stats = document.getElementById('stats');
const workspace = document.getElementById('workspace');

const btnViewSplit = document.getElementById('btn-view-split');
const btnViewEdit = document.getElementById('btn-view-edit');
const btnViewPreview = document.getElementById('btn-view-preview');

const btnCopyMd = document.getElementById('btn-copy-md');
const btnCopyHtml = document.getElementById('btn-copy-html');
const btnClear = document.getElementById('btn-clear');

function updateStats(text) {
  const charCount = text.length;
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  stats.textContent = `${wordCount} words · ${charCount} chars`;
}

function updatePreview() {
  const text = editor.value;
  updateStats(text);

  if (!text.trim()) {
    preview.innerHTML = '<div class="empty-preview">Rendered markdown will appear here...</div>';
    return;
  }

  try {
    const rawHtml = marked.parse(text);
    const safeHtml = DOMPurify.sanitize(rawHtml);
    preview.innerHTML = safeHtml;
  } catch (err) {
    console.error('Markdown rendering error:', err);
  }
}

// View mode toggling
function setViewMode(mode) {
  workspace.classList.remove('view-edit', 'view-preview');
  btnViewSplit.classList.remove('active');
  btnViewEdit.classList.remove('active');
  btnViewPreview.classList.remove('active');

  if (mode === 'edit') {
    workspace.classList.add('view-edit');
    btnViewEdit.classList.add('active');
  } else if (mode === 'preview') {
    workspace.classList.add('view-preview');
    btnViewPreview.classList.add('active');
  } else {
    btnViewSplit.classList.add('active');
  }
}

btnViewSplit.addEventListener('click', () => setViewMode('split'));
btnViewEdit.addEventListener('click', () => setViewMode('edit'));
btnViewPreview.addEventListener('click', () => setViewMode('preview'));

// Copy actions with temporary visual feedback
async function copyToClipboard(button, text) {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.disabled = true;
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 1500);
  } catch (err) {
    console.warn('Clipboard write failed:', err);
  }
}

btnCopyMd.addEventListener('click', () => copyToClipboard(btnCopyMd, editor.value));
btnCopyHtml.addEventListener('click', () => copyToClipboard(btnCopyHtml, preview.innerHTML));

btnClear.addEventListener('click', () => {
  editor.value = '';
  updatePreview();
  editor.focus();
});

editor.addEventListener('input', updatePreview);

// Theme synchronization with shell
function applyTheme(isDark) {
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
}

if (window.toolkit?.theme?.onThemeChanged) {
  window.toolkit.theme.onThemeChanged(applyTheme);
}

if (window.toolkit?.theme?.isDark) {
  window.toolkit.theme.isDark().then(applyTheme).catch(() => {});
} else if (window.matchMedia) {
  applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
}

// Zero data-at-rest: secure wipe on unload
function secureWipe() {
  editor.value = '';
  preview.innerHTML = '';
  const sel = window.getSelection();
  if (sel) sel.removeAllRanges();
}

window.addEventListener('beforeunload', secureWipe);
window.addEventListener('pagehide', secureWipe);

// Initial render
updatePreview();
