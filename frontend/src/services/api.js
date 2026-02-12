const API_URL = 'http://localhost:5000/api';
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
        const data = await response.json();
        if (!response.ok) {
            throw { status: response.status, message: data.error || 'Erreur' };
        }
        return data;
    } catch (error) {
        if (!error.status) {
            throw { status: 0, message: 'Serveur inaccessible' };
        }
        throw error;
    }
}
export const authService = {
    register: (userData) => fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),
    login: (email, password) => fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    }),
    getProfile: () => fetchAPI('/auth/me')
};

export const reservationService = {
    // Créer une réservation
    create: (reservationData) => fetchAPI('/reservations', {
        method: 'POST',
        body: JSON.stringify(reservationData)
    }),

    // Récupérer toutes les réservations
    getAll: () => fetchAPI('/reservations'),

    // Récupérer les réservations par période
    getByPeriod: (start, end) => fetchAPI(`/reservations/period?start=${start}&end=${end}`),

    // Récupérer mes réservations
    getMyReservations: () => fetchAPI('/reservations/my'),

    // Récupérer une réservation par ID
    getById: (id) => fetchAPI(`/reservations/${id}`),

    // Mettre à jour une réservation
    update: (id, reservationData) => fetchAPI(`/reservations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(reservationData)
    }),

    // Supprimer une réservation
    delete: (id) => fetchAPI(`/reservations/${id}`, {
        method: 'DELETE'
    }),

    // Vérifier la disponibilité
    checkAvailability: (debut, fin, excludeId = null) => {
        let url = `/reservations/availability?debut=${debut}&fin=${fin}`;
        if (excludeId) url += `&excludeId=${excludeId}`;
        return fetchAPI(url);
    }
};