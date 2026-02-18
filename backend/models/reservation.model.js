import { query } from '../config/db.js';

// Fonction pour convertir une date ISO en format MySQL (sans conversion UTC)
const formatDateForMySQL = (isoDate) => {
    // Si la date est déjà au format MySQL, la retourner tel quel
    if (typeof isoDate === 'string' && isoDate.includes(' ')) {
        return isoDate;
    }

    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const Reservation = {
    // Créer une réservation
    async create({ titre, description, debut, fin, users_id, salle_id }) {
        // Convertir les dates au format MySQL
        const debutFormatted = formatDateForMySQL(debut);
        const finFormatted = formatDateForMySQL(fin);
        // Vérifier qu'il n'y a pas de conflit de réservation pour la même salle
        const checkSql = `
            SELECT * FROM reservations 
            WHERE salle_id = ? AND (
                (debut < ? AND fin > ?) OR
                (debut < ? AND fin > ?) OR
                (debut >= ? AND fin <= ?)
            )
        `;
        const conflicts = await query(checkSql, [salle_id, finFormatted, debutFormatted, finFormatted, debutFormatted, debutFormatted, finFormatted]);

        if (conflicts.length > 0) {
            throw new Error('Cette salle est déjà réservée pour cette plage horaire');
        }

        // Créer la réservation
        const sql = `
            INSERT INTO reservations (titre, description, debut, fin, users_id, salle_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const result = await query(sql, [titre, description, debutFormatted, finFormatted, users_id, salle_id]);

        return {
            id: result.insertId,
            titre,
            description,
            debut: debutFormatted,
            fin: finFormatted,
            users_id,
            salle_id
        };
    },

    // Récupérer toutes les réservations
    async findAll() {
        const sql = `
            SELECT r.*, u.email as user_email,
                   REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(u.email, '@', 1), '-', ' '), '.', ' '), '_', ' ') as user_name,
                   s.nom as salle_nom, s.image as salle_image, s.capacite as salle_capacite
            FROM reservations r
            LEFT JOIN users u ON r.users_id = u.id
            LEFT JOIN salles s ON r.salle_id = s.id
            ORDER BY r.debut ASC
        `;
        return await query(sql);
    },

    // Récupérer les réservations par période
    async findByPeriod(startDate, endDate) {
        const sql = `
            SELECT r.*, u.email as user_email,
                   REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(u.email, '@', 1), '-', ' '), '.', ' '), '_', ' ') as user_name,
                   s.nom as salle_nom, s.image as salle_image, s.capacite as salle_capacite
            FROM reservations r
            LEFT JOIN users u ON r.users_id = u.id
            LEFT JOIN salles s ON r.salle_id = s.id
            WHERE r.debut >= ? AND r.fin <= ?
            ORDER BY r.debut ASC
        `;
        return await query(sql, [startDate, endDate]);
    },

    // Récupérer une réservation par ID
    async findById(id) {
        const sql = `
            SELECT r.*, u.email as user_email,
                   REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(u.email, '@', 1), '-', ' '), '.', ' '), '_', ' ') as user_name,
                   s.nom as salle_nom, s.image as salle_image, s.capacite as salle_capacite
            FROM reservations r
            LEFT JOIN users u ON r.users_id = u.id
            LEFT JOIN salles s ON r.salle_id = s.id
            WHERE r.id = ?
        `;
        const results = await query(sql, [id]);
        return results[0] || null;
    },

    // Récupérer les réservations d'un utilisateur
    async findByUserId(userId) {
        const sql = `
            SELECT r.*, u.email as user_email,
                   REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(u.email, '@', 1), '-', ' '), '.', ' '), '_', ' ') as user_name,
                   s.nom as salle_nom, s.image as salle_image, s.capacite as salle_capacite
            FROM reservations r
            LEFT JOIN users u ON r.users_id = u.id
            LEFT JOIN salles s ON r.salle_id = s.id
            WHERE r.users_id = ?
            ORDER BY r.debut ASC
        `;
        return await query(sql, [userId]);
    },

    // Mettre à jour une réservation
    async update(id, { titre, description, debut, fin, users_id, salle_id }, isAdmin = false) {
        // Convertir les dates au format MySQL
        const debutFormatted = formatDateForMySQL(debut);
        const finFormatted = formatDateForMySQL(fin);

        // Vérifier qu'il n'y a pas de conflit (sauf avec la réservation actuelle) pour la même salle
        const checkSql = `
            SELECT * FROM reservations 
            WHERE id != ? AND salle_id = ? AND (
                (debut < ? AND fin > ?) OR
                (debut < ? AND fin > ?) OR
                (debut >= ? AND fin <= ?)
            )
        `;
        const conflicts = await query(checkSql, [id, salle_id, finFormatted, debutFormatted, finFormatted, debutFormatted, debutFormatted, finFormatted]);

        if (conflicts.length > 0) {
            throw new Error('Cette salle est déjà réservée pour cette plage horaire');
        }

        // Si c'est un admin, pas besoin de vérifier users_id
        const sql = isAdmin
            ? `UPDATE reservations SET titre = ?, description = ?, debut = ?, fin = ?, salle_id = ? WHERE id = ?`
            : `UPDATE reservations SET titre = ?, description = ?, debut = ?, fin = ?, salle_id = ? WHERE id = ? AND users_id = ?`;
        
        const params = isAdmin
            ? [titre, description, debutFormatted, finFormatted, salle_id, id]
            : [titre, description, debutFormatted, finFormatted, salle_id, id, users_id];
        
        const result = await query(sql, params);

        if (result.affectedRows === 0) {
            throw new Error('Réservation non trouvée ou non autorisée');
        }

        return await this.findById(id);
    },

    // Supprimer une réservation
    async delete(id, users_id, isAdmin = false) {
        // Si c'est un admin, pas besoin de vérifier users_id
        const sql = isAdmin
            ? `DELETE FROM reservations WHERE id = ?`
            : `DELETE FROM reservations WHERE id = ? AND users_id = ?`;
        
        const params = isAdmin ? [id] : [id, users_id];
        const result = await query(sql, params);

        if (result.affectedRows === 0) {
            throw new Error('Réservation non trouvée ou non autorisée');
        }

        return { message: 'Réservation supprimée avec succès' };
    },

    // Vérifier la disponibilité d'une plage horaire pour une salle
    async checkAvailability(debut, fin, salle_id, excludeId = null) {
        let checkSql = `
            SELECT * FROM reservations 
            WHERE salle_id = ? AND (
                (debut < ? AND fin > ?) OR
                (debut < ? AND fin > ?) OR
                (debut >= ? AND fin <= ?)
            )
        `;
        let params = [salle_id, fin, debut, fin, debut, debut, fin];

        if (excludeId) {
            checkSql += ' AND id != ?';
            params.push(excludeId);
        }

        const conflicts = await query(checkSql, params);
        return conflicts.length === 0;
    },

    // Récupérer les réservations par salle
    async findBySalle(salle_id) {
        const sql = `
            SELECT r.*, u.email as user_email,
                   REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(u.email, '@', 1), '-', ' '), '.', ' '), '_', ' ') as user_name,
                   s.nom as salle_nom, s.image as salle_image, s.capacite as salle_capacite
            FROM reservations r
            LEFT JOIN users u ON r.users_id = u.id
            LEFT JOIN salles s ON r.salle_id = s.id
            WHERE r.salle_id = ?
            ORDER BY r.debut ASC
        `;
        return await query(sql, [salle_id]);
    },

    // Vérifier si un utilisateur a déjà une réservation qui chevauche le créneau demandé
    async checkUserAvailability(debut, fin, users_id, excludeId = null) {
        const debutFormatted = formatDateForMySQL(debut);
        const finFormatted = formatDateForMySQL(fin);
        
        let checkSql = `
            SELECT * FROM reservations 
            WHERE users_id = ? AND (
                (debut < ? AND fin > ?) OR
                (debut < ? AND fin > ?) OR
                (debut >= ? AND fin <= ?)
            )
        `;
        let params = [users_id, finFormatted, debutFormatted, finFormatted, debutFormatted, debutFormatted, finFormatted];

        if (excludeId) {
            checkSql += ' AND id != ?';
            params.push(excludeId);
        }

        const conflicts = await query(checkSql, params);
        return conflicts.length === 0;
    }
};

export default Reservation;
