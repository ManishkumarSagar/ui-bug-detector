requireAuth();

const form = document.getElementById('scan-form');
const websiteSelect = document.getElementById('scan-website');
const resultCard = document.getElementById('scan-result');
const scanBtn = document.getElementById('scan-btn');

async function loadWebsites() {
  try {
    const sites = await apiRequest('/api/websites');
    if (!sites.length) {
      websiteSelect.innerHTML =
        '<option value="">No websites — add one first</option>';
      return;
    }
    websiteSelect.innerHTML = sites
      .map((s) => `<option value="${s._id}">${s.name}</option>`)
      .join('');

    const params = new URLSearchParams(window.location.search);
    const preset = params.get('website');
    if (preset) websiteSelect.value = preset;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  scanBtn.disabled = true;
  scanBtn.innerHTML = '<span class="spinner"></span> Scanning…';

  const body = {
    websiteId: websiteSelect.value,
    viewport: {
      width: Number(document.getElementById('scan-width').value),
      height: Number(document.getElementById('scan-height').value)
    },
    browser: document.getElementById('scan-browser').value
  };

  try {
    const scan = await apiRequest('/api/scans', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    renderScan(scan);
    showToast('Scan completed');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    scanBtn.disabled = false;
    scanBtn.textContent = 'Start Scan';
  }
});

function renderScan(scan) {
  resultCard.hidden = false;
  document.getElementById('scan-meta').textContent =
    `Viewport ${scan.viewport.width}×${scan.viewport.height} · ` +
    `${(scan.diffPixels || 0).toLocaleString()} / ` +
    `${(scan.totalPixels || 0).toLocaleString()} pixels differ`;

  document.getElementById('ref-img').src = scan.referenceImage;
  document.getElementById('act-img').src = scan.actualImage;
  document.getElementById('diff-img').src = scan.differenceImage;

  const bugsBody = document.getElementById('scan-bugs-body');
  if (!scan.bugs || !scan.bugs.length) {
    bugsBody.innerHTML = '<tr><td colspan="4" class="empty">No issues detected 🎉</td></tr>';
    return;
  }

  bugsBody.innerHTML = scan.bugs
    .map(
      (b) => `
      <tr>
        <td>${b.title}</td>
        <td>${b.category}</td>
        <td><span class="badge badge-${(b.severity || 'low').toLowerCase()}">${b.severity}</span></td>
        <td>${b.description}</td>
      </tr>`
    )
    .join('');
}

loadWebsites();