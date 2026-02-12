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
        const sql = 'SELECT id, email, created_at FROM users WHERE id = ?';
        const results = await query(sql, [id]);
        return results[0] || null;
    },
    // Créer un utilisateur
    async create({ email, password }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `
      INSERT INTO users (email, password)
      VALUES (?, ?)
    `;
        const result = await query(sql, [
            email.toLowerCase(),
            hashedPassword
        ]);
        return { id: result.insertId, email };
    },
    // Vérifier le mot de passe
    async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
};
export default User;