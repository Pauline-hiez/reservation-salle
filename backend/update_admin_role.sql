-- Script pour mettre à jour le rôle de l'utilisateur admin
UPDATE users SET role = 'admin' WHERE email = 'admin@admin.fr';

-- Vérifier le résultat
SELECT id, email, role, created_at FROM users WHERE email = 'admin@admin.fr';
