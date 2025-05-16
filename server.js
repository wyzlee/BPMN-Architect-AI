const { createServer } = require('node:http');
const { parse } = require('node:url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialisation de l'application Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Analyse de l'URL de la requête
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;
      
      // Journalisation des requêtes en production pour le débogage
      if (!dev) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);
      }

      // Gestion des requêtes par Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Erreur lors du traitement de la requête:', err);
      res.statusCode = 500;
      res.end('Erreur interne du serveur');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Serveur prêt sur http://${hostname}:${port}`);
    console.log(`> Mode: ${dev ? 'développement' : 'production'}`);
  });
});
