import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
// Génère un token JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};
// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email déjà utilisé' });
        }
        const user = await User.create({ email, password });
        const token = generateToken(user);
        res.status(201).json({ message: 'Inscription réussie', user, token });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);
        if (!user || !(await User.verifyPassword(password, user.password))) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }
        const token = generateToken(user);
        res.json({
            user: { id: user.id, email: user.email, role: user.role },
            token
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
// GET /api/auth/me
export const getProfile = async (req, res) => {
    res.json({ user: req.user });
};

// GET /api/auth/users (admin uniquement)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error('Erreur récupération utilisateurs:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// PUT /api/auth/users/:id (admin uniquement)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role, password } = req.body;

        // Empêcher un admin de se supprimer ou modifier son propre rôle
        if (parseInt(id) === req.user.id && role && role !== req.user.role) {
            return res.status(403).json({ error: 'Vous ne pouvez pas modifier votre propre rôle' });
        }

        // Vérifier si l'utilisateur existe
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ error: 'Utilisateur introuvable' });
        }

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        if (email && email.toLowerCase() !== existingUser.email.toLowerCase()) {
            const emailUser = await User.findByEmail(email);
            if (emailUser) {
                return res.status(409).json({ error: 'Email déjà utilisé' });
            }
        }

        const updatedUser = await User.update(id, { email, role, password });
        res.json({ message: 'Utilisateur modifié avec succès', user: updatedUser });
    } catch (error) {
        console.error('Erreur modification utilisateur:', error);
        res.status(500).json({ error: error.message || 'Erreur serveur' });
    }
};

// DELETE /api/auth/users/:id (admin uniquement)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Empêcher un admin de se supprimer lui-même
        if (parseInt(id) === req.user.id) {
            return res.status(403).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
        }

        // Vérifier si l'utilisateur existe
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ error: 'Utilisateur introuvable' });
        }

        const deleted = await User.delete(id);
        if (deleted) {
            res.json({ message: 'Utilisateur supprimé avec succès' });
        } else {
            res.status(404).json({ error: 'Utilisateur introuvable' });
        }
    } catch (error) {
        console.error('Erreur suppression utilisateur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};