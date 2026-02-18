-- Script de migration complet pour ajouter la gestion des salles
USE reservation_salles;

-- Variables globales
SET @dbname = DATABASE();
SET @tablename = 'reservations';
SET @tablename_salles = 'salles';

-- 1. Créer la table salles si elle n'existe pas
CREATE TABLE IF NOT EXISTS salles (
    id INT NOT NULL AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    description TEXT NULL DEFAULT NULL,
    capacite INT NOT NULL,
    created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- 1.5. Ajouter la colonne image si elle n'existe pas dans la table salles
SET @columnname_image = 'image';
SET @preparedStatement_image = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename_salles)
      AND (table_schema = @dbname)
      AND (column_name = @columnname_image)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE salles ADD COLUMN image VARCHAR(255) NULL DEFAULT NULL AFTER capacite'
));
PREPARE alterImageIfNotExists FROM @preparedStatement_image;
EXECUTE alterImageIfNotExists;
DEALLOCATE PREPARE alterImageIfNotExists;

-- 2. Ajouter la colonne salle_id à reservations si elle n'existe pas
SET @columnname = 'salle_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL DEFAULT NULL AFTER users_id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 3. Insérer des salles par défaut si la table est vide
INSERT INTO salles (nom, description, capacite, image) 
SELECT * FROM (
    SELECT 
        'Salle Innovation' as nom,
        'Une salle moderne et spacieuse équipée des dernières technologies pour vos réunions et présentations. Idéale pour les sessions de brainstorming et les workshops créatifs.' as description,
        15 as capacite,
        'salle2-2.jpg' as image
    UNION ALL
    SELECT 
        'Salle Collaboration',
        'Espace collaboratif conçu pour le travail d\'équipe avec un écran interactif et des tableaux blancs. Parfaite pour les sessions de travail en groupe et les réunions stratégiques.',
        10,
        'salle3-3.jpg'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM salles LIMIT 1);

-- 4. Si des réservations existent sans salle_id, les assigner à la première salle
UPDATE reservations 
SET salle_id = (SELECT MIN(id) FROM salles)
WHERE salle_id IS NULL;

-- 5. Rendre la colonne salle_id NOT NULL maintenant qu'elle a des valeurs
ALTER TABLE reservations MODIFY COLUMN salle_id INT NOT NULL;

-- 6. Ajouter la contrainte de clé étrangère si elle n'existe pas
SET @fkname = 'fk_reservation_salle';
SET @preparedStatement2 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (constraint_name = @fkname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @fkname, ' FOREIGN KEY (salle_id) REFERENCES salles(id) ON DELETE CASCADE')
));
PREPARE alterFkIfNotExists FROM @preparedStatement2;
EXECUTE alterFkIfNotExists;
DEALLOCATE PREPARE alterFkIfNotExists;
