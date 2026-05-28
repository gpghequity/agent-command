(function () {
  const openBtn = document.getElementById('open-add-agent');
  const modal = document.getElementById('add-agent-modal');
  const form = document.getElementById('add-agent-form');
  const tbody = document.querySelector('#agents-table tbody');
  if (!openBtn || !modal || !form || !tbody) return;

  function openModal() { modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); }
  function closeModal() { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); form.reset(); }

  openBtn.addEventListener('click', openModal);
  modal.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });

  // Agent row clicks — placeholder
  document.querySelectorAll('.agent-row').forEach(row => {
    row.addEventListener('click', () => alert('Agent detail view coming in v2'));
  });

  // Add Agent submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const name    = (fd.get('name')    || '').toString().trim();
    const state   = (fd.get('state')   || '').toString().trim();
    const plan    = (fd.get('plan')    || '').toString().trim();
    if (!name) return;

    const tr = document.createElement('tr');
    tr.className = 'agent-row';
    tr.dataset.name = name;
    tr.innerHTML = `
      <td><strong>${escapeHtml(name)}</strong></td>
      <td>${escapeHtml(state)}</td>
      <td>${escapeHtml(plan)}</td>
      <td>
        <span class="status-dot status-blue"></span>
        <span class="status-text">PENDING APPLICATION</span>
      </td>
      <td>0</td>
      <td><span class="training-count">0/5</span></td>
    `;
    tr.addEventListener('click', () => alert('Agent detail view coming in v2'));
    tbody.prepend(tr);

    closeModal();
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
})();
