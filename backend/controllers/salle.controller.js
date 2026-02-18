import Salle from '../models/salle.model.js';

export const salleController = {
    // Créer une salle (admin uniquement)
    async create(req, res) {
        try {
            const { nom, description, capacite, image } = req.body;

            // Validation
            if (!nom || !capacite) {
                return res.status(400).json({ error: 'Le nom et la capacité sont requis' });
            }

            if (capacite <= 0) {
                return res.status(400).json({ error: 'La capacité doit être supérieure à 0' });
            }

            const salle = await Salle.create({
                nom,
                description: description || '',
                capacite: parseInt(capacite),
                image: image || null
            });

            res.status(201).json({
                message: 'Salle créée avec succès',
                salle
            });
        } catch (error) {
            console.error('Erreur création salle:', error);
            res.status(500).json({ error: 'Erreur lors de la création de la salle' });
        }
    },

    // Récupérer toutes les salles
    async getAll(req, res) {
        try {
            const salles = await Salle.findAll();
            res.json(salles);
        } catch (error) {
            console.error('Erreur récupération salles:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des salles' });
        }
    },

    // Récupérer une salle par ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const salle = await Salle.findById(id);

            if (!salle) {
                return res.status(404).json({ error: 'Salle non trouvée' });
            }

            res.json(salle);
        } catch (error) {
            console.error('Erreur récupération salle:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération de la salle' });
        }
    },

    // Mettre à jour une salle (admin uniquement)
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nom, description, capacite, image } = req.body;

            // Vérifier si la salle existe
            const salleExistante = await Salle.findById(id);
            if (!salleExistante) {
                return res.status(404).json({ error: 'Salle non trouvée' });
            }

            // Validation
            if (!nom || !capacite) {
                return res.status(400).json({ error: 'Le nom et la capacité sont requis' });
            }

            if (capacite <= 0) {
                return res.status(400).json({ error: 'La capacité doit être supérieure à 0' });
            }

            const salle = await Salle.update(id, {
                nom,
                description: description || '',
                capacite: parseInt(capacite),
                image: image || null
            });

            res.json({
                message: 'Salle modifiée avec succès',
                salle
            });
        } catch (error) {
            console.error('Erreur modification salle:', error);
            res.status(500).json({ error: 'Erreur lors de la modification de la salle' });
        }
    },

    // Supprimer une salle (admin uniquement)
    async delete(req, res) {
        try {
            const { id } = req.params;

            // Vérifier si la salle existe
            const salle = await Salle.findById(id);
            if (!salle) {
                return res.status(404).json({ error: 'Salle non trouvée' });
            }

            await Salle.delete(id);

            res.json({ message: 'Salle supprimée avec succès' });
        } catch (error) {
            console.error('Erreur suppression salle:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression de la salle' });
        }
    },

    // Upload d'une image (admin uniquement)
    async uploadImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Aucun fichier fourni' });
            }

            // Retourner le nom du fichier uploadé
            res.json({
                message: 'Image uploadée avec succès',
                filename: req.file.filename,
                path: `/uploads/salles/${req.file.filename}`
            });
        } catch (error) {
            console.error('Erreur upload image:', error);
            res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image' });
        }
    }
};

export default salleController;
