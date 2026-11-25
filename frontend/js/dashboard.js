requireAuth();

async function loadDashboard() {
  try {
    const [websites, scans, bugs] = await Promise.all([
      apiRequest('/api/websites'),
      apiRequest('/api/scans'),
      apiRequest('/api/bugs')
    ]);

    document.getElementById('stat-websites').textContent = websites.length;
    document.getElementById('stat-scans').textContent = scans.length;
    document.getElementById('stat-open').textContent = bugs.filter((b) => b.status === 'Open').length;
    document.getElementById('stat-resolved').textContent = bugs.filter((b) => b.status === 'Resolved').length;

    renderScans(scans.slice(0, 5));
    renderBugs(bugs.filter((b) => b.status === 'Open').slice(0, 5));
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }
}

function renderScans(scans) {
  const tbody = document.getElementById('recent-scans');
  if (!scans.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">No scans yet. Start one!</td></tr>';
    return;
  }

  tbody.innerHTML = scans.map((s) => `
      <tr>
        <td>${s.websiteId?.name || '—'}</td>
        <td>${s.viewport?.width}×${s.viewport?.height}</td>
        <td><span class="badge badge-${s.status === 'completed' ? 'resolved' : 'open'}">${s.status}</span></td>
        <td>${(s.diffPixels || 0).toLocaleString()}</td>
        <td>${new Date(s.createdAt).toLocaleString()}</td>
        <td><a href="scan.html?id=${s._id}" class="btn btn-ghost btn-sm">View</a></td>
      </tr>`).join('');
}

function renderBugs(bugs) {
  const tbody = document.getElementById('open-bugs');
  if (!bugs.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No open issues 🎉</td></tr>';
    return;
  }

  tbody.innerHTML = bugs.map((b) => `
      <tr>
        <td>${b.title}</td>
        <td>${b.category}</td>
        <td><span class="badge badge-${(b.severity || 'low').toLowerCase()}">${b.severity}</span></td>
        <td><span class="badge badge-open">${b.status}</span></td>
        <td><a href="bug-details.html?id=${b._id}" class="btn btn-ghost btn-sm">Open</a></td>
      </tr>`).join('');
}

loadDashboard();