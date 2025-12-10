-- Script d'insertion de données pour Co-Garden
-- 1 admin + 5 membres avec mots de passe simples

\c cogarden;

-- ============================================
-- SCHÉMA MEMBRES - 1 Admin + 5 Membres
-- ============================================

INSERT INTO membres.members (id, first_name, last_name, email, phone, password_hash, role, join_date, skills, "createdAt", "updatedAt")
VALUES 
(1, 'Admin', 'Co-Garden', 'admin@cogarden.com', '0612000000', '$2b$10$TBeVz3Rvxl2AVnXvg2FeTuycEG5Sw9W7VqfH7bpefhEk/BTTh9n.C', 'admin', NOW(), 'Administration, Gestion', NOW(), NOW()),
(2, 'Zineb', 'Saidi', 'zineb@cogarden.com', '0612000001', '$2b$10$A67ksCtwTQwdNNp2KhADoukBp9F77WtLoxHxd7aBxYLekeQXATMG.', 'membre', NOW(), 'Jardinage écologique', NOW(), NOW()),
(3, 'Ahmed', 'Bennani', 'ahmed@cogarden.com', '0612000002', '$2b$10$6shKvpVZupdMNJXPGPF0mufvzI2FxMmezwVokViXFdO2CK8v2c.wC', 'membre', NOW(), 'Culture bio', NOW(), NOW()),
(4, 'Sara', 'Idrissi', 'sara@cogarden.com', '0612000003', '$2b$10$Thg/xzeQs7WVvafYyPu2GO6ITUB7RaH36bMwphwiTojRm6lR4uogO', 'membre', NOW(), 'Plantes aromatiques', NOW(), NOW()),
(5, 'Karim', 'Tazi', 'karim@cogarden.com', '0612000004', '$2b$10$dnQJJi6EWIcOo/LQ7SWHR.mOf9uV1SxHJYY557o72QpKiw/GPTZnO', 'membre', NOW(), 'Agronomie, Permaculture', NOW(), NOW()),
(6, 'Amina', 'Fassi', 'amina@cogarden.com', '0612000005', '$2b$10$ZOSWoQ2BoxsGy7DRzuaKu.cQjvVHEKJW5hoVC9bSpU4BFBclyccEq', 'membre', NOW(), 'Permaculture', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('membres.members_id_seq', (SELECT MAX(id) FROM membres.members));

-- ============================================
-- SCHÉMA CATALOGUE - 5 Plantes
-- ============================================

INSERT INTO catalogue.plants (id, name, scientific_name, type, description, care_instructions, image_url, created_at)
VALUES 
(1, 'Tomate', 'Solanum lycopersicum', 'Légume-fruit', 'Tomate rouge classique, juteuse et savoureuse.', 'Arrosage régulier, exposition ensoleillée, tuteurage nécessaire.', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea', NOW()),
(2, 'Basilic', 'Ocimum basilicum', 'Aromatique', 'Herbe aromatique parfumée, parfaite pour la cuisine.', 'Arrosage fréquent, exposition ensoleillée, pincer les fleurs.', 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733', NOW()),
(3, 'Courgette', 'Cucurbita pepo', 'Légume-fruit', 'Légume productif et facile à cultiver.', 'Arrosage au pied, sol riche, récolte fréquente.', 'https://images.unsplash.com/photo-1588847628254-e7a4c83c8e8b', NOW()),
(4, 'Menthe', 'Mentha spicata', 'Aromatique', 'Menthe rafraîchissante pour le thé.', 'Arrosage modéré, peut être envahissante.', 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1', NOW()),
(5, 'Laitue', 'Lactuca sativa', 'Légume-feuille', 'Salade croquante et fraîche.', 'Arrosage régulier, températures fraîches préférées.', 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1', NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('catalogue.plants_id_seq', (SELECT MAX(id) FROM catalogue.plants));

-- Insérer 5 commentaires
INSERT INTO catalogue.comments (id, plant_id, user_id, author, content, created_at)
VALUES 
(1, 1, '2', 'Zineb Saidi', 'Excellente récolte de tomates cette année !', NOW() - INTERVAL '1 day'),
(2, 2, '3', 'Ahmed Bennani', 'Le basilic pousse très bien dans mon jardin.', NOW() - INTERVAL '2 days'),
(3, 3, '4', 'Sara Idrissi', 'Courgettes délicieuses, production abondante.', NOW() - INTERVAL '3 days'),
(4, 4, '5', 'Karim Tazi', 'La menthe parfaite pour le thé marocain.', NOW() - INTERVAL '4 days'),
(5, 5, '6', 'Amina Fassi', 'Laitue très fraîche et croquante.', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval('catalogue.comments_id_seq', (SELECT MAX(id) FROM catalogue.comments));

-- ============================================
-- SCHÉMA PARCELLES - 5 Parcelles
-- ============================================

INSERT INTO parcelles.plots (id, name, surface, status, soil_type, current_plant, plant_emoji, occupant, occupantid)
VALUES 
(1, 'Parcelle A1', 25.0, 'occupied', 'Argileux', 'Tomate', '🍅', 'Zineb Saidi', 2),
(2, 'Parcelle A2', 30.0, 'occupied', 'Sableux', 'Courgette', '🥒', 'Ahmed Bennani', 3),
(3, 'Parcelle B1', 20.0, 'occupied', 'Limoneux', 'Laitue', '🥬', 'Sara Idrissi', 4),
(4, 'Parcelle B2', 35.0, 'available', 'Argileux', NULL, NULL, NULL, NULL),
(5, 'Parcelle C1', 28.0, 'available', 'Limoneux', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

SELECT setval('parcelles.plots_id_seq', (SELECT MAX(id) FROM parcelles.plots));

-- Insérer 5 demandes d'attribution
INSERT INTO parcelles.assignment_requests (id, plot_id, user_id, status, motivation, requested_at)
VALUES 
(1, 4, 5, 'pending', 'Je souhaite cultiver des tomates', NOW() - INTERVAL '2 days'),
(2, 5, 6, 'pending', 'Intéressé par le jardinage bio', NOW() - INTERVAL '1 day'),
(3, 4, 6, 'rejected', 'Demande en doublon', NOW() - INTERVAL '3 days'),
(4, 2, 5, 'approved', 'Expérience en permaculture', NOW() - INTERVAL '10 days'),
(5, 3, 4, 'approved', 'Spécialiste des plantes aromatiques', NOW() - INTERVAL '12 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval('parcelles.assignment_requests_id_seq', (SELECT MAX(id) FROM parcelles.assignment_requests));

-- ============================================
-- SCHÉMA TACHES - 5 Tâches
-- ============================================

INSERT INTO taches.tasks (id, title, description, status, due_date, created_at, updated_at)
VALUES 
(1, 'Arrosage parcelles Nord', 'Arroser toutes les parcelles de la section Nord', 'to_do', CURRENT_DATE + INTERVAL '2 days', NOW(), NOW()),
(2, 'Désherbage général', 'Désherber les allées principales du jardin', 'in_progress', CURRENT_DATE + INTERVAL '5 days', NOW(), NOW()),
(3, 'Récolte tomates', 'Récolter les tomates mûres dans les parcelles', 'to_do', CURRENT_DATE + INTERVAL '1 day', NOW(), NOW()),
(4, 'Compostage', 'Retourner le compost et ajouter les déchets verts', 'done', CURRENT_DATE - INTERVAL '3 days', NOW(), NOW()),
(5, 'Plantation basilic', 'Planter les nouveaux plants de basilic en serre', 'to_do', CURRENT_DATE + INTERVAL '7 days', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('taches.tasks_id_seq', (SELECT MAX(id) FROM taches.tasks));

-- Insérer les assignations de tâches (table de liaison)
INSERT INTO taches.task_assignments (task_id, member_id)
VALUES 
(1, 2), (1, 3),
(2, 4), (2, 5),
(3, 2), (3, 3),
(4, 5), (4, 6),
(5, 4), (5, 6)
ON CONFLICT DO NOTHING;

-- ============================================
-- Vérification des données insérées
-- ============================================

\echo ''
\echo '=== RÉSUMÉ DES DONNÉES INSÉRÉES ==='
\echo ''
SELECT 'MEMBRES' as table_name, COUNT(*) as count FROM membres.members
UNION ALL
SELECT 'PLANTES', COUNT(*) FROM catalogue.plants
UNION ALL
SELECT 'COMMENTAIRES', COUNT(*) FROM catalogue.comments
UNION ALL
SELECT 'PARCELLES', COUNT(*) FROM parcelles.plots
UNION ALL
SELECT 'DEMANDES', COUNT(*) FROM parcelles.assignment_requests
UNION ALL
SELECT 'TÂCHES', COUNT(*) FROM taches.tasks
UNION ALL
SELECT 'ASSIGNATIONS TÂCHES', COUNT(*) FROM taches.task_assignments;

\echo ''
\echo '=== CREDENTIALS ==='
\echo 'Admin: admin@cogarden.com / admin123'
\echo 'Zineb: zineb@cogarden.com / zineb123'
\echo 'Ahmed: ahmed@cogarden.com / ahmed123'
\echo 'Sara: sara@cogarden.com / sara123'
\echo 'Karim: karim@cogarden.com / karim123'
\echo 'Amina: amina@cogarden.com / amina123'
\echo ''
