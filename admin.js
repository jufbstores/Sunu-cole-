let adminEmail = sessionStorage.getItem('sunu_admin_email') || '';
let adminPwd = sessionStorage.getItem('sunu_admin_pwd') || '';
let activeTab = 'classes';
let classesData = [];
let matieresData = [];
let abonnesData = [];
let leconsData = [];
let contenusFiltreClasse = '';
let contenusFiltreMatiere = '';
let contenusEditId = null;
let quizData = [];
let quizNewOpen = false;
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
    err.textContent = (e && e.message) ? e.message : 'E-mail ou mot de passe incorrect.';
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
      <button class="tab ${activeTab==='contenus'?'active':''}" onclick="switchTab('contenus')">Contenus</button>
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
    } else if (tab === 'contenus') {
      const needsClasses = classesData.length === 0;
      const needsMatieres = matieresData.length === 0;
      const calls = [callAdmin('list_lecons')];
      if (needsClasses) calls.push(callAdmin('list_classes'));
      if (needsMatieres) calls.push(callAdmin('list_matieres'));
      const results = await Promise.all(calls);
      leconsData = results[0].data;
      let idx = 1;
      if (needsClasses) classesData = results[idx++].data;
      if (needsMatieres) matieresData = results[idx++].data;
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
  else if (activeTab === 'contenus') el.innerHTML = contenusView();
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

/* ---------------- Contenus (leçons) ---------------- */
function contenusView() {
  const classesOptions = classesData.slice().sort((a,b)=>a.ordre-b.ordre);
  const matieresOptions = matieresData.filter(m => {
    if (!contenusFiltreClasse) return true;
    const c = classesData.find(x => x.id === contenusFiltreClasse);
    return !c || m.niveau === c.niveau;
  }).sort((a,b)=>a.ordre-b.ordre);

  let filtered = leconsData;
  if (contenusFiltreClasse) {
    const c = classesData.find(x => x.id === contenusFiltreClasse);
    if (c) filtered = filtered.filter(l => l.classe === c.nom);
  }
  if (contenusFiltreMatiere) {
    const m = matieresData.find(x => x.id === contenusFiltreMatiere);
    if (m) filtered = filtered.filter(l => l.matiere === m.nom);
  }

  const editing = contenusEditId ? leconsData.find(l => l.id === contenusEditId) : null;

  return `
  <div class="panel">
    <h2>📖 Contenus des leçons</h2>
    <div class="add-row" style="margin-bottom:14px;">
      <select id="filtre-classe" onchange="contenusFiltreClasse=this.value; renderTabContent();">
        <option value="">Toutes les classes</option>
        ${classesOptions.map(c => `<option value="${c.id}" ${contenusFiltreClasse===c.id?'selected':''}>${escAttr(c.nom)}</option>`).join('')}
      </select>
      <select id="filtre-matiere" onchange="contenusFiltreMatiere=this.value; renderTabContent();">
        <option value="">Toutes les matières</option>
        ${matieresOptions.map(m => `<option value="${m.id}" ${contenusFiltreMatiere===m.id?'selected':''}>${escAttr(m.emoji)} ${escAttr(m.nom)}</option>`).join('')}
      </select>
      <button onclick="startNewLecon()">+ Nouvelle leçon</button>
    </div>

    ${(contenusEditId === 'new' || editing) ? leconEditForm(editing) : ''}

    ${filtered.length === 0 ? '<p class="empty">Aucune leçon pour ce filtre.</p>' : `
      ${filtered.map(l => `
        <div class="row" style="align-items:flex-start; flex-direction:column; gap:6px;">
          <div style="display:flex; width:100%; align-items:center; gap:10px;">
            <div style="flex:1;">
              <strong>${escHtml(l.titre)}</strong>
              <div style="font-size:12px; color:var(--ink-soft);">${escHtml(l.matiere)} · ${escHtml(l.classe)}</div>
            </div>
            <button class="save-btn" onclick="openLeconEdit('${l.id}')">Modifier</button>
            <button class="del-btn" onclick="deleteLecon('${l.id}','${escAttr(l.titre)}')">✕</button>
          </div>
        </div>
      `).join('')}
    `}
  </div>`;
}

function leconEditForm(l) {
  const isNew = !l;
  const classesSorted = classesData.slice().sort((a,b)=>a.ordre-b.ordre);
  return `
  <div class="panel" style="box-shadow:inset 0 0 0 2px var(--terracotta); margin-bottom:16px;">
    <h2>${isNew ? '✏️ Nouvelle leçon' : '✏️ Modifier la leçon'}</h2>
    <div class="add-row" style="margin-bottom:10px;">
      <select id="lecon-classe">
        <option value="">Classe...</option>
        ${classesSorted.map(c => `<option value="${escAttr(c.nom)}" ${l && l.classe===c.nom?'selected':''}>${escAttr(c.nom)}</option>`).join('')}
      </select>
      <select id="lecon-matiere">
        <option value="">Matière...</option>
        ${matieresData.map(m => `<option value="${escAttr(m.nom)}" ${l && l.matiere===m.nom?'selected':''}>${escAttr(m.emoji)} ${escAttr(m.nom)}</option>`).join('')}
      </select>
    </div>
    <input type="text" placeholder="Titre de la leçon" id="lecon-titre" value="${l ? escAttr(l.titre) : ''}" style="width:100%; padding:9px 11px; border-radius:8px; border:1px solid var(--slate-line); margin-bottom:10px;">
    <input type="text" placeholder="Résumé court (optionnel)" id="lecon-resume" value="${l ? escAttr(l.resume || '') : ''}" style="width:100%; padding:9px 11px; border-radius:8px; border:1px solid var(--slate-line); margin-bottom:10px;">
    <textarea id="lecon-contenu" placeholder="Contenu complet de la leçon..." style="width:100%; min-height:180px; padding:11px; border-radius:8px; border:1px solid var(--slate-line); font-family:inherit; font-size:14px; margin-bottom:10px;">${l ? escHtml(l.contenu) : ''}</textarea>
    <div style="display:flex; gap:8px;">
      <button class="save-btn" style="padding:10px 18px;" onclick="saveLecon(${isNew ? 'null' : `'${l.id}'`})">${isNew ? 'Créer la leçon' : 'Enregistrer'}</button>
      <button class="logout" onclick="contenusEditId=null; renderTabContent();">Annuler</button>
    </div>
  </div>
  ${!isNew ? quizSection(l.id) : ''}`;
}

/* ---------------- Quiz ---------------- */
function quizSection(leconId) {
  return `
  <div class="panel">
    <h2>🧠 Questions de quiz</h2>
    <p style="font-size:12.5px; color:var(--ink-soft); margin:-4px 0 14px;">Ces questions alimentent aussi les rubriques Exercices, Flashcards et Défis pour cette leçon.</p>
    ${quizData.length === 0 ? '<p class="empty">Aucune question pour cette leçon.</p>' : ''}
    ${quizData.map((q, i) => quizQuestionBlock(q, i, leconId)).join('')}
    ${quizNewOpen ? quizQuestionBlock(null, quizData.length, leconId) : `
      <button onclick="quizNewOpen=true; renderTabContent();">+ Ajouter une question</button>
    `}
  </div>`;
}

function quizQuestionBlock(q, index, leconId) {
  const isNew = !q;
  const uid = isNew ? 'new' : q.id;
  const choix = q ? q.choix : ['', '', '', ''];
  const reponseIndex = q ? q.reponse_index : 0;
  return `
  <div class="niveau-block" style="box-shadow:inset 0 0 0 2px var(--slate-line); border-radius:12px; padding:14px; margin-bottom:14px;">
    <h3 style="margin-bottom:8px;">Question ${index + 1}${isNew ? ' (nouvelle)' : ''}</h3>
    <input type="text" placeholder="Énoncé de la question" id="quiz-question-${uid}" value="${q ? escAttr(q.question) : ''}" style="width:100%; padding:9px 11px; border-radius:8px; border:1px solid var(--slate-line); margin-bottom:8px;">
    <textarea id="quiz-choix-${uid}" placeholder="Une réponse par ligne (4 lignes recommandées)" style="width:100%; min-height:90px; padding:9px 11px; border-radius:8px; border:1px solid var(--slate-line); font-family:inherit; font-size:13.5px; margin-bottom:8px;">${choix.join('\n')}</textarea>
    <div class="add-row" style="margin-bottom:8px;">
      <label style="font-size:13px; align-self:center;">Bonne réponse : ligne n°</label>
      <input type="number" min="1" id="quiz-reponse-${uid}" value="${reponseIndex + 1}" style="width:70px; padding:9px 11px; border-radius:8px; border:1px solid var(--slate-line);">
    </div>
    <textarea id="quiz-explication-${uid}" placeholder="Explication (affichée après la réponse)" style="width:100%; min-height:60px; padding:9px 11px; border-radius:8px; border:1px solid var(--slate-line); font-family:inherit; font-size:13.5px; margin-bottom:8px;">${q ? escHtml(q.explication || '') : ''}</textarea>
    <div style="display:flex; gap:8px;">
      <button class="save-btn" onclick="saveQuizQuestion(${isNew ? 'null' : `'${q.id}'`}, '${leconId}')">${isNew ? 'Ajouter' : 'Enregistrer'}</button>
      ${isNew ? `<button class="logout" onclick="quizNewOpen=false; renderTabContent();">Annuler</button>` : `<button class="del-btn" onclick="deleteQuizQuestion('${q.id}','${leconId}')">✕ Supprimer</button>`}
    </div>
  </div>`;
}

async function saveQuizQuestion(id, leconId) {
  const uid = id || 'new';
  const question = document.getElementById(`quiz-question-${uid}`).value.trim();
  const choix = document.getElementById(`quiz-choix-${uid}`).value.split('\n').map(s => s.trim()).filter(Boolean);
  const reponseNum = parseInt(document.getElementById(`quiz-reponse-${uid}`).value) || 1;
  const explication = document.getElementById(`quiz-explication-${uid}`).value.trim();
  if (!question) return showToast('L\'énoncé ne peut pas être vide.');
  if (choix.length < 2) return showToast('Il faut au moins 2 réponses possibles.');
  const reponse_index = Math.min(Math.max(reponseNum - 1, 0), choix.length - 1);
  try {
    if (id) {
      await callAdmin('update_quiz_question', { id, question, choix, reponse_index, explication });
      showToast('Question mise à jour ✓');
    } else {
      await callAdmin('add_quiz_question', { lecon_id: leconId, question, choix, reponse_index, explication, ordre: quizData.length });
      showToast('Question ajoutée ✓');
      quizNewOpen = false;
    }
    const { data } = await callAdmin('list_quiz', { lecon_id: leconId });
    quizData = data;
    renderTabContent();
  } catch (e) { showToast(e.message); }
}

async function deleteQuizQuestion(id, leconId) {
  if (!confirm('Supprimer cette question ?')) return;
  try {
    await callAdmin('delete_quiz_question', { id });
    showToast('Question supprimée');
    const { data } = await callAdmin('list_quiz', { lecon_id: leconId });
    quizData = data;
    renderTabContent();
  } catch (e) { showToast(e.message); }
}

function startNewLecon() {
  contenusEditId = 'new';
  quizData = [];
  quizNewOpen = false;
  renderTabContent();
}

async function openLeconEdit(id) {
  contenusEditId = id;
  quizData = [];
  quizNewOpen = false;
  renderTabContent();
  try {
    const { data } = await callAdmin('list_quiz', { lecon_id: id });
    quizData = data;
  } catch (e) { showToast(e.message); }
  renderTabContent();
}

async function saveLecon(id) {
  const classe = document.getElementById('lecon-classe').value;
  const matiere = document.getElementById('lecon-matiere').value;
  const titre = document.getElementById('lecon-titre').value.trim();
  const resume = document.getElementById('lecon-resume').value.trim();
  const contenu = document.getElementById('lecon-contenu').value.trim();
  if (!classe || !matiere) return showToast('Choisis une classe et une matière.');
  if (!titre) return showToast('Le titre ne peut pas être vide.');
  if (!contenu) return showToast('Le contenu ne peut pas être vide.');
  try {
    if (id) {
      await callAdmin('update_lecon', { id, classe, matiere, titre, resume, contenu });
      showToast('Leçon mise à jour ✓');
    } else {
      await callAdmin('add_lecon', { classe, matiere, titre, resume, contenu });
      showToast('Leçon créée ✓');
    }
    contenusEditId = null;
    loadTab('contenus');
  } catch (e) { showToast(e.message); }
}

async function deleteLecon(id, titre) {
  if (!confirm(`Supprimer la leçon "${titre}" ? Les quiz associés seront aussi supprimés.`)) return;
  try {
    await callAdmin('delete_lecon', { id });
    showToast('Leçon supprimée');
    if (contenusEditId === id) contenusEditId = null;
    loadTab('contenus');
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
