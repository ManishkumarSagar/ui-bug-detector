requireAuth();

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const card = document.getElementById('bug-card');

if (!id) {
  card.innerHTML = '<p class="empty">No bug ID provided.</p>';
} else {
  loadBug();
}

async function loadBug() {
  try {
    const bug = await apiRequest(`/api/bugs/${id}`);
    card.innerHTML = `
      <h2 style="margin-top:0">${bug.title}</h2>
      <p style="display:flex;gap:8px;flex-wrap:wrap;">
        <span class="badge badge-${(bug.severity || 'low').toLowerCase()}">${bug.severity}</span>
        <span class="badge badge-open">${bug.category}</span>
        <span class="badge badge-${bug.status === 'Resolved' ? 'resolved' : bug.status === 'Dismissed' ? 'dismissed' : 'open'}">${bug.status}</span>
      </p>
      <p><strong>Description:</strong> ${bug.description}</p>
      <p><strong>Suggestion:</strong> ${bug.suggestion}</p>
      <div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" data-status="Resolved">Mark Resolved</button>
        <button class="btn btn-ghost btn-sm" data-status="Dismissed">Dismiss</button>
        <button class="btn btn-ghost btn-sm" data-status="Open">Reopen</button>
      </div>
    `;

    card.querySelectorAll('button[data-status]').forEach((btn) => {
      btn.addEventListener('click', () => updateStatus(btn.dataset.status));
    });
  } catch (err) {
    card.innerHTML = `<p class="empty">${err.message}</p>`;
  }
}

async function updateStatus(status) {
  try {
    await apiRequest(`/api/bugs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    showToast('Status updated');
    loadBug();
  } catch (err) {
    showToast(err.message, 'error');
  }
}