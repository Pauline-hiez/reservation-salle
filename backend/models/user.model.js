import { query } from '../config/db.js';
import bcrypt from 'bcrypt';
const User = {
    // Trouver par email
    async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const results = await query(sql, [email.toLowerCase()]);
        return results[0] || null;
    },
    // Trouver par ID (sans le password)
    async findById(id) {
        const sql = 'SELECT id, email, role, created_at FROM users WHERE id = ?';
        const results = await query(sql, [id]);
        return results[0] || null;
    },

    // Récupérer tous les utilisateurs (sans les mots de passe)
    async findAll() {
        const sql = `
            SELECT id, email, role, created_at,
                   REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(email, '@', 1), '-', ' '), '.', ' '), '_', ' ') as name
            FROM users
            ORDER BY created_at DESC
        `;
        return await query(sql);
    },

    // Créer un utilisateur
    async create({ email, password, role = 'user' }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `
      INSERT INTO users (email, password, role)
      VALUES (?, ?, ?)
    `;
        const result = await query(sql, [
            email.toLowerCase(),
            hashedPassword,
            role
        ]);
        return { id: result.insertId, email, role };
    },
    // Vérifier le mot de passe
    async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    },

    // Mettre à jour un utilisateur
    async update(id, { email, role, password }) {
        const updates = [];
        const params = [];

        if (email) {
            updates.push('email = ?');
            params.push(email.toLowerCase());
        }
        if (role) {
            updates.push('role = ?');
            params.push(role);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push('password = ?');
            params.push(hashedPassword);
        }

        if (updates.length === 0) {
            throw new Error('Aucune donnée à mettre à jour');
        }

        params.push(id);
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        await query(sql, params);
        return this.findById(id);
    },

    // Supprimer un utilisateur
    async delete(id) {
        const sql = 'DELETE FROM users WHERE id = ?';
        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    }
};
export default User;