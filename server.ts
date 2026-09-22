import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { handleAIRequest, AIRequestPayload, getMistralCredentials } from "./server/aiRouter.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      publisher: "ALPHABETTE",
      founder: "Valentin RICHAUD",
      infrastructure: "Serveurs Souverains OVH (alphabette.fr / alphabette.eu)",
      app: "ProxiLien - Plateforme d'Entraide et Lien Intergénérationnel",
    });
  });

  // AI Router Status & Configuration
  app.get("/api/ai/status", (_req, res) => {
    const mistralCreds = getMistralCredentials();

    res.json({
      status: "active",
      activeProvider: process.env.AI_PROVIDER || "gemini",
      localAI: {
        url: process.env.LOCAL_AI_URL || "http://localhost:11434",
        model: process.env.LOCAL_AI_MODEL || "mistral-nemo",
      },
      mistralCloud: {
        configured: Boolean(mistralCreds.apiKey),
        model: mistralCreds.model,
      },
      gemini: {
        configured: Boolean(process.env.GEMINI_API_KEY),
        model: "gemini-3.8-flash (avec basculement gemini-2.5-flash)",
      },
      phases: {
        phase1: "Prototypage & Validation : Google Gemini (Actif en dev)",
        phase2: "Moteur Local Souverain : Machine dédiée (Ollama / vLLM, 0€ inférence)",
        phase3: "Secours Cloud Européen : Mistral AI Officiel France (Basculement transparent < 3.5s)",
      },
      publisher: {
        name: "ALPHABETTE",
        founder: "Valentin RICHAUD",
        hosting: "Serveurs Souverains OVH France (alphabette.fr / alphabette.eu)",
        privacy: "Zéro pistage publicitaire, respect total de la vie privée",
        pricing: {
          standalone: "1 € / mois (ProxiLien seul)",
          bundle: "3 € / mois (Suite complète ALPHABETTE)",
          catalog: [
            "PROXILIEN (Entraide intergénérationnelle)",
            "LIDARSOL (Cadastre solaire & géométrique LiDAR)",
            "OSOLAR (Optimisation photovoltaïque citoyenne)",
            "INFOS PERSO GRAND FORMAT (Portail aînés haute lisibilité)",
            "L'ŒIL DE L'ATELIER 3D (Gestion et conception atelier 3D)",
          ],
        },
      },
    });
  });

  // Main Unified AI Endpoint (Strategy / Provider Pattern)
  app.post("/api/ai", async (req, res) => {
    try {
      const payload = req.body as AIRequestPayload;
      if (!payload || !payload.prompt) {
        return res.status(400).json({ error: "Le champ 'prompt' est obligatoire." });
      }

      const response = await handleAIRequest(payload);
      return res.json(response);
    } catch (error: unknown) {
      console.error("[Server AI Error]:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur interne du moteur IA";
      return res.json({
        text: "Bonjour ! L'Ami Bienveillant ProxiLien a bien enregistré votre message. Notre réseau solidaire de quartier à La Grande-Motte reste à votre service en toute sécurité selon la charte éthique ALPHABETTE.",
        providerUsed: "mock_fallback",
        sovereign: true,
        model: "Moteur Résilient Local ALPHABETTE",
        latencyMs: 30,
        failover: true,
        failoverReason: errorMessage,
        timestamp: new Date().toISOString(),
        hostingInfo: {
          publisher: "ALPHABETTE",
          founder: "Valentin RICHAUD",
          serverLocation: "Serveurs Souverains OVH France (alphabette.fr / alphabette.eu)",
        },
      });
    }
  });

  // Vite middleware in development vs static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ALPHABETTE] Serveur souverain ProxiLien démarré sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
