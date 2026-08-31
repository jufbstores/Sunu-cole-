// /api/admin.js
// Point d'entrée unique pour l'interface admin : vérifie l'email et le mot
// de passe côté serveur (jamais exposés au client) et utilise la clé
// service_role de Supabase pour lire/écrire les tables classes, matieres
// et abonnements, en contournant les policies RLS destinées au grand public.

const SUPA_URL = "https://txreoozkebqtssofyhup.supabase.co";

async function supaFetch(path, options = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Identifiants admin (côté serveur uniquement, jamais envoyés au client).
  const ADMIN_EMAIL = 'peediouf90@gmail.com';
  const ADMIN_PASSWORD = 'jufbusiness2025';

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Clé de service Supabase non configurée sur le serveur." });
  }

  const { email, password, action, payload } = req.body || {};
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "E-mail ou mot de passe incorrect." });
  }
  if (!action) {
    return res.status(400).json({ error: "Action manquante." });
  }

  try {
    switch (action) {
      case 'ping': {
        return res.status(200).json({ ok: true });
      }

      case 'list_classes': {
        const data = await supaFetch('classes?select=*&order=niveau.asc,ordre.asc');
        return res.status(200).json({ data });
      }
      case 'add_classe': {
        const data = await supaFetch('classes', {
          method: 'POST',
          body: JSON.stringify([{ niveau: payload.niveau, nom: payload.nom, ordre: payload.ordre || 0 }]),
        });
        return res.status(200).json({ data });
      }
      case 'update_classe': {
        const data = await supaFetch(`classes?id=eq.${payload.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ niveau: payload.niveau, nom: payload.nom, ordre: payload.ordre }),
        });
        return res.status(200).json({ data });
      }
      case 'delete_classe': {
        await supaFetch(`classes?id=eq.${payload.id}`, { method: 'DELETE', prefer: 'return=minimal' });
        return res.status(200).json({ ok: true });
      }

      case 'list_matieres': {
        const data = await supaFetch('matieres?select=*&order=niveau.asc,ordre.asc');
        return res.status(200).json({ data });
      }
      case 'add_matiere': {
        const data = await supaFetch('matieres', {
          method: 'POST',
          body: JSON.stringify([{ niveau: payload.niveau, nom: payload.nom, emoji: payload.emoji || '📘', ordre: payload.ordre || 0 }]),
        });
        return res.status(200).json({ data });
      }
      case 'update_matiere': {
        const data = await supaFetch(`matieres?id=eq.${payload.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ niveau: payload.niveau, nom: payload.nom, emoji: payload.emoji, ordre: payload.ordre }),
        });
        return res.status(200).json({ data });
      }
      case 'delete_matiere': {
        await supaFetch(`matieres?id=eq.${payload.id}`, { method: 'DELETE', prefer: 'return=minimal' });
        return res.status(200).json({ ok: true });
      }

      case 'list_abonnes': {
        // Jointure manuelle : abonnements + eleves (le PostgREST embed nécessite une FK déclarée,
        // on fait donc deux requêtes et on les assemble ici).
        const abonnements = await supaFetch('abonnements?select=*&order=created_at.desc');
        const userIds = [...new Set(abonnements.map(a => a.user_id))];
        let elevesByUser = {};
        if (userIds.length) {
          const filter = userIds.map(id => `"${id}"`).join(',');
          const eleves = await supaFetch(`eleves?select=user_id,prenom,niveau,classe&user_id=in.(${filter})`);
          eleves.forEach(e => {
            if (!elevesByUser[e.user_id]) elevesByUser[e.user_id] = [];
            elevesByUser[e.user_id].push(e);
          });
        }
        const merged = abonnements.map(a => ({
          ...a,
          eleves: elevesByUser[a.user_id] || [],
        }));
        return res.status(200).json({ data: merged });
      }

      default:
        return res.status(400).json({ error: "Action inconnue." });
    }
  } catch (err) {
    console.error('Admin handler error:', err);
    return res.status(500).json({ error: err.message || "Une erreur est survenue." });
  }
}
