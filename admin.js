let adminEmail = sessionStorage.getItem('sunu_admin_email') || '';
let adminPwd = sessionStorage.getItem('sunu_admin_pwd') || '';
let activeTab = 'classes';
let classesData = [];
let matieresData = [];
let abonnesData = [];
let loading = false;

async function callAdmin(action, payload) {
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPwd, action, payload }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur');
  return data;
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function render() {
  const app = document.getElementById('app');
  if (!adminEmail || !adminPwd) {
    app.innerHTML = loginView();
    return;
  }
  app.innerHTML = dashboardView();
}

function loginView() {
  return `
  <div class="login-wrap">
    <div class="login-card">
      <h1>🌳 Sunu École — Admin</h1>
      <p>Accès réservé à l'équipe.</p>
      <input id="emailInput" type="email" placeholder="Adresse e-mail" autocomplete="username">
      <div class="pwd-wrap">
        <input id="pwdInput" type="password" placeholder="Mot de passe" autocomplete="current-password" onkeydown="if(event.key==='Enter') attemptLogin();">
        <button type="button" class="pwd-toggle" onclick="togglePwdVisibility()" id="pwdToggleBtn">👁️</button>
      </div>
      <p class="login-err" id="loginErr"></p>
      <button onclick="attemptLogin()">Se connecter</button>
    </div>
  </div>`;
}

function togglePwdVisibility() {
  const input = document.getElementById('pwdInput');
  const btn = document.getElementById('pwdToggleBtn');
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

async function attemptLogin() {
  const emailVal = document.getElementById('emailInput').value.trim();
  const pwdVal = document.getElementById('pwdInput').value.trim();
  const err = document.getElementById('loginErr');
  err.textContent = '';
  if (!emailVal || !pwdVal) { err.textContent = 'Merci de saisir e-mail et mot de passe.'; return; }
  adminEmail = emailVal;
  adminPwd = pwdVal;
  try {
    await callAdmin('ping');
    sessionStorage.setItem('sunu_admin_email', adminEmail);
    sessionStorage.setItem('sunu_admin_pwd', adminPwd);
    render();
    loadTab(activeTab);
  } catch (e) {
    adminEmail = ''; adminPwd = '';
    err.textContent = 'E-mail ou mot de passe incorrect.';
  }
}

function logout() {
  adminEmail = ''; adminPwd = '';
  sessionStorage.removeItem('sunu_admin_email');
  sessionStorage.removeItem('sunu_admin_pwd');
  render();
}

function dashboardView() {
  return `
  <div class="shell">
    <div class="topbar">
      <h1>🌳 Sunu École — Administration</h1>
      <button class="logout" onclick="logout()">Déconnexion</button>
    </div>
    <div class="tabs">
      <button class="tab ${activeTab==='classes'?'active':''}" onclick="switchTab('classes')">Classes</button>
      <button class="tab ${activeTab==='matieres'?'active':''}" onclick="switchTab('matieres')">Matières</button>
      <button class="tab ${activeTab==='abonnes'?'active':''}" onclick="switchTab('abonnes')">Abonnés</button>
    </div>
    <div id="tabContent">${loading ? '<div class="loading">Chargement...</div>' : ''}</div>
  </div>`;
}

function switchTab(tab) {
  activeTab = tab;
  render();
  loadTab(tab);
}

async function loadTab(tab) {
  loading = true;
  renderTabContent();
  try {
    if (tab === 'classes') {
      const { data } = await callAdmin('list_classes');
      classesData = data;
    } else if (tab === 'matieres') {
      const { data } = await callAdmin('list_matieres');
      matieresData = data;
    } else if (tab === 'abonnes') {
      const { data } = await callAdmin('list_abonnes');
      abonnesData = data;
    }
  } catch (e) {
    showToast(e.message || 'Erreur de chargement');
  }
  loading = false;
  renderTabContent();
}

function renderTabContent() {
  const el = document.getElementById('tabContent');
  if (!el) return;
  if (loading) { el.innerHTML = '<div class="loading">Chargement...</div>'; return; }
  if (activeTab === 'classes') el.innerHTML = classesView();
  else if (activeTab === 'matieres') el.innerHTML = matieresView();
  else el.innerHTML = abonnesView();
}

const NIVEAUX = [
  { v: 'primaire', label: 'Primaire' },
  { v: 'college', label: 'Collège' },
  { v: 'lycee', label: 'Lycée' },
];

function groupByNiveau(arr) {
  const grouped = {};
  arr.forEach(item => { (grouped[item.niveau] = grouped[item.niveau] || []).push(item); });
  return grouped;
}

/* ---------------- Classes ---------------- */
function classesView() {
  const grouped = groupByNiveau(classesData);
  return `
  <div class="panel">
    <h2>📘 Gestion des classes</h2>
    ${NIVEAUX.map(niv => `
      <div class="niveau-block">
        <h3>${niv.label}</h3>
        ${(grouped[niv.v] || []).map(c => `
          <div class="row">
            <input type="text" value="${escAttr(c.nom)}" id="classe-nom-${c.id}">
            <input type="number" class="ordre" value="${c.ordre}" id="classe-ordre-${c.id}">
            <button class="save-btn" onclick="saveClasse('${c.id}')">Enregistrer</button>
            <button class="del-btn" onclick="deleteClasse('${c.id}','${escAttr(c.nom)}')">✕</button>
          </div>
        `).join('') || '<p class="empty">Aucune classe pour ce niveau.</p>'}
        <div class="add-row">
          <input type="text" class="nom" placeholder="Nouvelle classe (ex: CM3)" id="new-classe-nom-${niv.v}">
          <input type="number" class="ordre" placeholder="Ordre" id="new-classe-ordre-${niv.v}">
          <button onclick="addClasse('${niv.v}')">+ Ajouter</button>
        </div>
      </div>
    `).join('')}
  </div>`;
}

async function saveClasse(id) {
  const nom = document.getElementById(`classe-nom-${id}`).value.trim();
  const ordre = parseInt(document.getElementById(`classe-ordre-${id}`).value) || 0;
  const c = classesData.find(x => x.id === id);
  if (!nom) return showToast('Le nom ne peut pas être vide.');
  try {
    await callAdmin('update_classe', { id, niveau: c.niveau, nom, ordre });
    showToast('Classe mise à jour ✓');
    loadTab('classes');
  } catch (e) { showToast(e.message); }
}

async function deleteClasse(id, nom) {
  if (!confirm(`Supprimer la classe "${nom}" ? Les leçons existantes pour cette classe ne seront pas supprimées, mais elles n'apparaîtront plus dans le sélecteur d'inscription.`)) return;
  try {
    await callAdmin('delete_classe', { id });
    showToast('Classe supprimée');
    loadTab('classes');
  } catch (e) { showToast(e.message); }
}

async function addClasse(niveau) {
  const nomInput = document.getElementById(`new-classe-nom-${niveau}`);
  const ordreInput = document.getElementById(`new-classe-ordre-${niveau}`);
  const nom = nomInput.value.trim();
  const ordre = parseInt(ordreInput.value) || 0;
  if (!nom) return showToast('Merci de saisir un nom de classe.');
  try {
    await callAdmin('add_classe', { niveau, nom, ordre });
    showToast('Classe ajoutée ✓');
    loadTab('classes');
  } catch (e) { showToast(e.message); }
}

/* ---------------- Matières ---------------- */
function matieresView() {
  const grouped = groupByNiveau(matieresData);
  return `
  <div class="panel">
    <h2>📚 Gestion des matières</h2>
    ${NIVEAUX.map(niv => `
      <div class="niveau-block">
        <h3>${niv.label}</h3>
        ${(grouped[niv.v] || []).map(m => `
          <div class="row">
            <input type="text" class="emoji-in" value="${escAttr(m.emoji)}" id="mat-emoji-${m.id}">
            <input type="text" value="${escAttr(m.nom)}" id="mat-nom-${m.id}">
            <input type="number" class="ordre" value="${m.ordre}" id="mat-ordre-${m.id}">
            <button class="save-btn" onclick="saveMatiere('${m.id}')">Enregistrer</button>
            <button class="del-btn" onclick="deleteMatiere('${m.id}','${escAttr(m.nom)}')">✕</button>
          </div>
        `).join('') || '<p class="empty">Aucune matière pour ce niveau.</p>'}
        <div class="add-row">
          <input type="text" class="emoji" placeholder="📘" id="new-mat-emoji-${niv.v}">
          <input type="text" class="nom" placeholder="Nouvelle matière" id="new-mat-nom-${niv.v}">
          <input type="number" class="ordre" placeholder="Ordre" id="new-mat-ordre-${niv.v}">
          <button onclick="addMatiere('${niv.v}')">+ Ajouter</button>
        </div>
      </div>
    `).join('')}
  </div>`;
}

async function saveMatiere(id) {
  const nom = document.getElementById(`mat-nom-${id}`).value.trim();
  const emoji = document.getElementById(`mat-emoji-${id}`).value.trim() || '📘';
  const ordre = parseInt(document.getElementById(`mat-ordre-${id}`).value) || 0;
  const m = matieresData.find(x => x.id === id);
  if (!nom) return showToast('Le nom ne peut pas être vide.');
  try {
    await callAdmin('update_matiere', { id, niveau: m.niveau, nom, emoji, ordre });
    showToast('Matière mise à jour ✓');
    loadTab('matieres');
  } catch (e) { showToast(e.message); }
}

async function deleteMatiere(id, nom) {
  if (!confirm(`Supprimer la matière "${nom}" ? Les leçons existantes ne seront pas supprimées, mais la matière n'apparaîtra plus dans le sélecteur d'inscription.`)) return;
  try {
    await callAdmin('delete_matiere', { id });
    showToast('Matière supprimée');
    loadTab('matieres');
  } catch (e) { showToast(e.message); }
}

async function addMatiere(niveau) {
  const nomInput = document.getElementById(`new-mat-nom-${niveau}`);
  const emojiInput = document.getElementById(`new-mat-emoji-${niveau}`);
  const ordreInput = document.getElementById(`new-mat-ordre-${niveau}`);
  const nom = nomInput.value.trim();
  const emoji = emojiInput.value.trim() || '📘';
  const ordre = parseInt(ordreInput.value) || 0;
  if (!nom) return showToast('Merci de saisir un nom de matière.');
  try {
    await callAdmin('add_matiere', { niveau, nom, emoji, ordre });
    showToast('Matière ajoutée ✓');
    loadTab('matieres');
  } catch (e) { showToast(e.message); }
}

/* ---------------- Abonnés ---------------- */
function abonnesView() {
  const premium = abonnesData.filter(a => a.plan === 'premium').length;
  const standard = abonnesData.filter(a => a.plan === 'standard').length;
  return `
  <div class="stats">
    <div class="stat-card"><div class="n">${abonnesData.length}</div><div class="l">Total abonnés</div></div>
    <div class="stat-card"><div class="n">${premium}</div><div class="l">Premium</div></div>
    <div class="stat-card"><div class="n">${standard}</div><div class="l">Standard</div></div>
  </div>
  <div class="panel">
    <h2>👥 Liste des abonnés</h2>
    ${abonnesData.length === 0 ? '<p class="empty">Aucun abonné pour l\'instant.</p>' : `
    <div style="overflow-x:auto;">
    <table>
      <thead><tr><th>Élève</th><th>Classe</th><th>Plan</th><th>Durée</th><th>Prix</th><th>Date</th></tr></thead>
      <tbody>
        ${abonnesData.map(a => {
          const eleve = a.eleves && a.eleves[0];
          const date = new Date(a.created_at).toLocaleDateString('fr-FR');
          return `<tr>
            <td>${eleve ? escHtml(eleve.prenom) : '—'}</td>
            <td>${eleve ? escHtml(eleve.classe || '—') : '—'}</td>
            <td><span class="badge ${a.plan}">${a.plan === 'premium' ? 'Premium' : 'Standard'}</span></td>
            <td>${a.duree === '12mois' ? '12 mois' : '1 mois'}</td>
            <td>${fmt(a.prix_fcfa)} FCFA</td>
            <td>${date}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    </div>`}
  </div>`;
}

function fmt(n) { return (n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
function escHtml(s) { return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function escAttr(s) { return escHtml(s); }

render();
if (adminEmail && adminPwd) loadTab(activeTab);
