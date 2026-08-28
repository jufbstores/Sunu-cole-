// /api/coach.js
// Fonction serverless Vercel : reçoit une question de l'élève + le contexte
// (leçon trouvée dans Supabase), interroge Claude côté serveur, et renvoie
// une réponse pédagogique. La clé API n'est jamais exposée au navigateur.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur." });
  }

  const { question, prenom, matiere, classe, contenu } = req.body || {};
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: "Question manquante." });
  }

  const systemPrompt = `Tu es "Coach IA", un tuteur bienveillant de l'application sénégalaise Sunu École.
Tu aides ${prenom || "l'élève"}, en classe de ${classe || "non précisée"}, dans le programme officiel du Sénégal.
${matiere ? `La matière concernée est : ${matiere}.` : ""}
${contenu ? `Voici un extrait du cours lié à sa question, à utiliser comme référence :\n"""${contenu.slice(0, 1500)}"""` : ""}
Réponds en français, de façon claire, courte (4 à 8 phrases), pédagogique, et encourageante.
Tu peux utiliser une expression wolof simple (ex: "Jërejëf", "Yaakaar", "Sama xarit") si cela reste naturel.
Ne réponds jamais à des questions hors du cadre scolaire.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return res.status(502).json({ error: "Le coach IA est momentanément indisponible." });
    }

    const data = await response.json();
    const textBlock = (data.content || []).find(b => b.type === 'text');
    const answer = textBlock ? textBlock.text : "Je n'ai pas pu formuler de réponse, réessaie.";

    return res.status(200).json({ answer });
  } catch (err) {
    console.error('Coach handler error:', err);
    return res.status(500).json({ error: "Une erreur est survenue." });
  }
}
