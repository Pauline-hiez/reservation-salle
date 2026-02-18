import { query } from '../config/db.js';

const Salle = {
    // Créer une salle
    async create({ nom, description, capacite, image }) {
        const sql = `
            INSERT INTO salles (nom, description, capacite, image)
            VALUES (?, ?, ?, ?)
        `;
        const result = await query(sql, [nom, description || null, capacite, image || null]);

        return {
            id: result.insertId,
            nom,
            description,
            capacite,
            image
        };
    },

    // Récupérer toutes les salles
    async findAll() {
        const sql = `SELECT * FROM salles ORDER BY ordre ASC, nom ASC`;
        return await query(sql);
    },

    // Récupérer une salle par ID
    async findById(id) {
        const sql = `SELECT * FROM salles WHERE id = ?`;
        const results = await query(sql, [id]);
        return results[0] || null;
    },

    // Mettre à jour une salle
    async update(id, { nom, description, capacite, image }) {
        const sql = `
            UPDATE salles 
            SET nom = ?, description = ?, capacite = ?, image = ?
            WHERE id = ?
        `;
        await query(sql, [nom, description || null, capacite, image || null, id]);
        return this.findById(id);
    },

    // Supprimer une salle
    async delete(id) {
        const sql = `DELETE FROM salles WHERE id = ?`;
        await query(sql, [id]);
        return { success: true };
    },

    // Vérifier si une salle existe
    async exists(id) {
        const salle = await this.findById(id);
        return !!salle;
    }
};

export default Salle;
