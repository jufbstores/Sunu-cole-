/* ---------------- Supabase ---------------- */
const SUPA_URL = "https://txreoozkebqtssofyhup.supabase.co";
const SUPA_KEY = "sb_publishable_hHcbKWp1YJZ3r043XmAvPw_5_J7L1sH";
const sb = window.supabase.createClient(SUPA_URL, SUPA_KEY);

/* ---------------- data ---------------- */
const GRADES = {
  primaire: ["CI","CP","CE1","CE2","CM1","CM2"],
  college: ["6ème","5ème","4ème","3ème (BFEM)"],
  lycee: ["2nde","1ère","Terminale (Bac)"]
};
// La 2nde n'a que 2 séries (L/S) ; à partir de la 1ère, ça se subdivise davantage (S1/S2, L1/L2...)
const SERIES_2NDE = ["L (Littéraire)","S (Scientifique)"];
const SERIES_1ERE_TLE = ["L1 (Littéraire)","L2 (Littéraire)","S1 (Sciences Exp.)","S2 (Sciences Exp.)","G (Gestion)","T (Technique)"];

const SUBJECTS = {
  primaire: [
    {em:"🖊️", label:"Français"}, {em:"🔢", label:"Mathématiques"},
    {em:"🌍", label:"Éveil / Sciences"}, {em:"🏺", label:"Histoire-Géo"},
    {em:"🤝", label:"Éducation Civique"}, {em:"🗣️", label:"Anglais (initiation)"}
  ],
  college: [
    {em:"🖊️", label:"Français"}, {em:"🔢", label:"Mathématiques"},
    {em:"🏺", label:"Histoire-Géo"}, {em:"⚖️", label:"ECM"},
    {em:"🧬", label:"SVT"}, {em:"🗣️", label:"Anglais"}
  ],
  lycee: [
    {em:"🖊️", label:"Français"}, {em:"🔢", label:"Mathématiques"},
    {em:"🏺", label:"Histoire-Géo"}, {em:"🧬", label:"SVT"},
    {em:"⚗️", label:"Physique-Chimie"}, {em:"🗣️", label:"Anglais"}, {em:"📗", label:"Arabe"}
  ]
};

// Matières qui n'apparaissent qu'à partir de la 4ème (Physique-Chimie, Arabe)
const COLLEGE_MATIERES_4E_3E = [
  {em:"⚗️", label:"Physique-Chimie"}, {em:"📗", label:"Arabe"}
];

// Matières de 2nde selon la série (L ou S) — pas encore de Philosophie
const LYCEE_MATIERES_2NDE = {
  L: [
    {em:"🖊️", label:"Français"}, {em:"🔢", label:"Mathématiques"},
    {em:"🏺", label:"Histoire-Géo"}, {em:"🧬", label:"SVT"},
    {em:"⚗️", label:"Physique-Chimie"}, {em:"🗣️", label:"Anglais"}, {em:"📗", label:"Arabe"}
  ],
  S: [
    {em:"🖊️", label:"Français"}, {em:"🔢", label:"Mathématiques"},
    {em:"🏺", label:"Histoire-Géo"}, {em:"🧬", label:"SVT"},
    {em:"⚗️", label:"Physique-Chimie"}, {em:"🗣️", label:"Anglais"}, {em:"📗", label:"Arabe"}
  ]
};

// Matières de 1ère/Terminale selon la série (Philosophie apparaît ici)
const LYCEE_MATIERES_PAR_SERIE = {
  L: [
    {em:"🖊️", label:"Français"}, {em:"📖", label:"Littérature"}, {em:"🧠", label:"Philosophie"},
    {em:"🔢", label:"Mathématiques"}, {em:"🏺", label:"Histoire-Géo"},
    {em:"🗣️", label:"Anglais"}, {em:"📗", label:"Arabe"}
  ],
  S: [
    {em:"🖊️", label:"Français"}, {em:"🧠", label:"Philosophie"}, {em:"🔢", label:"Mathématiques"},
    {em:"⚗️", label:"Physique-Chimie"}, {em:"🧬", label:"SVT"}, {em:"🏺", label:"Histoire-Géo"},
    {em:"🗣️", label:"Anglais"}, {em:"📗", label:"Arabe"}
  ],
  G: [
    {em:"🖊️", label:"Français"}, {em:"🧠", label:"Philosophie"}, {em:"🔢", label:"Mathématiques"},
    {em:"💰", label:"Économie"}, {em:"🏺", label:"Histoire-Géo"},
    {em:"🗣️", label:"Anglais"}, {em:"📗", label:"Arabe"}
  ]
};

// Regroupe les 5 séries précises choisies par l'élève en 3 grandes filières de contenu
function trackFromSerie(serie){
  if(!serie) return null;
  if(serie.startsWith("L")) return "L";
  if(serie.startsWith("S")) return "S";
  return "G"; // G (Gestion) et T (Technique) partagent le même contenu générique
}

// Calcule la classe exacte utilisée pour filtrer le contenu dans Supabase (ex: "Terminale S", "2nde L")
function contentClasse(classe, serie){
  if(!classe) return null;
  const base = classe.replace(" (Bac)", "").trim();
  const track = trackFromSerie(serie);
  return track ? `${base} ${track}` : base;
}

const OBJECTIFS = [
  {em:"📈", label:"Suivre ses progrès"}, {em:"🦅", label:"Favoriser son autonomie"},
  {em:"🎓", label:"Préparer le BFEM ou le Bac"}, {em:"💪", label:"Remonter sa moyenne"},
  {em:"🧩", label:"Travailler avec méthode"}, {em:"✨", label:"Autre"}
];

const TEMPS = [10,15,20,30,45,60,90];
const ORDER = ["welcome","prenom","profil","niveau","classe","serie","matieres","objectifs","temps","nbenfants","pricing","final","form","success"];
const NO_HEADER = ["welcome","final","form","success","login","loginSuccess","espace","lecon","quiz","fiche","flashlist","defi","coach"];
const WELCOME_SLIDES = [
  { kind:"subjects", title:"Les bonnes notes démarrent sous le baobab !", sub:"Pour toute la famille, du CI à la Terminale, dans toutes les matières !" },
  { kind:"method", title:"Une méthode qui unit tradition et technologie", sub:"Plus de 10 000 contenus créés, vérifiés et conformes au programme sénégalais." },
  { kind:"tutors", title:"Fini le stress des devoirs grâce à nos maîtres", sub:"Jamais bloqué·e : des réponses par tchat en moins de 5 minutes !" },
  { kind:"results", title:"Adieu le stress des contrôles, place à la réussite", sub:"+4 points de moyenne chez nos élèves avant le BFEM et le Bac." }
];
let welcomeSlide = 0;
const PHASES = {
  welcome:"aube", prenom:"aube", profil:"aube",
  niveau:"matin", classe:"matin", serie:"matin",
  matieres:"apresmidi", objectifs:"apresmidi", temps:"apresmidi",
  nbenfants:"crepuscule", pricing:"crepuscule",
  final:"nuit", form:"nuit", success:"nuit"
};
const BUBBLES = {
  prenom:"Jërejëf ! Bienvenue sous l'arbre à palabres 🌳",
  final:"Yaakaar ! Tout est prêt pour toi.",
  success:"Waaw ! Que la réussite t'accompagne."
};

let step = "welcome";
let sessionActive = false;
let ans = { prenom:"", profil:null, consentAge:false, niveau:null, classe:null, serie:null,
  matieres:[], objectifs:[], temps:2, nbEnfants:null, plan:"premium", duree:"12mois" };

function getPrice(plan, duree){
  const isPremium = plan === "premium";
  return duree === "12mois" ? (isPremium ? 4900 : 2900) : (isPremium ? 12900 : 7900);
}

function escHtml(s){ return (s||"").toString().replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function needsSerie(){ return ans.niveau==="lycee" && !!ans.classe; }
function seriesForClasse(){ return ans.classe === "2nde" ? SERIES_2NDE : SERIES_1ERE_TLE; }
function visibleSteps(){
  return ORDER.filter(s=>!["welcome","final","form","success"].includes(s)).filter(s=> s!=="serie" || needsSerie());
}
function nextStep(){
  const i = ORDER.indexOf(step); let n = ORDER[i+1];
  if(n==="serie" && !needsSerie()) n = ORDER[i+2];
  step = n; render();
}
function prevStep(){
  const i = ORDER.indexOf(step); let p = ORDER[i-1];
  if(p==="serie" && !needsSerie()) p = ORDER[i-2];
  step = p; render();
}
function toggleArr(arr,val){ const i=arr.indexOf(val); if(i>-1) arr.splice(i,1); else arr.push(val); }
function fmt(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g," "); }

function spawnDust(ev){
  try{
    const x = ev.clientX || (ev.target.getBoundingClientRect().left+20);
    const y = ev.clientY || (ev.target.getBoundingClientRect().top+20);
    for(let i=0;i<6;i++){
      const d = document.createElement('div');
      d.className='dust';
      const dx = (Math.random()-0.5)*70;
      const dy = -30 - Math.random()*40;
      d.style.left = x+'px'; d.style.top = y+'px';
      d.style.setProperty('--dx', dx+'px'); d.style.setProperty('--dy', dy+'px');
      d.style.animation = 'dustFloat .7s ease-out forwards';
      document.body.appendChild(d);
      setTimeout(()=>d.remove(), 750);
    }
  }catch(e){}
}

function render(){
  document.getElementById('scene').dataset.phase = PHASES[step] || 'matin';
  const stage = document.getElementById('stage');
  if(NO_HEADER.includes(step)){
    stage.innerHTML = body();
  } else {
    stage.innerHTML = header() + '<div class="content">' + body() + '</div>';
  }
}

function header(){
  const visible = visibleSteps();
  const idx = visible.indexOf(step);
  const canBack = ORDER.indexOf(step) > 0;
  const skippable = ["matieres","objectifs"].includes(step);
  const shells = visible.map((s,i)=>`<span class="shell ${i<=idx?'done':''} ${i===idx?'now':''}"></span>`).join("");
  return `
    <div class="topbar">
      <button class="back-btn" ${canBack? "" : "disabled"} onclick="prevStep()">‹</button>
      <div class="shells">${shells}</div>
      ${skippable ? `<button class="skip" onclick="nextStep()">Passer</button>` : `<span style="width:36px;"></span>`}
    </div>
  `;
}

function body(){
  switch(step){
    case "welcome": return viewWelcome();
    case "prenom": return viewPrenom();
    case "profil": return viewProfil();
    case "niveau": return viewNiveau();
    case "classe": return viewClasse();
    case "serie": return viewSerie();
    case "matieres": return viewMatieres();
    case "objectifs": return viewObjectifs();
    case "temps": return viewTemps();
    case "nbenfants": return viewNbEnfants();
    case "pricing": return viewPricing();
    case "final": return viewFinal();
    case "form": return viewForm();
    case "success": return viewSuccess();
    case "login": return viewLogin();
    case "loginSuccess": return viewLoginSuccess();
    case "espace": return viewEspace();
    case "lecon": return viewLecon();
    case "quiz": return viewQuiz();
    case "fiche": return viewFiche();
    case "flashlist": return viewFlashList();
    case "defi": return viewDefi();
    case "coach": return viewCoach();
  }
}

function showToast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2200);
}

const PREVIEW_LOOKUP = {
  cours:      {matiere:'Mathématiques', classe:'CM2', titre:'Les pourcentages'},
  fiches:     {matiere:'Français', classe:'CM2', titre:'Les propositions'},
  revision:   {matiere:'Éveil / Sciences', classe:'CM2', titre:'La croissance du corps humain'},
  exercices:  {matiere:'Mathématiques', classe:'CE2', titre:'La technique de la division'},
  quiz:       {matiere:'Mathématiques', classe:'CM2', titre:'Les pourcentages'},
  defis:      {matiere:'Histoire-Géo', classe:'CM2', titre:'L\'indépendance du Sénégal (1960)'},
  flashcards: {matiere:'Anglais (initiation)', classe:'CE1', titre:'The verb "to be" (Le verbe être)'}
};
let previewKind = null;
let previewData = null;
let previewAnswered = false;
let previewSelected = null;
let flashFlipped = false;

async function tileClick(kind){ openPreview(kind); }

async function openPreview(kind){
  previewKind = kind; previewData = null; previewAnswered = false; previewSelected = null; flashFlipped = false;
  renderPreview();
  if(kind==='video' || kind==='coachia'){ previewData = {}; renderPreview(); return; }
  const lookup = PREVIEW_LOOKUP[kind];
  try{
    const { data: lecon, error } = await sb.from('lecons').select('*')
      .eq('matiere', lookup.matiere).eq('classe', lookup.classe).eq('titre', lookup.titre).single();
    if(error) throw error;
    let quizQ = null;
    if(kind==='quiz' || kind==='defis'){
      const { data: qs } = await sb.from('quiz_questions').select('*').eq('lecon_id', lecon.id).order('ordre').limit(1);
      quizQ = qs && qs[0];
    }
    previewData = { lecon, quizQ };
  }catch(e){
    previewData = { error:true };
  }
  renderPreview();
}

function closePreview(){ previewKind = null; renderPreview(); }

function previewSelectAnswer(i){
  if(previewAnswered) return;
  previewSelected = i; previewAnswered = true; renderPreview();
}

function renderPreview(){
  let el = document.getElementById('previewRoot');
  if(!el){ el = document.createElement('div'); el.id = 'previewRoot'; document.body.appendChild(el); }
  el.innerHTML = previewKind ? previewModalHtml() : '';
}

function previewModalHtml(){
  let inner = '';
  if(previewKind==='video'){
    inner = `<span class="ptag">Bientôt disponible</span><h3>🎬 Vidéos de cours</h3>
      <div class="pmodal-body">Les capsules vidéo par matière et par classe arrivent très bientôt sur Sunu École. En attendant, les cours et quiz complets sont déjà disponibles du CI à la Terminale !</div>`;
  } else if(previewKind==='coachia'){
    inner = `<span class="ptag">Aperçu</span><h3>🤖 Ton Coach IA</h3>
      <div class="pmodal-body">« Jërejëf ! Je vois que tu avances bien en Mathématiques. On continue avec les pourcentages ? Je suis là pour t'expliquer chaque étape et te motiver jusqu'au BFEM ou au Bac. Sama xarit, tu peux y arriver ! »</div>
      <div class="pmodal-body" style="color:var(--ink-soft); font-size:12.5px;">Le Coach IA s'adapte à tes difficultés et te propose un quiz personnalisé chaque jour.</div>`;
  } else if(previewData===null){
    inner = `<h3>Chargement...</h3>`;
  } else if(previewData.error || !previewData.lecon){
    inner = `<h3>Aperçu indisponible</h3><div class="pmodal-body">Ce contenu sera bientôt disponible pour cette classe.</div>`;
  } else if(previewKind==='flashcards'){
    const l = previewData.lecon;
    const lines = l.contenu.split(/\n+/).map(s=>s.trim()).filter(s=>s.length>10);
    const back = (lines[0] || l.contenu).slice(0,170);
    inner = `<span class="ptag">${l.matiere} · ${l.classe}</span><h3>🃏 Flashcard</h3>
      <div class="pflip" onclick="flashFlipped=!flashFlipped; renderPreview();">${flashFlipped ? back : l.titre}</div>
      <p style="text-align:center; font-size:12px; color:var(--ink-soft); margin-top:8px;">Touche la carte pour ${flashFlipped?'revoir la question':'voir la réponse'}</p>`;
  } else if(previewKind==='quiz' || previewKind==='defis'){
    const q = previewData.quizQ;
    if(!q){ inner = `<h3>Aperçu indisponible</h3>`; }
    else {
      inner = `<span class="ptag">${previewData.lecon.matiere} · ${previewData.lecon.classe}</span><h3>${previewKind==='defis'?'🏆 Défi du jour':'🧠 Question exemple'}</h3>
      <div class="pmodal-body" style="font-weight:700;">${q.question}</div>
      ${q.choix.map((c,i)=>{
        let cls='option';
        if(previewAnswered && i===q.reponse_index) cls+=' selected';
        return `<div class="${cls}" style="${previewAnswered && i===previewSelected && i!==q.reponse_index?'border-color:var(--terracotta);background:#FBE3D8;':''}" onclick="previewSelectAnswer(${i})">${c}</div>`;
      }).join("")}
      ${previewAnswered ? `<div class="tip"><span class="emoji">💡</span><p>${q.explication||''}</p></div>` : ""}`;
    }
  } else {
    const l = previewData.lecon;
    let content = l.contenu;
    if(previewKind==='fiches'){
      content = l.contenu.split(/\n+/).filter(s=>s.trim()).slice(0,6).join('\n');
    }
    inner = `<span class="ptag">${l.matiere} · ${l.classe}</span><h3>${l.titre}</h3><div class="pmodal-body">${content}</div>`;
  }
  return `<div class="pmodal-backdrop" onclick="if(event.target===this) closePreview();">
    <div class="pmodal">
      <button class="pmodal-close" onclick="closePreview()">✕</button>
      ${inner}
      <button class="cta" style="margin-top:6px;" onclick="closePreview(); if(loggedPrenom||sessionActive){ openEspace(); } else { step='prenom'; render(); }">${(loggedPrenom||sessionActive) ? 'Voir mes cours 📖' : 'Commencer maintenant 🚀'}</button>
    </div>
  </div>`;
}

function welcomeGo(delta){
  welcomeSlide = (welcomeSlide + delta + WELCOME_SLIDES.length) % WELCOME_SLIDES.length;
  render();
}

function welcomeVisual(kind){
  if(kind==="subjects"){
    return `<button class="wnav left" onclick="welcomeGo(-1)">‹</button>
      <div class="wcards">
        <div class="wcard right"><div class="top" style="background:linear-gradient(135deg,var(--leaf-light),var(--leaf));">🎓</div><div class="label">BFEM / Bac</div></div>
        <div class="wcard left"><div class="top" style="background:linear-gradient(135deg,#F5B199,var(--terracotta));">🖊️</div><div class="label">Français</div></div>
        <div class="wcard center"><div class="top" style="background:linear-gradient(135deg,var(--gold-warm),var(--gold));">🔢</div><div class="label">Mathématiques</div></div>
      </div>
      <button class="wnav right" onclick="welcomeGo(1)">›</button>`;
  }
  if(kind==="method"){
    return `<button class="wnav left" onclick="welcomeGo(-1)">‹</button>
      <div class="wgrid">
        <div class="wchip" onclick="tileClick('revision')"><span class="ic">📝</span>Révision</div>
        <div class="wchip" onclick="tileClick('video')"><span class="ic">🎬</span>Vidéo</div>
        <div class="wchip terr" onclick="tileClick('defis')"><span class="ic">🏆</span>Défis</div>
        <div class="wchip" onclick="tileClick('exercices')"><span class="ic">✏️</span>Exercices</div>
        <div class="wchip gold" onclick="tileClick('cours')"><span class="ic">📖</span>Cours</div>
        <div class="wchip" onclick="tileClick('fiches')"><span class="ic">🖼️</span>Fiches</div>
        <div class="wchip green" onclick="tileClick('quiz')"><span class="ic">🧠</span>Quiz</div>
        <div class="wchip" onclick="tileClick('flashcards')"><span class="ic">🃏</span>Flashcards</div>
        <div class="wchip" onclick="tileClick('coachia')"><span class="ic">🤖</span>Coach IA</div>
      </div>
      <button class="wnav right" onclick="welcomeGo(1)">›</button>`;
  }
  if(kind==="tutors"){
    return `<button class="wnav left" onclick="welcomeGo(-1)">‹</button>
      <div class="wtutor">
        <div class="wbubble q">?</div>
        <div class="wbubble a">•••</div>
        <div class="wavatar a1">👩🏾‍🏫</div>
        <div class="wavatar a2">🧑🏾‍🎓</div>
      </div>
      <button class="wnav right" onclick="welcomeGo(1)">›</button>`;
  }
  return `<button class="wnav left" onclick="welcomeGo(-1)">‹</button>
    <div class="wresult">
      <div class="wsun2"></div>
      <span class="wx" style="left:2px; top:-4px;">✕</span>
      <span class="wx" style="right:26px; top:172px;">✕</span>
      <div class="wpaper">
        <div class="grade">18</div>
        <div class="ln"></div><div class="ln"></div><div class="ln" style="width:65%;"></div>
      </div>
    </div>
    <button class="wnav right" onclick="welcomeGo(1)">›</button>`;
}

function viewWelcome(){
  const s = WELCOME_SLIDES[welcomeSlide];
  return `
  <div class="welcome">
    <div class="wbrand">
      <div class="logo"><img src="logo-emblem.png" class="logo-emblem" alt="Sunu École">SUNU ÉCOLE</div>
      <div class="tagline">L'arbre à palabres du savoir</div>
    </div>
    <div class="wstage">${welcomeVisual(s.kind)}</div>
    <h1 class="wheadline">${s.title}</h1>
    <p class="wsubtitle">${s.sub}</p>
    <div class="wdots">${WELCOME_SLIDES.map((_,i)=>`<button class="wdot ${i===welcomeSlide?'active':''}" onclick="welcomeSlide=${i}; render();"></button>`).join("")}</div>
    <button class="wcta" onclick="step='prenom'; render();">C'est parti 🚀</button>
    <button class="wlogin" onclick="step='login'; render();">Connexion</button>
  </div>
  `;
}

function viewPrenom(){
  return `
    <div class="brandbar">
      <div class="brand"><img src="logo-emblem.png" class="logo-emblem-sm" alt="Sunu École">Sunu École</div>
      <div class="brand-sub">L'arbre à palabres du savoir</div>
    </div>
    <p class="bubble">${BUBBLES.prenom}</p>
    <h1 class="title">Quel est le prénom de l'élève ?</h1>
    <div class="tip"><span class="emoji">💡</span><p>Ce profil concerne un seul élève. Tu pourras en ajouter d'autres à la fin de l'inscription.</p></div>
    <div class="field">
      <div class="lined">
        <input id="prenomInput" type="text" placeholder="Ex : Fatou" value="${escHtml(ans.prenom)}" oninput="ans.prenom=this.value; document.getElementById('btnPrenom').disabled = !this.value.trim();">
      </div>
    </div>
    <button class="cta" id="btnPrenom" ${ans.prenom.trim()?"":"disabled"} onclick="nextStep()">Continuer</button>
  `;
}

function viewProfil(){
  const name = escHtml(ans.prenom) || "cet élève";
  const isEleve = ans.profil === 'eleve';
  const canContinue = ans.profil==='parent' || (ans.profil==='eleve' && ans.consentAge);
  return `
    <h1 class="title">${name}, qui s'inscrit aujourd'hui ?</h1>
    <div class="tip"><span class="emoji">👋</span><p>Cela nous aide à adapter l'accompagnement et les accès au compte.</p></div>
    <div class="option ${ans.profil==='parent'?'selected':''}" onclick="ans.profil='parent'; ans.consentAge=false; spawnDust(event); render();"><span class="em">☕</span> Un parent</div>
    <div class="option ${isEleve?'selected':''}" onclick="ans.profil='eleve'; spawnDust(event); render();"><span class="em">🎒</span> ${name} lui-même / elle-même</div>
    ${isEleve ? `
    <div class="checkrow ${ans.consentAge?'selected':''}" onclick="ans.consentAge=!ans.consentAge; render();" style="margin-top:6px;">
      <span class="lbl"><span class="em">🔞</span>Je confirme avoir plus de 16 ans</span>
      <span class="box">${ans.consentAge?'✓':''}</span>
    </div>
    <p style="font-size:12.5px; color:var(--ink-soft); margin:-4px 0 0;">En dessous de 16 ans, l'inscription doit être faite par un parent ou tuteur.</p>
    ` : ""}
    <div class="grow"></div>
    <button class="cta" ${canContinue?"":"disabled"} onclick="nextStep()">Continuer</button>
  `;
}

function viewNiveau(){
  const name = escHtml(ans.prenom) || "l'élève";
  return `
    <h1 class="title">Dans quel cycle étudie ${name} ?</h1>
    <div class="tip"><span class="emoji">✅</span><p>Tous nos contenus sont conformes au programme officiel du Ministère de l'Éducation nationale du Sénégal.</p></div>
    <div class="option ${ans.niveau==='primaire'?'selected':''}" onclick="ans.niveau='primaire'; ans.classe=null; spawnDust(event); render();"><span class="em">🏀</span> Primaire</div>
    <div class="option ${ans.niveau==='college'?'selected':''}" onclick="ans.niveau='college'; ans.classe=null; spawnDust(event); render();"><span class="em">📚</span> Collège</div>
    <div class="option ${ans.niveau==='lycee'?'selected':''}" onclick="ans.niveau='lycee'; ans.classe=null; spawnDust(event); render();"><span class="em">🎓</span> Lycée</div>
    <div class="grow"></div>
    <button class="cta" ${ans.niveau?"":"disabled"} onclick="nextStep()">Continuer</button>
  `;
}

function viewClasse(){
  const list = GRADES[ans.niveau];
  const name = escHtml(ans.prenom) || "l'élève";
  const tip = ans.niveau==="primaire" ? "En primaire, plus de 10 000 contenus sont à la disposition de "+name+"."
            : ans.niveau==="college" ? "Le kit spécial BFEM est inclus dès la classe de 3ème."
            : "Le kit spécial Baccalauréat est inclus dès la Terminale.";
  return `
    <h1 class="title">Dans quelle classe est ${name} ?</h1>
    <div class="tip"><span class="emoji">📘</span><p>${tip}</p></div>
    ${list.map(c=>`<div class="option ${ans.classe===c?'selected':''}" onclick="ans.classe='${c}'; spawnDust(event); render();">${c}</div>`).join("")}
    <div class="grow"></div>
    <button class="cta" ${ans.classe?"":"disabled"} onclick="nextStep()">Continuer</button>
  `;
}

function viewSerie(){
  return `
    <h1 class="title">Quelle série a-t-il/elle choisie ?</h1>
    <div class="tip"><span class="emoji">🧭</span><p>Le contenu proposé s'adapte automatiquement au coefficient de chaque matière selon la série.</p></div>
    ${seriesForClasse().map(s=>`<div class="option ${ans.serie===s?'selected':''}" onclick="ans.serie='${s}'; spawnDust(event); render();">${s}</div>`).join("")}
    <div class="grow"></div>
    <button class="cta" ${ans.serie?"":"disabled"} onclick="nextStep()">Continuer</button>
  `;
}

function viewMatieres(){
  let list;
  if(ans.niveau === 'lycee'){
    const map = ans.classe === '2nde' ? LYCEE_MATIERES_2NDE : LYCEE_MATIERES_PAR_SERIE;
    list = map[trackFromSerie(ans.serie)] || SUBJECTS.lycee;
  } else {
    list = SUBJECTS[ans.niveau];
    if(ans.niveau === 'college' && (ans.classe === '4ème' || ans.classe === '3ème (BFEM)')){
      list = list.concat(COLLEGE_MATIERES_4E_3E);
    }
  }
  const name = escHtml(ans.prenom) || "l'élève";
  return `
    <h1 class="title">Quelles matières réviser en priorité ?</h1>
    <div class="tip"><span class="emoji">📌</span><p>${name} aura accès à toutes les matières du programme, quel que soit ton choix ici.</p></div>
    <div class="grid2">
      ${list.map(s=>`<div class="card-tile ${ans.matieres.includes(s.label)?'selected':''}" onclick="toggleArr(ans.matieres,'${s.label}'); spawnDust(event); render();"><span class="em">${s.em}</span>${s.label}</div>`).join("")}
    </div>
    <div class="grow"></div>
    <button class="cta" ${ans.matieres.length?"":"disabled"} onclick="nextStep()">Continuer (${ans.matieres.length} sélectionnée${ans.matieres.length>1?'s':''})</button>
  `;
}

function viewObjectifs(){
  return `
    <h1 class="title">Quel est votre objectif ici ?</h1>
    ${OBJECTIFS.map(o=>`<div class="checkrow ${ans.objectifs.includes(o.label)?'selected':''}" onclick="toggleArr(ans.objectifs,'${o.label}'); spawnDust(event); render();"><span class="lbl"><span class="em">${o.em}</span>${o.label}</span><span class="box">${ans.objectifs.includes(o.label)?'✓':''}</span></div>`).join("")}
    <div class="grow"></div>
    <button class="cta" ${ans.objectifs.length?"":"disabled"} onclick="nextStep()">Continuer (${ans.objectifs.length} sélectionné${ans.objectifs.length>1?'s':''})</button>
  `;
}

function viewTemps(){
  const name = escHtml(ans.prenom) || "il/elle";
  const val = TEMPS[ans.temps];
  return `
    <h1 class="title">Combien de temps par jour ?</h1>
    <div class="slidewrap">
      <div class="slideval">${val} min</div>
      <p>Chaque minute compte sous le soleil de Dakar comme ailleurs : ${name} avance déjà dans la bonne direction. 🌳</p>
      <input type="range" min="0" max="${TEMPS.length-1}" step="1" value="${ans.temps}" oninput="ans.temps=parseInt(this.value); render();">
      <div class="slide-labels"><span>- de 15 min</span><span>+ d'1h</span></div>
    </div>
    <div class="grow"></div>
    <button class="cta" onclick="nextStep()">Continuer</button>
  `;
}

function viewNbEnfants(){
  const opts = [
    {v:"1", em:"🎧", label:"1 enfant"}, {v:"2", em:"🎧😎", label:"2 enfants"},
    {v:"3", em:"🎧😎🧢", label:"3 enfants"}, {v:"4+", em:"👨‍👩‍👧‍👦", label:"4 enfants et plus"}
  ];
  return `
    <h1 class="title">Combien d'enfants inscrire ?</h1>
    <div class="tip"><span class="emoji">💚</span><p>Un abonnement Famille permet d'ajouter, à tout moment, jusqu'à 3 comptes enfants.</p></div>
    ${opts.map(o=>`<div class="option ${ans.nbEnfants===o.v?'selected':''}" onclick="ans.nbEnfants='${o.v}'; spawnDust(event); render();"><span class="em">${o.em}</span> ${o.label}</div>`).join("")}
    <div class="grow"></div>
    <button class="link-skip" onclick="nextStep()">Passer et m'inscrire</button>
  `;
}

function viewPricing(){
  const isPremium = ans.plan==="premium";
  const priceY = getPrice(ans.plan, "12mois");
  const priceM = getPrice(ans.plan, "1mois");
  const annual = priceY*12;
  return `
    <div class="brandbar" style="margin-bottom:6px;"><div class="brand"><img src="logo-emblem.png" class="logo-emblem-sm" alt="Sunu École">Sunu École</div></div>
    <div class="segmented">
      <button class="${isPremium?'active':''}" onclick="ans.plan='premium'; render();">👑 Premium</button>
      <button class="${!isPremium?'active':''}" onclick="ans.plan='standard'; render();">Standard</button>
    </div>
    <div class="plan-card">
      <span class="eyebrow">Recommandé</span>
      <h3>${isPremium? "Le meilleur accompagnement pour réussir" : "L'essentiel du programme sénégalais"}</h3>
      <p class="desc">${isPremium? "100% du programme MEN + un professeur et une IA à chaque étape." : "Cours, fiches, quiz et exercices conformes au programme officiel."}</p>
      <span class="save-badge">Économisez -62%</span>
      <div class="price-opt ${ans.duree==='12mois'?'chosen':''}" onclick="ans.duree='12mois'; render();">
        <div class="dot"></div>
        <div><div class="tag">12 mois</div><div style="font-size:13.5px;">${fmt(priceY)} FCFA / mois <span style="color:var(--ink-soft); font-weight:500;">(${fmt(annual)} FCFA / an)</span></div><div class="most">❤️ Offre la plus choisie</div></div>
      </div>
      <div class="price-opt ${ans.duree==='1mois'?'chosen':''}" onclick="ans.duree='1mois'; render();">
        <div class="dot"></div>
        <div><div class="tag">1 mois</div><div style="font-size:13.5px;">${fmt(priceM)} FCFA / mois</div></div>
      </div>
      <div class="callout">🎁 Cahiers de vacances BFEM & Bac inclus pour réviser avant la rentrée</div>
      ${isPremium ? `
        <div class="feature"><span class="em">📗</span><div><div class="t">100% du programme sénégalais</div><div class="d">Cours, fiches, quiz, vidéos, kit BFEM et Bac.</div></div></div>
        <div class="feature"><span class="em">💬</span><div><div class="t">Tchat avec un professeur</div><div class="d">Il pose ses questions, un prof lui répond.</div></div></div>
        <div class="feature"><span class="em">🤖</span><div><div class="t">Coach IA 24h/24</div><div class="d">Pour l'accompagner et le motiver dans ses révisions.</div></div></div>
        <div class="feature"><span class="em">✨</span><div><div class="t">Génération de contenus sur-mesure</div><div class="d">Transforme ses cours en fiches et flashcards en un clic.</div></div></div>
        <div class="feature"><span class="em">🔥</span><div><div class="t">Quiz quotidien personnalisé</div><div class="d">Basé sur ses difficultés pour maîtriser les notions à revoir.</div></div></div>
      ` : `
        <div class="feature"><span class="em">📗</span><div><div class="t">100% du programme sénégalais</div><div class="d">Cours, fiches, quiz, exercices, vidéos.</div></div></div>
        <div class="feature"><span class="em">🎓</span><div><div class="t">Kit BFEM et Bac</div><div class="d">Annales corrigées et méthodologie officielle.</div></div></div>
      `}
    </div>
    <div class="callout green">⭐ 89% des familles sénégalaises choisissent l'offre Premium</div>
    <div class="testi">
      <div class="stars-r">★★★★★</div>
      <p>« Mon fils est passé de 9/20 à 15/20 en maths avant le BFEM. Sama xarit ! »</p>
      <div class="who">Aïda D., maman à Thiès</div>
    </div>
    <div class="payments">
      <span class="paychip">🟠 Orange Money</span>
      <span class="paychip">🔵 Wave</span>
      <span class="paychip">💳 Carte bancaire</span>
    </div>
    <button class="cta" style="margin-top:14px;" onclick="nextStep()">Continuer</button>
    <p style="text-align:center; font-size:12px; color:var(--ink-soft); margin-top:8px;">✓ Résiliable à tout moment, sans frais</p>
  `;
}

function viewFinal(){
  const name = escHtml(ans.prenom) || "ton enfant";
  return `
  <div class="final-wrap">
    <div class="final-hero">
      <div class="lion-big">🦁</div>
      <h2>Espace de travail prêt !</h2>
      <p style="font-family:'Caveat'; font-size:17px; color:var(--gold-warm); margin-top:4px;">${BUBBLES.final}</p>
    </div>
    <div class="check-item"><span>Personnalisation des informations</span><span class="c">✓</span></div>
    <div class="check-item"><span>Création de l'interface de ${name}</span><span class="c">✓</span></div>
    <div class="check-item"><span>Ajout de ses matières</span><span class="c">✓</span></div>
    <div class="check-item active"><span>Espace de travail prêt !</span><span class="c">✓</span></div>
    <button class="final-cta" onclick="nextStep()">Créer mes identifiants</button>
  </div>`;
}

function viewForm(){
  return `
  <div class="form-wrap">
    <div class="brandbar" style="margin-bottom:18px;"><div class="brand"><img src="logo-emblem.png" class="logo-emblem-sm" alt="Sunu École">Sunu École</div></div>
    <h1 class="title">Créez vos identifiants</h1>
    <p class="subtitle">Dernière étape avant que ${escHtml(ans.prenom)||"votre enfant"} ne commence à réviser.</p>
    <div class="form-field"><label>Adresse e-mail</label><input type="email" id="emailInput" placeholder="vous@exemple.com"></div>
    <div class="form-field"><label>Mot de passe</label><input type="password" id="pwdInput" placeholder="8 caractères minimum"></div>
    <p class="form-msg" id="formMsg"></p>
    <div class="grow"></div>
    <button class="cta" id="submitBtn" onclick="submitAccount()">Valider et accéder à mon espace</button>
  </div>`;
}

let pendingLoginEmail = "";
function goToLogin(){
  step = 'login'; render();
  setTimeout(()=>{ const el = document.getElementById('loginEmail'); if(el) el.value = pendingLoginEmail; }, 0);
}

function viewLogin(){
  return `
  <div class="form-wrap">
    <div class="brandbar" style="margin-bottom:18px;"><div class="brand"><img src="logo-emblem.png" class="logo-emblem-sm" alt="Sunu École">Sunu École</div></div>
    <h1 class="title">Connexion</h1>
    <p class="subtitle">Retrouve ton espace de révision Sunu École.</p>
    <div class="form-field"><label>Adresse e-mail</label><input type="email" id="loginEmail" placeholder="vous@exemple.com"></div>
    <div class="form-field"><label>Mot de passe</label><input type="password" id="loginPwd" placeholder="Ton mot de passe"></div>
    <p class="form-msg" id="loginMsg"></p>
    <div class="grow"></div>
    <button class="cta" id="loginBtn" onclick="submitLogin()">Se connecter</button>
    <button class="wlogin" style="margin-top:16px;" onclick="step='welcome'; render();">‹ Retour à l'accueil</button>
  </div>`;
}

async function submitLogin(){
  const email = (document.getElementById('loginEmail').value || "").trim();
  const pwd = document.getElementById('loginPwd').value || "";
  const msg = document.getElementById('loginMsg');
  const btn = document.getElementById('loginBtn');
  msg.style.color = '#ffb4a3';
  msg.textContent = "";

  if(!email || !/^\S+@\S+\.\S+$/.test(email)){
    msg.textContent = "Merci d'indiquer une adresse e-mail valide.";
    return;
  }
  if(!pwd){
    msg.textContent = "Merci d'indiquer ton mot de passe.";
    return;
  }

  btn.disabled = true; btn.textContent = "Connexion en cours...";
  try{
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pwd });
    if(error){
      if(/email not confirmed/i.test(error.message || "")){
        msg.textContent = "Confirme d'abord ton adresse e-mail via le lien reçu, puis reconnecte-toi.";
      } else {
        msg.textContent = "E-mail ou mot de passe incorrect.";
      }
      btn.disabled = false; btn.textContent = "Se connecter";
      return;
    }
    try{
      const { data: eleves } = await sb.from('eleves').select('prenom').eq('user_id', data.user.id).order('created_at', { ascending:false }).limit(1);
      loggedPrenom = (eleves && eleves.length) ? eleves[0].prenom : "";
    }catch(e){ loggedPrenom = ""; }
    sessionActive = true; step = 'loginSuccess'; render();
  }catch(err){
    msg.textContent = (err && err.message) ? err.message : "Une erreur est survenue, réessaie.";
    btn.disabled = false; btn.textContent = "Se connecter";
  }
}

let loggedPrenom = "";
// Retour à l'accueil : ramène un utilisateur connecté vers son espace personnel (loginSuccess),
// plutôt que vers l'écran d'inscription générique destiné aux nouveaux visiteurs.
function goHome(){
  if(loggedPrenom || sessionActive){ step = 'loginSuccess'; } else { step = 'welcome'; welcomeSlide = 0; }
  render();
}
function viewLoginSuccess(){
  const hello = loggedPrenom ? `, ${escHtml(loggedPrenom)}` : "";
  return `
  <div class="welcome" style="background:radial-gradient(120% 80% at 50% -10%, #F0A85C 0%, #C1440E 55%, #6E2A12 100%);">
    <div class="wbrand">
      <div class="logo"><img src="logo-emblem.png" class="logo-emblem" alt="Sunu École">SUNU ÉCOLE</div>
      <div class="tagline">L'arbre à palabres du savoir</div>
    </div>
    <div class="wstage">
      <div class="wgrid">
        <div class="wchip" onclick="openEspace('revision')"><span class="ic">📝</span>Révision</div>
        <div class="wchip" onclick="tileClick('video')"><span class="ic">🎬</span>Vidéo</div>
        <div class="wchip terr" onclick="openDefi()"><span class="ic">🏆</span>Défis</div>
        <div class="wchip" onclick="openEspace('exercices')"><span class="ic">✏️</span>Exercices</div>
        <div class="wchip gold" onclick="openEspace('cours')"><span class="ic">📖</span>Cours</div>
        <div class="wchip" onclick="openEspace('fiches')"><span class="ic">🖼️</span>Fiches</div>
        <div class="wchip green" onclick="openEspace('quiz')"><span class="ic">🧠</span>Quiz</div>
        <div class="wchip" onclick="openEspace('flashcards')"><span class="ic">🃏</span>Flashcards</div>
        <div class="wchip" onclick="openCoach()"><span class="ic">🤖</span>Coach IA</div>
      </div>
    </div>
    <h1 class="wheadline">Content de te revoir${hello} !</h1>
    <p class="wsubtitle">Ton espace de révision t'attend, avec tes cours, tes matières et ton coach IA.</p>
    <button class="wcta" onclick="openEspace()">📖 Voir mes cours</button>
    <button class="wlogin" onclick="goHome();">Retour à l'accueil</button>
  </div>`;
}

async function submitAccount(){
  const email = (document.getElementById('emailInput').value || "").trim();
  const pwd = document.getElementById('pwdInput').value || "";
  const msg = document.getElementById('formMsg');
  const btn = document.getElementById('submitBtn');
  msg.textContent = "";
  msg.style.color = '#ffb4a3';

  if(!email || !/^\S+@\S+\.\S+$/.test(email)){
    msg.textContent = "Merci d'indiquer une adresse e-mail valide.";
    return;
  }
  if(pwd.length < 8){
    msg.textContent = "Le mot de passe doit contenir au moins 8 caractères.";
    return;
  }

  btn.disabled = true; btn.textContent = "Création en cours...";
  try{
    let userId, session;
    const { data, error } = await sb.auth.signUp({ email, password: pwd });

    if(error){
      const already = /already registered|already exists|user_already_exists/i.test(error.message || "");
      if(!already) throw error;

      // Compte déjà existant : on tente une connexion avec les identifiants fournis
      const { data: signInData, error: signInErr } = await sb.auth.signInWithPassword({ email, password: pwd });
      if(signInErr){
        pendingLoginEmail = email;
        msg.innerHTML = 'Cette adresse e-mail est déjà utilisée. <button onclick="goToLogin()" style="background:none;border:none;color:#fff;text-decoration:underline;font-weight:700;cursor:pointer;padding:0;font-size:inherit;">Se connecter</button> à la place, ou utilise une autre adresse e-mail.';
        btn.disabled = false; btn.textContent = "Valider et accéder à mon espace";
        return;
      }
      userId = signInData.user && signInData.user.id;
      session = signInData.session;
    } else {
      userId = data.user && data.user.id;
      session = data.session;
    }

    if(!userId) throw new Error("Impossible de créer le compte, réessaie.");

    if(session){
      const prix = getPrice(ans.plan, ans.duree);

      const { data: eleveRow, error: eleveErr } = await sb.from('eleves').insert({
        user_id: userId, profil: ans.profil, consent_maj: ans.profil==='eleve' ? !!ans.consentAge : null,
        prenom: ans.prenom, niveau: ans.niveau,
        classe: ans.classe, serie: ans.serie, temps_revision_minutes: TEMPS[ans.temps],
        nb_enfants_foyer: ans.nbEnfants
      }).select().single();
      if(eleveErr) throw eleveErr;

      const { error: aboErr } = await sb.from('abonnements').insert({
        user_id: userId, plan: ans.plan, duree: ans.duree, prix_fcfa: prix
      });
      if(aboErr) throw aboErr;

      if(ans.matieres.length){
        const { error: mErr } = await sb.from('eleve_matieres').insert(ans.matieres.map(m=>({eleve_id: eleveRow.id, matiere: m})));
        if(mErr) throw mErr;
      }
      if(ans.objectifs.length){
        const { error: oErr } = await sb.from('eleve_objectifs').insert(ans.objectifs.map(o=>({eleve_id: eleveRow.id, objectif: o})));
        if(oErr) throw oErr;
      }

      sessionActive = true; step = 'success'; render();
    } else {
      msg.style.color = '#fff';
      msg.textContent = "Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse, puis reconnecte-toi pour finaliser le profil.";
      btn.textContent = "Valider et accéder à mon espace";
      btn.disabled = false;
    }
  }catch(err){
    msg.style.color = '#ffb4a3';
    msg.textContent = (err && err.message) ? err.message : "Une erreur est survenue, réessaie.";
    btn.disabled = false; btn.textContent = "Valider et accéder à mon espace";
  }
}


function viewSuccess(){
  const name = escHtml(ans.prenom) || "champion";
  return `
  <div class="success">
    <div class="big-lion">🦁🌳</div>
    <div class="wolof">${BUBBLES.success}</div>
    <h2>Bienvenue sur Sunu École, ${name} t'attend !</h2>
    <p>Ton espace de révision 100% conforme au programme sénégalais est prêt : cours, fiches, quiz et coach IA t'accompagnent jusqu'au BFEM ou au Bac.</p>
    <button class="cta" style="max-width:260px;" onclick="openEspace()">📖 Découvrir mes cours</button>
    <button class="wlogin" style="margin-top:14px;" onclick="step='prenom'; ans={prenom:'',profil:null,consentAge:false,niveau:null,classe:null,serie:null,matieres:[],objectifs:[],temps:2,nbEnfants:null,plan:'premium',duree:'12mois'}; render();">Recommencer la démo</button>
  </div>`;
}

/* ---------------- Espace de cours ---------------- */
let espaceLecons = [];
let espaceLoading = false;
let espaceClasse = null;
let espaceMatieres = [];
let espaceMode = 'cours';
let currentLecon = null;
let currentQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;
let quizSelected = null;

const MODE_LABELS = {
  cours: { titre:'Mes cours', emoji:'📖', vide:'Choisis des matières lors de l\'inscription pour voir apparaître tes leçons ici.' },
  revision: { titre:'Mes révisions', emoji:'📝', vide:'Aucune leçon à réviser pour l\'instant.' },
  exercices: { titre:'Mes exercices', emoji:'✏️', vide:'Aucun exercice disponible pour l\'instant.' },
  fiches: { titre:'Mes fiches', emoji:'🖼️', vide:'Aucune fiche disponible pour l\'instant.' },
  quiz: { titre:'Mes quiz', emoji:'🧠', vide:'Aucun quiz disponible pour l\'instant.' },
  flashcards: { titre:'Mes flashcards', emoji:'🃏', vide:'Aucune flashcard disponible pour l\'instant.' }
};

async function openEspace(mode){
  espaceMode = mode || 'cours';
  espaceLoading = true; step = 'espace'; render();
  try{
    const { data: userData } = await sb.auth.getUser();
    const user = userData && userData.user;
    let matieres = [];
    let classe = null;
    if(user){
      const { data: eleves } = await sb.from('eleves').select('id,classe,serie').eq('user_id', user.id).order('created_at', { ascending:false }).limit(1);
      if(eleves && eleves.length){
        classe = contentClasse(eleves[0].classe, eleves[0].serie);
        const { data: em } = await sb.from('eleve_matieres').select('matiere').eq('eleve_id', eleves[0].id);
        matieres = (em||[]).map(r=>r.matiere);
      }
    }
    if(!classe) classe = contentClasse(ans.classe, ans.serie) || null;
    let req = sb.from('lecons').select('*').order('matiere', { ascending:true }).order('ordre', { ascending:true });
    if(classe) req = req.eq('classe', classe);
    if(matieres.length) req = req.in('matiere', matieres);
    const { data: lecons } = await req;
    espaceLecons = lecons || [];
    espaceClasse = classe;
    espaceMatieres = matieres;
  }catch(e){
    espaceLecons = [];
  }
  espaceLoading = false; render();
}

function viewEspace(){
  if(espaceLoading){
    return `<div class="success"><div class="big-lion">🌳</div><p>Chargement...</p></div>`;
  }
  const meta = MODE_LABELS[espaceMode] || MODE_LABELS.cours;
  const grouped = {};
  espaceLecons.forEach(l=>{ (grouped[l.matiere] = grouped[l.matiere]||[]).push(l); });
  const matieresList = Object.keys(grouped);
  return `
  <div class="form-wrap" style="background:var(--slate-bg); color:var(--ink);">
    <button class="back-btn" style="background:var(--leaf-dark); margin-bottom:14px;" onclick="goHome();">‹</button>
    <div class="brandbar"><div class="brand" style="color:var(--leaf-dark);"><img src="logo-emblem.png" class="logo-emblem-sm" alt="Sunu École">${meta.titre}</div></div>
    ${espaceClasse ? `<p style="text-align:center; margin:-10px 0 14px; font-weight:700; color:var(--terracotta);">Classe : ${espaceClasse}</p>` : ""}
    ${matieresList.length===0 ? `<p class="subtitle">${espaceClasse ? `Le contenu pour la classe de ${espaceClasse} arrive bientôt ! Pour l'instant, le programme complet est disponible du CI au CM2.` : meta.vide}</p>` : ""}
    ${matieresList.map(m=>`
      <h3 style="margin:14px 0 8px; color:var(--leaf-dark); font-size:16px;">${m}</h3>
      ${grouped[m].map(l=>`
        <div class="option" onclick="openLecon('${l.id}','${espaceMode}')">
          <span class="em">${meta.emoji}</span>
          <div><div style="font-weight:700;">${l.titre}</div><div style="font-size:12.5px; color:var(--ink-soft); font-weight:400;">${l.resume||''}</div></div>
        </div>
      `).join("")}
    `).join("")}
    <div class="grow"></div>
  </div>`;
}

async function openLecon(id, mode){
  const { data: lecon } = await sb.from('lecons').select('*').eq('id', id).single();
  const { data: qs } = await sb.from('quiz_questions').select('*').eq('lecon_id', id).order('ordre');
  currentLecon = lecon;
  currentQuestions = qs || [];
  quizIndex = 0; quizScore = 0; quizAnswered = false; quizSelected = null;
  if(mode==='fiches'){ step = 'fiche'; }
  else if(mode==='flashcards'){ flashIndex = 0; flashFlipped = false; step = 'flashlist'; }
  else if(mode==='quiz' || mode==='exercices'){ step = 'quiz'; }
  else { step = 'lecon'; }
  render();
}

function viewLecon(){
  if(!currentLecon) return `<div class="success"><p>Leçon introuvable.</p></div>`;
  const paragraphs = currentLecon.contenu.split(/\n\n+/).map(p=>{
    const withBold = p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return `<p style="margin:0 0 14px; line-height:1.6; font-size:14.5px;">${withBold}</p>`;
  }).join("");
  return `
  <div class="form-wrap" style="background:var(--slate-bg); color:var(--ink); padding-bottom:20px;">
    <button class="back-btn" style="background:var(--leaf-dark); margin-bottom:14px;" onclick="openEspace()">‹</button>
    <span class="eyebrow" style="align-self:flex-start;">${currentLecon.matiere}</span>
    <h1 class="title" style="margin-top:8px;">${currentLecon.titre}</h1>
    <div>${paragraphs}</div>
    <div class="grow"></div>
    <button class="cta" onclick="step='quiz'; render();">🧠 Commencer le quiz (${currentQuestions.length} questions)</button>
  </div>`;
}

function viewQuiz(){
  if(!currentQuestions.length){
    return `<div class="success"><p>Pas de quiz pour cette leçon.</p><button class="cta" style="max-width:220px;" onclick="openEspace()">Retour aux cours</button></div>`;
  }
  if(quizIndex >= currentQuestions.length){
    const pct = Math.round((quizScore/currentQuestions.length)*100);
    return `
    <div class="success">
      <div class="big-lion">${pct>=70?'🦁🏆':'🦁'}</div>
      <h2>Score : ${quizScore}/${currentQuestions.length}</h2>
      <p>${pct>=70 ? "Yaakaar ! Tu maîtrises bien cette leçon." : "Jërejëf pour ta tentative, relis la leçon et réessaie pour progresser."}</p>
      <button class="cta" style="max-width:260px;" onclick="openEspace()">Retour aux cours</button>
    </div>`;
  }
  const q = currentQuestions[quizIndex];
  const choices = q.choix;
  return `
  <div class="form-wrap" style="background:var(--slate-bg); color:var(--ink); padding-bottom:20px;">
    <span class="eyebrow" style="align-self:flex-start;">Question ${quizIndex+1} / ${currentQuestions.length}</span>
    <h1 class="title" style="margin-top:8px;">${q.question}</h1>
    ${choices.map((c,i)=>{
      let cls = 'option';
      if(quizAnswered && i===q.reponse_index) cls += ' selected';
      return `<div class="${cls}" style="${quizAnswered && i===quizSelected && i!==q.reponse_index ? 'border-color:var(--terracotta); background:#FBE3D8;' : ''}" onclick="selectAnswer(${i})">${c}</div>`;
    }).join("")}
    ${quizAnswered ? `<div class="tip"><span class="emoji">💡</span><p>${q.explication||''}</p></div>` : ""}
    <div class="grow"></div>
    ${quizAnswered ? `<button class="cta" onclick="nextQuestion()">${quizIndex+1<currentQuestions.length?'Question suivante':'Voir mon score'}</button>` : ""}
  </div>`;
}

function selectAnswer(i){
  if(quizAnswered) return;
  quizSelected = i; quizAnswered = true;
  if(i === currentQuestions[quizIndex].reponse_index) quizScore++;
  render();
}
function nextQuestion(){
  quizIndex++; quizAnswered = false; quizSelected = null; render();
}

/* ---------------- Fiches ---------------- */
function viewFiche(){
  if(!currentLecon) return `<div class="success"><p>Fiche introuvable.</p></div>`;
  const lines = currentLecon.contenu.split(/\n+/).map(s=>s.trim()).filter(s=>s.length>3).slice(0,7);
  const withBold = lines.map(l=>l.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>'));
  return `
  <div class="form-wrap" style="background:var(--slate-bg); color:var(--ink); padding-bottom:20px;">
    <button class="back-btn" style="background:var(--leaf-dark); margin-bottom:14px;" onclick="openEspace('fiches')">‹</button>
    <span class="eyebrow" style="align-self:flex-start;">${currentLecon.matiere} · Fiche</span>
    <h1 class="title" style="margin-top:8px;">${currentLecon.titre}</h1>
    <div class="field" style="min-height:auto;">
      ${withBold.map(l=>`<p style="margin:0 0 10px; line-height:1.5; font-size:14px;">▸ ${l}</p>`).join("")}
    </div>
    <div class="grow"></div>
    <button class="cta" onclick="step='lecon'; render();">📖 Voir le cours complet</button>
    <button class="link-skip" onclick="step='quiz'; render();">Faire le quiz de cette fiche</button>
  </div>`;
}

/* ---------------- Flashcards ---------------- */
let flashIndex = 0;
function viewFlashList(){
  if(!currentQuestions.length){
    return `<div class="success"><p>Pas de flashcards pour cette leçon.</p><button class="cta" style="max-width:220px;" onclick="openEspace('flashcards')">Retour</button></div>`;
  }
  const q = currentQuestions[flashIndex];
  return `
  <div class="form-wrap" style="background:var(--slate-bg); color:var(--ink); padding-bottom:20px;">
    <button class="back-btn" style="background:var(--leaf-dark); margin-bottom:14px;" onclick="openEspace('flashcards')">‹</button>
    <span class="eyebrow" style="align-self:flex-start;">${currentLecon.matiere} · Carte ${flashIndex+1}/${currentQuestions.length}</span>
    <h1 class="title" style="margin-top:8px;">${currentLecon.titre}</h1>
    <div class="pflip" onclick="flashFlipped=!flashFlipped; render();">${flashFlipped ? (q.choix[q.reponse_index] + (q.explication ? ' — '+q.explication : '')) : q.question}</div>
    <p style="text-align:center; font-size:12.5px; color:var(--ink-soft); margin-top:10px;">Touche la carte pour ${flashFlipped?'revoir la question':'voir la réponse'}</p>
    <div class="grow"></div>
    <div style="display:flex; gap:10px;">
      <button class="cta" style="box-shadow:0 5px 0 #5e3b1b; background:var(--wood);" onclick="flashNav(-1)" ${flashIndex===0?'disabled':''}>‹ Précédente</button>
      <button class="cta" onclick="flashNav(1)">${flashIndex+1<currentQuestions.length?'Suivante ›':'Terminer'}</button>
    </div>
  </div>`;
}
function flashNav(delta){
  if(delta>0 && flashIndex+1>=currentQuestions.length){ openEspace('flashcards'); return; }
  flashIndex = Math.max(0, flashIndex+delta); flashFlipped = false; render();
}

/* ---------------- Défi du jour ---------------- */
let defiLecon = null;
let defiQuestion = null;
let defiAnswered = false;
let defiSelected = null;
let defiStreak = 0;
let defiLoading = false;

async function openDefi(){
  defiLoading = true; defiAnswered = false; defiSelected = null; step = 'defi'; render();
  try{
    const { data: userData } = await sb.auth.getUser();
    const user = userData && userData.user;
    let matieres = [], classe = null;
    if(user){
      const { data: eleves } = await sb.from('eleves').select('id,classe,serie').eq('user_id', user.id).order('created_at',{ascending:false}).limit(1);
      if(eleves && eleves.length){
        classe = contentClasse(eleves[0].classe, eleves[0].serie);
        const { data: em } = await sb.from('eleve_matieres').select('matiere').eq('eleve_id', eleves[0].id);
        matieres = (em||[]).map(r=>r.matiere);
      }
    }
    if(!classe) classe = contentClasse(ans.classe, ans.serie) || null;
    let req = sb.from('lecons').select('*');
    if(classe) req = req.eq('classe', classe);
    if(matieres.length) req = req.in('matiere', matieres);
    const { data: lecons } = await req;
    const pool = lecons && lecons.length ? lecons : [];
    if(!pool.length){ defiLecon = null; defiQuestion = null; defiLoading=false; render(); return; }
    const lecon = pool[Math.floor(Math.random()*pool.length)];
    const { data: qs } = await sb.from('quiz_questions').select('*').eq('lecon_id', lecon.id);
    if(!qs || !qs.length){ defiLecon = null; defiQuestion = null; defiLoading=false; render(); return; }
    defiLecon = lecon;
    defiQuestion = qs[Math.floor(Math.random()*qs.length)];
  }catch(e){
    defiLecon = null; defiQuestion = null;
  }
  defiLoading = false; render();
}
function answerDefi(i){
  if(defiAnswered) return;
  defiSelected = i; defiAnswered = true;
  if(i===defiQuestion.reponse_index) defiStreak++; else defiStreak = 0;
  render();
}
function viewDefi(){
  if(defiLoading) return `<div class="success"><div class="big-lion">🏆</div><p>Préparation de ton défi...</p></div>`;
  if(!defiQuestion){
    return `<div class="success"><p>Pas encore de défi disponible pour ta classe.</p><button class="cta" style="max-width:220px;" onclick="goHome();">Retour</button></div>`;
  }
  const q = defiQuestion;
  return `
  <div class="form-wrap" style="background:var(--slate-bg); color:var(--ink); padding-bottom:20px;">
    <button class="back-btn" style="background:var(--terracotta); margin-bottom:14px;" onclick="goHome();">‹</button>
    <span class="eyebrow" style="align-self:flex-start; background:#FDF1D6; color:#8f320a;">🏆 Défi du jour · ${defiLecon.matiere}</span>
    <h1 class="title" style="margin-top:8px;">${q.question}</h1>
    ${q.choix.map((c,i)=>{
      let cls='option';
      if(defiAnswered && i===q.reponse_index) cls+=' selected';
      return `<div class="${cls}" style="${defiAnswered && i===defiSelected && i!==q.reponse_index?'border-color:var(--terracotta); background:#FBE3D8;':''}" onclick="answerDefi(${i})">${c}</div>`;
    }).join("")}
    ${defiAnswered ? `<div class="tip"><span class="emoji">💡</span><p>${q.explication||''}</p></div>
      <div class="callout ${defiSelected===q.reponse_index?'green':''}">${defiSelected===q.reponse_index ? `🔥 Série en cours : ${defiStreak}` : "Série réinitialisée, retente ta chance !"}</div>` : ""}
    <div class="grow"></div>
    ${defiAnswered ? `<button class="cta" onclick="openDefi()">Nouveau défi 🎲</button>` : ""}
  </div>`;
}

/* ---------------- Coach IA (recherche réelle dans les cours) ---------------- */
let coachMessages = [];
let coachLoading = false;

function openCoach(){
  if(!coachMessages.length){
    const name = escHtml(ans.prenom || loggedPrenom || "");
    coachMessages = [{ from:'coach', text: `Jërejëf${name?' '+name:''} ! Pose-moi une question sur ton programme (ex : "les pourcentages", "l'indépendance du Sénégal") et je cherche dans tes cours pour toi. 🌳` }];
  }
  step = 'coach'; render();
}

async function askCoach(){
  const input = document.getElementById('coachInput');
  const question = (input.value||"").trim();
  if(!question) return;
  coachMessages.push({ from:'user', text: question });
  input.value = "";
  coachLoading = true; render();
  try{
    const { data: userData } = await sb.auth.getUser();
    const user = userData && userData.user;
    let matieres = [], classe = null;
    if(user){
      const { data: eleves } = await sb.from('eleves').select('id,classe,serie').eq('user_id', user.id).order('created_at',{ascending:false}).limit(1);
      if(eleves && eleves.length){
        classe = contentClasse(eleves[0].classe, eleves[0].serie);
        const { data: em } = await sb.from('eleve_matieres').select('matiere').eq('eleve_id', eleves[0].id);
        matieres = (em||[]).map(r=>r.matiere);
      }
    }
    if(!classe) classe = contentClasse(ans.classe, ans.serie) || null;
    // On retire les caractères qui ont un sens spécial pour le filtre PostgREST
    // (virgule, parenthèses, %) pour éviter qu'une question normale (ex: contenant
    // une virgule) ne casse la recherche ou n'altère le filtre.
    const safeQ = question.replace(/[,()%*]/g, ' ').trim();
    let lecon = null;
    if(safeQ){
      let reqTitre = sb.from('lecons').select('*').ilike('titre', `%${safeQ}%`);
      let reqContenu = sb.from('lecons').select('*').ilike('contenu', `%${safeQ}%`);
      if(classe){ reqTitre = reqTitre.eq('classe', classe); reqContenu = reqContenu.eq('classe', classe); }
      const [byTitre, byContenu] = await Promise.all([reqTitre.limit(1), reqContenu.limit(1)]);
      lecon = (byTitre.data && byTitre.data[0]) || (byContenu.data && byContenu.data[0]) || null;
    }

    const res = await fetch('/api/coach', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        question,
        prenom: ans.prenom || loggedPrenom || "",
        classe,
        matiere: lecon ? lecon.matiere : (matieres[0]||""),
        contenu: lecon ? lecon.contenu : ""
      })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || "Erreur du coach IA");
    coachMessages.push({ from:'coach', text: data.answer, lecon: lecon || null, excerpt: lecon ? (lecon.contenu.split(/\n+/).find(s=>s.trim().length>20) || lecon.contenu.slice(0,160)) : null });
  }catch(e){
    coachMessages.push({ from:'coach', text: "Petit souci de connexion avec le coach IA, réessaie dans un instant." });
  }
  coachLoading = false; render();
  setTimeout(()=>{ const el = document.getElementById('coachScroll'); if(el) el.scrollTop = el.scrollHeight; }, 30);
}

function viewCoach(){
  return `
  <div class="form-wrap" style="background:#12331f; padding-bottom:14px;">
    <div class="brandbar" style="margin-bottom:10px;"><div class="brand" style="color:#fff;">🤖 Coach IA</div></div>
    <div id="coachScroll" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px; margin-bottom:10px;">
      ${coachMessages.map(m=>{
        if(m.from==='user'){
          return `<div style="align-self:flex-end; background:var(--gold); color:#3d2400; padding:10px 14px; border-radius:14px 14px 2px 14px; max-width:82%; font-weight:600; font-size:14px;">${escHtml(m.text)}</div>`;
        }
        return `<div style="align-self:flex-start; background:#fff; color:var(--ink); padding:12px 14px; border-radius:14px 14px 14px 2px; max-width:88%; font-size:14px; line-height:1.5;">
          ${escHtml(m.text)}
          ${m.lecon ? `<div style="margin-top:8px; padding:10px; background:var(--green-soft); border-radius:10px; font-size:12.5px; color:#2f5c46;">${escHtml(m.excerpt)}</div>
            <button onclick="openLecon('${m.lecon.id}','cours')" style="margin-top:8px; background:var(--terracotta); color:#fff; border:none; border-radius:10px; padding:8px 12px; font-weight:700; font-size:12.5px; cursor:pointer;">Ouvrir la leçon 📖</button>` : ""}
        </div>`;
      }).join("")}
      ${coachLoading ? `<div style="align-self:flex-start; color:#F6E6D6; font-size:13px;">Le coach cherche dans tes cours…</div>` : ""}
    </div>
    <div style="display:flex; gap:8px;">
      <input id="coachInput" type="text" placeholder="Pose ta question..." style="flex:1; padding:12px 14px; border-radius:12px; border:none; font-size:14px;" onkeydown="if(event.key==='Enter') askCoach();">
      <button onclick="askCoach()" style="background:var(--gold); color:#3d2400; border:none; border-radius:12px; padding:0 16px; font-weight:800; cursor:pointer;">➤</button>
    </div>
    <button class="wlogin" style="margin-top:12px;" onclick="goHome();">‹ Retour à l'accueil</button>
  </div>`;
}

render();