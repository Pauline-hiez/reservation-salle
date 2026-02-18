// Middleware pour vérifier si l'utilisateur est admin
const adminMiddleware = (req, res, next) => {
    try {
        // Vérifier que l'utilisateur est authentifié (via authMiddleware)
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        // Vérifier si l'utilisateur a le rôle admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Accès refusé. Rôle admin requis.' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ error: 'Erreur serveur' });
    }
};

export default adminMiddleware;
