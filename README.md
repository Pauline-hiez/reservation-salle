# Starter Kit - Full Stack Application

## 🚀 Démarrage Rapide

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd starter-kit

# 2. Configuration Backend
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos paramètres MySQL
mysql -u root -p < script.sql

# 3. Configuration Frontend
cd ../frontend
npm install

# 4. Lancement
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

L'application sera accessible sur http://localhost:5173

---

## 📋 Description

Starter Kit est une application full-stack moderne avec authentification JWT, conçue pour démarrer rapidement vos projets web. Elle fournit une base solide avec un système d'authentification complet (inscription, connexion, routes protégées) et une architecture organisée.

## 🛠️ Stack Technique

### Backend
- **Node.js** (≥18.0.0) avec ES Modules
- **Express 5** - Framework web
- **MySQL 2** - Base de données
- **JWT** - Authentification par tokens
- **Bcrypt** - Hashage des mots de passe
- **CORS** - Gestion des requêtes cross-origin

### Frontend
- **React 19** - Bibliothèque UI
- **Vite 7** - Build tool et dev server
- **React Router DOM 7** - Routing
- **Tailwind CSS 4** - Framework CSS
- **ESLint** - Linter

## 📦 Prérequis

- Node.js ≥18.0.0
- MySQL ≥5.7 ou MariaDB
- npm ou yarn

## ⚙️ Installation Détaillée

### 1. Base de données

Créez la base de données et la table users :

```bash
mysql -u root -p < backend/script.sql
```

Ou manuellement :
```sql
CREATE DATABASE IF NOT EXISTS starter_kit
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE starter_kit;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB;
```

### 2. Backend

```bash
cd backend
npm install
```

Créez le fichier `.env` à partir de `.env.example` :

```env
# Server
PORT=5000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=starter_kit

# JWT
JWT_SECRET=votre_secret_jwt_ici
JWT_EXPIRES_IN=7d
```

**⚠️ Important :** Générez un JWT_SECRET sécurisé pour la production !

### 3. Frontend

```bash
cd frontend
npm install
```

## 🚀 Scripts Disponibles

### Backend

```bash
npm start       # Démarrer le serveur en mode production
npm run dev     # Démarrer en mode développement avec hot-reload
```

### Frontend

```bash
npm run dev     # Lancer le serveur de développement
npm run build   # Build pour la production
npm run preview # Prévisualiser le build de production
npm run lint    # Linter le code
```

## 📁 Structure du Projet

```
starter-kit/
├── backend/
│   ├── config/
│   │   └── db.js              # Configuration MySQL
│   ├── controllers/
│   │   └── auth.controller.js # Logique d'authentification
│   ├── middlewares/
│   │   └── auth.middleware.js # Vérification JWT
│   ├── models/
│   │   └── user.model.js      # Modèle utilisateur
│   ├── routes/
│   │   └── auth.routes.js     # Routes d'authentification
│   ├── .env.example           # Template variables d'environnement
│   ├── script.sql             # Schéma de base de données
│   ├── server.js              # Point d'entrée
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx        # En-tête
    │   │   ├── Footer.jsx        # Pied de page
    │   │   └── PrivateRoute.jsx  # Route protégée
    │   ├── contexts/
    │   │   └── AuthContext.jsx   # Context d'authentification
    │   ├── hooks/
    │   │   └── useAuth.js        # Hook personnalisé auth
    │   ├── layouts/
    │   │   ├── MainLayout.jsx    # Layout principal
    │   │   └── AuthLayout.jsx    # Layout authentification
    │   ├── pages/
    │   │   └── Login.jsx         # Page de connexion
    │   ├── services/
    │   │   └── api.js            # Configuration Axios
    │   ├── App.jsx               # Composant racine
    │   └── main.jsx              # Point d'entrée
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🔌 Routes API

### Authentification

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/api/auth/register` | Inscription | Non |
| POST | `/api/auth/login` | Connexion | Non |
| GET | `/api/auth/profile` | Profil utilisateur | Oui |
| PUT | `/api/auth/profile` | Mise à jour profil | Oui |

### Exemples de requêtes

**Inscription**
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstname": "John",
  "lastname": "Doe"
}
```

**Connexion**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Headers pour routes protégées**
```
Authorization: Bearer <votre_token_jwt>
```

## ✨ Fonctionnalités

### Backend
- ✅ Authentification JWT complète
- ✅ Hashage sécurisé des mots de passe (bcrypt)
- ✅ Middleware de protection des routes
- ✅ Gestion des erreurs centralisée
- ✅ Validation des données
- ✅ Support CORS configuré
- ✅ Logger de développement
- ✅ Architecture MVC organisée

### Frontend
- ✅ Interface React moderne
- ✅ Context API pour l'état d'authentification
- ✅ Routes protégées avec redirection
- ✅ Layouts réutilisables
- ✅ Styling avec Tailwind CSS
- ✅ Service API centralisé
- ✅ Hooks personnalisés

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt (10 rounds)
- Tokens JWT avec expiration configurable
- Protection CSRF via tokens
- Validation des entrées utilisateur
- Headers de sécurité CORS
- Variables d'environnement pour les secrets

## 🚧 Développement

### Ajouter une nouvelle route protégée

**Backend** ([routes/auth.routes.js](backend/routes/auth.routes.js))
```javascript
router.get('/ma-route', authenticateToken, monController);
```

**Frontend** ([App.jsx](frontend/src/App.jsx))
```jsx
<Route element={<PrivateRoute />}>
  <Route path="/ma-page" element={<MaPage />} />
</Route>
```

## 📝 Notes

- Le backend écoute sur le port **5000** par défaut
- Le frontend écoute sur le port **5173** (Vite)
- CORS configuré pour accepter les requêtes depuis `http://localhost:5173`
- Les tokens JWT expirent après 7 jours par défaut

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

ISC

---

**Bon développement ! 🎉**
