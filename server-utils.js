// Utilitaire pour configurer le port du serveur Next.js
const getPort = () => {
  // Utiliser le port fourni par Render, ou 3000 par défaut
  return process.env.PORT || 3000;
};

module.exports = {
  getPort
};
