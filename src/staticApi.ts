/**
 * staticApi.ts — permet à ProxiLien de tourner SANS serveur Node
 * (hébergement statique : alphabette.fr/apps/proxilien/, OVH Perso).
 *
 * Importé en tout premier dans main.tsx. En mode statique (build avec
 * VITE_ALPHABETTE_STATIC=1), /api/ai et /api/ai/status sont exécutés dans le
 * navigateur par le même code que le serveur (server/aiRouter.ts) ; l'IA
 * utilise alors la clé Mistral de l'utilisateur (mode BYOK).
 * Sans ce mode, rien ne change.
 */
const STATIQUE = (import.meta as any).env?.VITE_ALPHABETTE_STATIC === '1';
const fetchNatif = window.fetch.bind(window);

const json = (corps: unknown, status = 200) =>
  new Response(JSON.stringify(corps), { status, headers: { 'Content-Type': 'application/json' } });

if (STATIQUE) {
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      const routeur = await import('../server/aiRouter');
      const methode = (init?.method || 'GET').toUpperCase();
      if (input === '/api/ai/status' && methode === 'GET') return json(routeur.getAiStatus());
      if (input === '/api/health' && methode === 'GET') return json({ status: 'ok', mode: 'statique' });
      if (input === '/api/ai' && methode === 'POST') {
        let corps: any = {};
        try {
          corps = JSON.parse(String(init?.body || '{}'));
        } catch {}
        if (!corps?.prompt) return json({ error: "Le champ 'prompt' est obligatoire." }, 400);
        try {
          return json(await routeur.handleAIRequest(corps));
        } catch (err: any) {
          return json({ error: err?.message || 'Erreur interne du moteur IA' }, 500);
        }
      }
      return json({ error: 'Fonction indisponible dans la version hébergée sans serveur.' }, 503);
    }
    return fetchNatif(input, init);
  };
}

export {};
