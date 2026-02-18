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
    getProfile: () => fetchAPI('/auth/me'),
    getAllUsers: () => fetchAPI('/auth/users'),
    
    updateUser: (id, userData) => fetchAPI(`/auth/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    }),
    
    deleteUser: (id) => fetchAPI(`/auth/users/${id}`, {
        method: 'DELETE'
    })
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
    checkAvailability: (debut, fin, salle_id, excludeId = null) => {
        let url = `/reservations/availability?debut=${debut}&fin=${fin}&salle_id=${salle_id}`;
        if (excludeId) url += `&excludeId=${excludeId}`;
        return fetchAPI(url);
    }
};

export const salleService = {
    // Récupérer toutes les salles
    getAll: () => fetchAPI('/salles'),

    // Récupérer une salle par ID
    getById: (id) => fetchAPI(`/salles/${id}`),

    // Créer une salle (admin)
    create: (salleData) => fetchAPI('/salles', {
        method: 'POST',
        body: JSON.stringify(salleData)
    }),

    // Mettre à jour une salle (admin)
    update: (id, salleData) => fetchAPI(`/salles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(salleData)
    }),

    // Supprimer une salle (admin)
    delete: (id) => fetchAPI(`/salles/${id}`, {
        method: 'DELETE'
    }),

    // Upload d'image (admin)
    uploadImage: async (file) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_URL}/salles/upload`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) {
            throw { status: response.status, message: data.error || 'Erreur upload' };
        }
        return data;
    }
};