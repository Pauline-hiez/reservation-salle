import { query } from '../config/db.js';

// Fonction pour convertir une date ISO en format MySQL
const formatDateForMySQL = (isoDate) => {
    const date = new Date(isoDate);
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

const Reservation = {
    // Créer une réservation
    async create({ titre, description, debut, fin, users_id }) {
        // Convertir les dates au format MySQL
        const debutFormatted = formatDateForMySQL(debut);
        const finFormatted = formatDateForMySQL(fin);
        // Vérifier qu'il n'y a pas de conflit de réservation
        const checkSql = `
            SELECT * FROM reservations 
            WHERE (
                (debut < ? AND fin > ?) OR
                (debut < ? AND fin > ?) OR
                (debut >= ? AND fin <= ?)
            )
        `;
        const conflicts = await query(checkSql, [finFormatted, debutFormatted, finFormatted, debutFormatted, debutFormatted, finFormatted]);

        if (conflicts.length > 0) {
            throw new Error('Cette plage horaire est déjà réservée');
        }

        // Créer la réservation
        const sql = `
            INSERT INTO reservations (titre, description, debut, fin, users_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        const result = await query(sql, [titre, description, debutFormatted, finFormatted, users_id]);

        return {
            id: result.insertId,
            titre,
            description,
            debut: debutFormatted,
            fin: finFormatted,
            users_id
        };
    },

    // Récupérer toutes les réservations
    async findAll() {
        const sql = `
            SELECT r.*, u.email as user_email,
                   REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(u.email, '@', 1), '-', ' '), '.', ' '), '_', ' ') as user_name
            FROM reservations r
            LEFT JOIN users u ON r.users_id = u.id
            ORDER BY r.debut ASC
        `;
        return await query(sql);
    },

    // Récupérer les réservations par période
    async findByPeriod(startDate, endDate) {
        const sql = `
            SELECT r.*, u.email as user_email,
                   REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(u.email, '@', 1), '-', ' '), '.', ' '), '_', ' ') as user_name
            FROM reservations r
            LEFT JOIN users u ON r.users_id = u.id
            WHERE r.debut >= ? AND r.fin <= ?
            ORDER BY r.debut ASC
        `;
        return await query(sql, [startDate, endDate]);
    },

    // Récupérer une réservation par ID
    async findById(id) {
        const sql = `
            SELECT r.*, u.email as user_email,
                   REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(u.email, '@', 1), '-', ' '), '.', ' '), '_', ' ') as user_name
            FROM reservations r
            LEFT JOIN users u ON r.users_id = u.id
            WHERE r.id = ?
        `;
        const results = await query(sql, [id]);
        return results[0] || null;
    },

    // Récupérer les réservations d'un utilisateur
    async findByUserId(userId) {
        const sql = `
            SELECT r.*, u.email as user_email,
                   REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(u.email, '@', 1), '-', ' '), '.', ' '), '_', ' ') as user_name
            FROM reservations r
            LEFT JOIN users u ON r.users_id = u.id
            WHERE r.users_id = ?
            ORDER BY r.debut ASC
        `;
        return await query(sql, [userId]);
    },

    // Mettre à jour une réservation
    async update(id, { titre, description, debut, fin, users_id }) {
        // Convertir les dates au format MySQL
        const debutFormatted = formatDateForMySQL(debut);
        const finFormatted = formatDateForMySQL(fin);

        // Vérifier qu'il n'y a pas de conflit (sauf avec la réservation actuelle)
        const checkSql = `
            SELECT * FROM reservations 
            WHERE id != ? AND (
                (debut < ? AND fin > ?) OR
                (debut < ? AND fin > ?) OR
                (debut >= ? AND fin <= ?)
            )
        `;
        const conflicts = await query(checkSql, [id, finFormatted, debutFormatted, finFormatted, debutFormatted, debutFormatted, finFormatted]);

        if (conflicts.length > 0) {
            throw new Error('Cette plage horaire est déjà réservée');
        }

        const sql = `
            UPDATE reservations 
            SET titre = ?, description = ?, debut = ?, fin = ?
            WHERE id = ? AND users_id = ?
        `;
        const result = await query(sql, [titre, description, debutFormatted, finFormatted, id, users_id]);

        if (result.affectedRows === 0) {
            throw new Error('Réservation non trouvée ou non autorisée');
        }

        return await this.findById(id);
    },

    // Supprimer une réservation
    async delete(id, users_id) {
        const sql = `DELETE FROM reservations WHERE id = ? AND users_id = ?`;
        const result = await query(sql, [id, users_id]);

        if (result.affectedRows === 0) {
            throw new Error('Réservation non trouvée ou non autorisée');
        }

        return { message: 'Réservation supprimée avec succès' };
    },

    // Vérifier la disponibilité d'une plage horaire
    async checkAvailability(debut, fin, excludeId = null) {
        let checkSql = `
            SELECT * FROM reservations 
            WHERE (
                (debut < ? AND fin > ?) OR
                (debut < ? AND fin > ?) OR
                (debut >= ? AND fin <= ?)
            )
        `;
        let params = [fin, debut, fin, debut, debut, fin];

        if (excludeId) {
            checkSql += ' AND id != ?';
            params.push(excludeId);
        }

        const conflicts = await query(checkSql, params);
        return conflicts.length === 0;
    }
};

export default Reservation;
