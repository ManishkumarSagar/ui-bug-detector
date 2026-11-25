requireAuth();

const form = document.getElementById('website-form');
const list = document.getElementById('website-list');

async function loadWebsites() {
  try {
    const sites = await apiRequest('/api/websites');
    if (!sites.length) {
      list.innerHTML =
        '<tr><td colspan="4" class="empty">No websites yet.</td></tr>';
      return;
    }
    list.innerHTML = sites
      .map(
        (s) => `
        <tr>
          <td>${s.name}</td>
          <td><a href="${s.url}" target="_blank" rel="noopener">${s.url}</a></td>
          <td>${new Date(s.createdAt).toLocaleDateString()}</td>
          <td>
            <a href="scan.html?website=${s._id}" class="btn btn-ghost btn-sm">Scan</a>
            <button class="btn btn-danger btn-sm" data-id="${s._id}">Delete</button>
          </td>
        </tr>`
      )
      .join('');

    list.querySelectorAll('button[data-id]').forEach((btn) => {
      btn.addEventListener('click', () => deleteWebsite(btn.dataset.id));
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteWebsite(id) {
  if (!confirm('Delete this website and its scans?')) return;
  try {
    await apiRequest(`/api/websites/${id}`, { method: 'DELETE' });
    showToast('Website deleted');
    loadWebsites();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    name: document.getElementById('ws-name').value.trim(),
    url: document.getElementById('ws-url').value.trim()
  };
  try {
    await apiRequest('/api/websites', { method: 'POST', body: JSON.stringify(body) });
    form.reset();
    showToast('Website added');
    loadWebsites();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

loadWebsites();