-- ============================================================
-- Seed : 1 trail + 3 questions QCM (4 reponses, 1 correcte) par lieu culturel
-- A coller dans Adminer (base app_db / prod)
-- Pre-requis : lignes de cultural_places deja presentes (seed-cultural-places.sql)
-- ============================================================

-- ============================================================
-- 1. La Roche-Bernard
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'La Roche-Bernard' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Balade dans la petite cite de caractere', 'Decouverte des ruelles pavees, du vieux port et des maisons de marins.', 60, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle riviere traverse La Roche-Bernard ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'La Vilaine', 1), (UUID(), @q, 'Le Blavet', 0), (UUID(), @q, 'L''Oust', 0), (UUID(), @q, 'L''Aulne', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel grand vaisseau de guerre royal fut lance a La Roche-Bernard au XVIIe siecle ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'La Couronne', 1), (UUID(), @q, 'Le Soleil Royal', 0), (UUID(), @q, 'L''Hermione', 0), (UUID(), @q, 'Le Belem', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel label patrimonial la ville arbore-t-elle ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Petite Cite de Caractere', 1), (UUID(), @q, 'Plus Beau Village de France', 0), (UUID(), @q, 'Ville d''Art et d''Histoire', 0), (UUID(), @q, 'Grand Site de France', 0);

-- ============================================================
-- 2. Damgan - Presqu'ile de Penerf
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Damgan - Presqu''ile de Penerf' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Sentier cotier de la ria de Penerf', 'Promenade entre ostreiculteurs, marais sales et plages de la presqu''ile.', 90, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle activite maritime traditionnelle domine la ria ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Ostreiculture', 1), (UUID(), @q, 'Tonnellerie', 0), (UUID(), @q, 'Charbonnage', 0), (UUID(), @q, 'Peche a la baleine', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel type de paysage domine la presqu''ile ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Cote sableuse et marais', 1), (UUID(), @q, 'Falaises granitiques', 0), (UUID(), @q, 'Foret dense', 0), (UUID(), @q, 'Montagnes escarpees', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Comment se nomme le village de pecheurs au sud de Damgan ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Kervoyal', 1), (UUID(), @q, 'Carnac', 0), (UUID(), @q, 'Houat', 0), (UUID(), @q, 'Hoedic', 0);

-- ============================================================
-- 3. Cote Sauvage de Quiberon
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Cote Sauvage de Quiberon' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Rando sur la Cote Sauvage', 'Sentier cotier entre falaises, criques et embruns de l''Atlantique.', 120, 'moyen', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle mer baigne la Cote Sauvage ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Ocean Atlantique', 1), (UUID(), @q, 'La Manche', 0), (UUID(), @q, 'Mer du Nord', 0), (UUID(), @q, 'Mer Mediterranee', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle ile se trouve face a Quiberon ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Belle-Ile-en-Mer', 1), (UUID(), @q, 'Ouessant', 0), (UUID(), @q, 'Brehat', 0), (UUID(), @q, 'Sein', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Comment nomme-t-on la bande de terre reliant Quiberon au continent ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Un isthme', 1), (UUID(), @q, 'Un delta', 0), (UUID(), @q, 'Un estuaire', 0), (UUID(), @q, 'Un fjord', 0);

-- ============================================================
-- 4. Golfe du Morbihan
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Golfe du Morbihan' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Tour du Golfe en bateau', 'Navigation entre les iles du Golfe, ostreicultures et villages de caractere.', 180, 'moyen', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Que signifie Mor bihan en breton ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Petite mer', 1), (UUID(), @q, 'Grande mer', 0), (UUID(), @q, 'Mer noire', 0), (UUID(), @q, 'Baie profonde', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Combien d''iles et ilots compte-t-on dans le Golfe ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Une quarantaine', 1), (UUID(), @q, '3', 0), (UUID(), @q, '365', 0), (UUID(), @q, 'Plus de 1000', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel statut de protection pour le Golfe ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Parc Naturel Regional', 1), (UUID(), @q, 'Parc national', 0), (UUID(), @q, 'Reserve militaire', 0), (UUID(), @q, 'Zone industrielle', 0);

-- ============================================================
-- 5. Cite de la Voile Eric Tabarly
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Cite de la Voile Eric Tabarly' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Visite de la Cite de la Voile', 'Parcours dans les anciennes alveoles de la base de sous-marins, hommage a la course au large.', 75, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'A qui est dediee la Cite de la Voile ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Eric Tabarly', 1), (UUID(), @q, 'Alain Colas', 0), (UUID(), @q, 'Florence Arthaud', 0), (UUID(), @q, 'Loick Peyron', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Sur quelle ancienne infrastructure militaire est-elle construite ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Base de sous-marins', 1), (UUID(), @q, 'Base aerienne', 0), (UUID(), @q, 'Chantier d''artillerie', 0), (UUID(), @q, 'Fort Vauban', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle course transatlantique Tabarly a-t-il remportee en 1964 ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'The Transat (OSTAR)', 1), (UUID(), @q, 'Vendee Globe', 0), (UUID(), @q, 'Route du Rhum', 0), (UUID(), @q, 'Volvo Ocean Race', 0);

-- ============================================================
-- 6. Station Sensation Bretagne - Saint-Quay-Portrieux
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Station Sensation Bretagne - Saint-Quay-Portrieux' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Sentier des Douaniers de Saint-Quay', 'Chemin cotier GR34 entre plages et port en eau profonde.', 90, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle specificite du port de Saint-Quay ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Port en eau profonde', 1), (UUID(), @q, 'Port fluvial', 0), (UUID(), @q, 'Port militaire', 0), (UUID(), @q, 'Port a sec', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle peche est emblematique de la baie de Saint-Brieuc ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Coquille Saint-Jacques', 1), (UUID(), @q, 'Thon rouge', 0), (UUID(), @q, 'Morue', 0), (UUID(), @q, 'Homard bleu', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel sentier de grande randonnee longe la cote ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'GR34', 1), (UUID(), @q, 'GR10', 0), (UUID(), @q, 'GR20', 0), (UUID(), @q, 'GR65', 0);

-- ============================================================
-- 7. Cote de Granit Rose
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Cote de Granit Rose' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Sentier des Douaniers de Ploumanac''h', 'Chaos de granit rose sculpte par l''erosion entre Perros-Guirec et Tregastel.', 120, 'moyen', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle couleur caracterise les rochers de la cote ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Rose', 1), (UUID(), @q, 'Vert', 0), (UUID(), @q, 'Bleu', 0), (UUID(), @q, 'Noir', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel phare emblematique se dresse a Ploumanac''h ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Phare de Mean Ruz', 1), (UUID(), @q, 'Phare du Creac''h', 0), (UUID(), @q, 'Phare de Cordouan', 0), (UUID(), @q, 'Phare du Four', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel age approximatif pour ce granit ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, '300 millions d''annees', 1), (UUID(), @q, '1 million d''annees', 0), (UUID(), @q, '10 millions d''annees', 0), (UUID(), @q, '1 milliard d''annees', 0);

-- ============================================================
-- 8. Basilique Notre-Dame de Bon-Secours (Guingamp)
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Basilique Notre-Dame de Bon-Secours' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Guingamp medievale', 'Circuit dans le centre historique et la basilique, etape du Tro Breiz.', 60, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel pelerinage breton relie les sept cathedrales ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Le Tro Breiz', 1), (UUID(), @q, 'Compostelle', 0), (UUID(), @q, 'Lourdes', 0), (UUID(), @q, 'Rocamadour', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel style architectural domine la basilique ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Gothique et Renaissance', 1), (UUID(), @q, 'Roman pur', 0), (UUID(), @q, 'Baroque', 0), (UUID(), @q, 'Art deco', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel evenement religieux annuel y est celebre ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Le Pardon de Notre-Dame', 1), (UUID(), @q, 'La Fete-Dieu', 0), (UUID(), @q, 'La Chandeleur', 0), (UUID(), @q, 'Le Carnaval', 0);

-- ============================================================
-- 9. Pays du Roi Morvan
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Pays du Roi Morvan' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Sur les traces du Roi Morvan', 'Entre Le Faouet et Gourin, collines, chapelles et legendes du roi breton.', 120, 'moyen', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Qui etait le Roi Morvan ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Un roi breton du IXe siecle', 1), (UUID(), @q, 'Un chevalier de la Table Ronde', 0), (UUID(), @q, 'Un saint evangelisateur', 0), (UUID(), @q, 'Un corsaire malouin', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle chapelle celebre domine Le Faouet ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Chapelle Sainte-Barbe', 1), (UUID(), @q, 'Chapelle Saint-Yves', 0), (UUID(), @q, 'Chapelle Saint-Michel', 0), (UUID(), @q, 'Chapelle Saint-Anne', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle halle classee se trouve au centre du Faouet ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Halles en bois du XVIe siecle', 1), (UUID(), @q, 'Halles en fer de Baltard', 0), (UUID(), @q, 'Halles en pierre romaines', 0), (UUID(), @q, 'Halles metalliques Eiffel', 0);

-- ============================================================
-- 10. Rochefort-en-Terre
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Rochefort-en-Terre' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Cite fleurie et chateau', 'Parcours entre maisons a colombages, facades fleuries et domaine du chateau.', 60, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel titre la commune a-t-elle recu en 2016 ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Village prefere des Francais', 1), (UUID(), @q, 'Capitale europeenne', 0), (UUID(), @q, 'Village etoile', 0), (UUID(), @q, 'Cite imperiale', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel peintre americain restaura le chateau au XXe siecle ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Alfred Klots', 1), (UUID(), @q, 'Edward Hopper', 0), (UUID(), @q, 'John Singer Sargent', 0), (UUID(), @q, 'James Whistler', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel evenement lumineux hivernal attire les visiteurs ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Les illuminations de Noel', 1), (UUID(), @q, 'La fete des lanternes', 0), (UUID(), @q, 'Le feu de la Saint-Jean', 0), (UUID(), @q, 'La nuit des etoiles', 0);

-- ============================================================
-- 11. Cite medievale de Guerande
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Cite medievale de Guerande' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Tour des remparts de Guerande', 'Circuit autour des remparts intacts et des portes fortifiees, vue sur les marais salants.', 90, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Combien de portes fortifiees percent les remparts ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, '4', 1), (UUID(), @q, '2', 0), (UUID(), @q, '6', 0), (UUID(), @q, '8', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle activite economique fit la richesse de Guerande ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Les marais salants', 1), (UUID(), @q, 'La peche a la morue', 0), (UUID(), @q, 'La draperie', 0), (UUID(), @q, 'La verrerie', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Comment appelle-t-on les producteurs de sel ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Paludiers', 1), (UUID(), @q, 'Saliers', 0), (UUID(), @q, 'Marais-gardiens', 0), (UUID(), @q, 'Sauniers', 0);

-- ============================================================
-- 12. Chateau des Rohan de Pontivy
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Chateau des Rohan de Pontivy' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Pontivy, entre Rohan et Napoleon', 'Du chateau medieval au quartier imperial voulu par Napoleon Ier.', 75, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle famille a bati le chateau de Pontivy ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Les Rohan', 1), (UUID(), @q, 'Les Montfort', 0), (UUID(), @q, 'Les Penthievre', 0), (UUID(), @q, 'Les Laval', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Sous quel empereur la ville fut-elle rebaptisee Napoleonville ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Napoleon Ier', 1), (UUID(), @q, 'Napoleon III', 0), (UUID(), @q, 'Louis XVIII', 0), (UUID(), @q, 'Louis-Philippe', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel canal traverse Pontivy ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Canal de Nantes a Brest', 1), (UUID(), @q, 'Canal du Midi', 0), (UUID(), @q, 'Canal d''Ille-et-Rance', 0), (UUID(), @q, 'Canal de Bourgogne', 0);

-- ============================================================
-- 13. Vieux Morlaix et son viaduc
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Vieux Morlaix et son viaduc' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Morlaix, Ville d''Art et d''Histoire', 'Maisons a lanternes, venelles et vue sur le viaduc ferroviaire.', 90, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle hauteur pour le viaduc ferroviaire ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, '58 metres', 1), (UUID(), @q, '20 metres', 0), (UUID(), @q, '100 metres', 0), (UUID(), @q, '150 metres', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle devise est associee a Morlaix ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'S''ils te mordent, mords-les', 1), (UUID(), @q, 'Fluctuat nec mergitur', 0), (UUID(), @q, 'Potius mori quam foedari', 0), (UUID(), @q, 'Per mare per terras', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Comment appelle-t-on les maisons a escalier interieur typiques ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Maisons a pondalez', 1), (UUID(), @q, 'Maisons a encorbellement', 0), (UUID(), @q, 'Maisons a colombages', 0), (UUID(), @q, 'Maisons a galerie', 0);

-- ============================================================
-- 14. Cathedrale Saint-Etienne de Saint-Brieuc
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Cathedrale Saint-Etienne de Saint-Brieuc' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Saint-Brieuc medieval', 'Autour de la cathedrale fortifiee et des maisons a pans de bois.', 60, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle particularite architecturale de la cathedrale ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Elle est fortifiee', 1), (UUID(), @q, 'Elle est souterraine', 0), (UUID(), @q, 'Elle est en bois', 0), (UUID(), @q, 'Elle a deux fleches jumelles', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Qui est le saint fondateur de la ville ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Saint Brieuc', 1), (UUID(), @q, 'Saint Malo', 0), (UUID(), @q, 'Saint Yves', 0), (UUID(), @q, 'Saint Patrick', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'A quels siecles remonte la majeure partie de l''edifice ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'XIIIe et XIVe', 1), (UUID(), @q, 'VIIIe et IXe', 0), (UUID(), @q, 'XVIIe et XVIIIe', 0), (UUID(), @q, 'XIXe et XXe', 0);

-- ============================================================
-- 15. Cap d'Erquy
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Cap d''Erquy' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Grand Site Cap d''Erquy - Cap Frehel', 'Falaises de gres rose, landes et criques du Grand Site de France.', 120, 'moyen', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle roche caracteristique compose le cap ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Gres rose', 1), (UUID(), @q, 'Granit rose', 0), (UUID(), @q, 'Calcaire', 0), (UUID(), @q, 'Basalte', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel cap voisin et celebre se trouve a l''ouest ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Cap Frehel', 1), (UUID(), @q, 'Cap Sizun', 0), (UUID(), @q, 'Cap de la Hague', 0), (UUID(), @q, 'Cap Blanc-Nez', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel label national protege le site ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Grand Site de France', 1), (UUID(), @q, 'Parc national', 0), (UUID(), @q, 'UNESCO', 0), (UUID(), @q, 'Reserve de biosphere', 0);

-- ============================================================
-- 16. Parlement de Bretagne
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Parlement de Bretagne' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Rennes et son Parlement', 'Place du Parlement, palais judiciaire et centre historique reconstruit apres 1720.', 75, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel evenement a partiellement detruit l''edifice en 1994 ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Un incendie', 1), (UUID(), @q, 'Un bombardement', 0), (UUID(), @q, 'Une inondation', 0), (UUID(), @q, 'Un seisme', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'A quel siecle remonte la construction du Parlement ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'XVIIe', 1), (UUID(), @q, 'XVe', 0), (UUID(), @q, 'XIXe', 0), (UUID(), @q, 'XXe', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel architecte en dessina la facade ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Salomon de Brosse', 1), (UUID(), @q, 'Francois Mansart', 0), (UUID(), @q, 'Louis Le Vau', 0), (UUID(), @q, 'Ange-Jacques Gabriel', 0);

-- ============================================================
-- 17. Chateau de Josselin
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Chateau de Josselin' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Chateau des Rohan au bord de l''Oust', 'Visite de la forteresse medievale et de la facade flamboyante cote cour.', 90, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle riviere domine le chateau ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'L''Oust', 1), (UUID(), @q, 'Le Blavet', 0), (UUID(), @q, 'La Vilaine', 0), (UUID(), @q, 'L''Aulne', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle famille possede encore le chateau ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Les Rohan', 1), (UUID(), @q, 'Les Bourbon', 0), (UUID(), @q, 'Les Montfort', 0), (UUID(), @q, 'Les Guise', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel style architectural orne la facade interieure ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Gothique flamboyant', 1), (UUID(), @q, 'Roman', 0), (UUID(), @q, 'Classique', 0), (UUID(), @q, 'Art nouveau', 0);

-- ============================================================
-- 18. Chateau de Suscinio
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Chateau de Suscinio' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Residence ducale en bord de mer', 'Chateau medieval des ducs de Bretagne, douves et pavement historie.', 90, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Qui residait a Suscinio au Moyen Age ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Les ducs de Bretagne', 1), (UUID(), @q, 'Les rois de France', 0), (UUID(), @q, 'Les comtes d''Anjou', 0), (UUID(), @q, 'Les princes de Galles', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Sur quelle presqu''ile se trouve le chateau ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Rhuys', 1), (UUID(), @q, 'Quiberon', 0), (UUID(), @q, 'Crozon', 0), (UUID(), @q, 'Guerande', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle piece decorative exceptionnelle a ete exhumee ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Un pavement medieval', 1), (UUID(), @q, 'Une mosaique romaine', 0), (UUID(), @q, 'Des fresques baroques', 0), (UUID(), @q, 'Des vitraux renaissance', 0);

-- ============================================================
-- 19. Foret de Broceliande
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Foret de Broceliande' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Sur les pas de Merlin et Viviane', 'Arbre d''or, tombeau de Merlin, fontaine de Barenton et Val sans Retour.', 150, 'moyen', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel enchanteur arthurien repose dans la foret ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Merlin', 1), (UUID(), @q, 'Galaad', 0), (UUID(), @q, 'Perceval', 0), (UUID(), @q, 'Gauvain', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel site legendaire est associe a la fee Morgane ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Le Val sans Retour', 1), (UUID(), @q, 'La Tour du Roi', 0), (UUID(), @q, 'Le Pre aux Fees', 0), (UUID(), @q, 'Le Mont du Graal', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel est le nom administratif actuel de la foret ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Foret de Paimpont', 1), (UUID(), @q, 'Foret de Huelgoat', 0), (UUID(), @q, 'Foret de Fougeres', 0), (UUID(), @q, 'Foret du Gavre', 0);

-- ============================================================
-- 20. Cairn de Gavrinis
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Cairn de Gavrinis' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Traversee jusqu''au cairn', 'Navette maritime depuis Larmor-Baden puis visite guidee du tumulus neolithique.', 60, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel age approximatif pour le monument ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Environ 6000 ans', 1), (UUID(), @q, 'Environ 1000 ans', 0), (UUID(), @q, 'Environ 2000 ans', 0), (UUID(), @q, 'Environ 10000 ans', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Comment accede-t-on au cairn ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'En bateau', 1), (UUID(), @q, 'A pied par un gue', 0), (UUID(), @q, 'En voiture', 0), (UUID(), @q, 'Par un telepherique', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Qu''est-ce qui rend Gavrinis exceptionnel ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Des gravures sur les pierres du couloir', 1), (UUID(), @q, 'Sa hauteur record', 0), (UUID(), @q, 'Sa couleur rouge', 0), (UUID(), @q, 'Son orientation vers l''etoile polaire', 0);

-- ============================================================
-- 21. Citadelle de Port-Louis
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Citadelle de Port-Louis' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Citadelle et Compagnie des Indes', 'Remparts d''origine espagnole, bastions et musee de la Compagnie des Indes.', 90, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel musee abrite la citadelle ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Musee de la Compagnie des Indes', 1), (UUID(), @q, 'Musee de la Marine', 0), (UUID(), @q, 'Musee des Beaux-Arts', 0), (UUID(), @q, 'Musee de Bretagne', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle nation edifia la citadelle a la fin du XVIe siecle ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Les Espagnols', 1), (UUID(), @q, 'Les Anglais', 0), (UUID(), @q, 'Les Hollandais', 0), (UUID(), @q, 'Les Portugais', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel port lui fait face ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Lorient', 1), (UUID(), @q, 'Vannes', 0), (UUID(), @q, 'Quimper', 0), (UUID(), @q, 'Brest', 0);

-- ============================================================
-- 22. Port de Saint-Goustan (Auray)
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Port de Saint-Goustan' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Auray et son vieux port', 'Descente vers le port pave, maisons a colombages et rive du Loc''h.', 60, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel pere fondateur americain debarqua a Saint-Goustan en 1776 ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Benjamin Franklin', 1), (UUID(), @q, 'George Washington', 0), (UUID(), @q, 'Thomas Jefferson', 0), (UUID(), @q, 'John Adams', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel type de maisons borde les quais ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Maisons a colombages', 1), (UUID(), @q, 'Maisons sur pilotis', 0), (UUID(), @q, 'Maisons troglodytes', 0), (UUID(), @q, 'Maisons en bois rond', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle riviere se jette ici ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Le Loc''h (Riviere d''Auray)', 1), (UUID(), @q, 'L''Oust', 0), (UUID(), @q, 'Le Blavet', 0), (UUID(), @q, 'La Vilaine', 0);

-- ============================================================
-- 23. Site des Megalithes de Locmariaquer
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Site des Megalithes de Locmariaquer' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Grand Menhir brise et Table des Marchands', 'Ensemble megalithique majeur du Neolithique breton.', 75, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle etait la hauteur initiale du Grand Menhir ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Environ 20 metres', 1), (UUID(), @q, 'Environ 5 metres', 0), (UUID(), @q, 'Environ 10 metres', 0), (UUID(), @q, 'Environ 50 metres', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel autre monument remarquable sur le site ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Table des Marchands', 1), (UUID(), @q, 'Cromlech d''Avalon', 0), (UUID(), @q, 'Dolmen des Fees', 0), (UUID(), @q, 'Tumulus Royal', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'De quelle periode date le site ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Neolithique (~4500 av. J.-C.)', 1), (UUID(), @q, 'Paleolithique', 0), (UUID(), @q, 'Age du Fer', 0), (UUID(), @q, 'Epoque gallo-romaine', 0);

-- ============================================================
-- 24. Mont-Saint-Michel
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Mont-Saint-Michel' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Merveille de l''Occident', 'Abbaye, cloitre, remparts et vue sur la baie aux grandes marees.', 180, 'moyen', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'A quel siecle remonte la fondation de l''abbaye ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'VIIIe siecle', 1), (UUID(), @q, 'Xe siecle', 0), (UUID(), @q, 'XIIe siecle', 0), (UUID(), @q, 'XVe siecle', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel archange est venere au sommet ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Saint Michel', 1), (UUID(), @q, 'Saint Gabriel', 0), (UUID(), @q, 'Saint Raphael', 0), (UUID(), @q, 'Saint Uriel', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel phenomene naturel celebre rythme la baie ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Les plus grandes marees d''Europe', 1), (UUID(), @q, 'Les aurores boreales', 0), (UUID(), @q, 'Les geysers', 0), (UUID(), @q, 'Les tempetes de sable', 0);

-- ============================================================
-- 25. Alignements de Carnac
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Alignements de Carnac' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Mysteres de Carnac', 'Alignements du Menec, Kermario et Kerlescan : le plus grand champ megalithique au monde.', 120, 'moyen', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Combien de menhirs environ sont alignes a Carnac ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Pres de 3000', 1), (UUID(), @q, '100', 0), (UUID(), @q, '500', 0), (UUID(), @q, 'Plus de 10000', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel est le nom du plus grand alignement ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Le Menec', 1), (UUID(), @q, 'Gavrinis', 0), (UUID(), @q, 'Saint-Pierre-Quiberon', 0), (UUID(), @q, 'Locmariaquer', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Selon la legende, les menhirs seraient... ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Des legionnaires romains petrifies par Saint Cornely', 1), (UUID(), @q, 'Des geants vaincus par Merlin', 0), (UUID(), @q, 'Des etoiles tombees du ciel', 0), (UUID(), @q, 'Des nefs vikings figees', 0);

-- ============================================================
-- 26. Domaine de Kerguehennec
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Domaine de Kerguehennec' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Art contemporain en parc', 'Chateau du XVIIIe, parc paysager et parcours de sculptures monumentales.', 90, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quelle est la vocation actuelle du domaine ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Centre d''art contemporain', 1), (UUID(), @q, 'Residence privee', 0), (UUID(), @q, 'Musee d''histoire', 0), (UUID(), @q, 'Hotel de luxe', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'A quel siecle remonte le chateau ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'XVIIIe', 1), (UUID(), @q, 'XIIe', 0), (UUID(), @q, 'XVIe', 0), (UUID(), @q, 'XXe', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel type de collection est presentee dans le parc ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Sculptures contemporaines', 1), (UUID(), @q, 'Jardin medieval', 0), (UUID(), @q, 'Ferme pedagogique', 0), (UUID(), @q, 'Potager conservatoire', 0);

-- ============================================================
-- 27. Intra-muros de Saint-Malo
-- ============================================================
SET @place_id = (SELECT id FROM cultural_places WHERE name = 'Intra-muros de Saint-Malo' LIMIT 1);
SET @trail_id = UUID();
INSERT INTO trails (id, cultural_place_id, name, description, durationMinute, difficulty, isActive)
VALUES (@trail_id, @place_id, 'Tour des remparts et cite corsaire', 'Circuit sur les remparts, tombe de Chateaubriand et hotels de corsaires.', 120, 'facile', 1);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel surnom porte Saint-Malo aux XVIIe-XVIIIe siecles ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'La cite corsaire', 1), (UUID(), @q, 'La cite sainte', 0), (UUID(), @q, 'La cite marchande', 0), (UUID(), @q, 'La cite templiere', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel navigateur malouin decouvrit le Canada ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Jacques Cartier', 1), (UUID(), @q, 'James Cook', 0), (UUID(), @q, 'Magellan', 0), (UUID(), @q, 'Christophe Colomb', 0);

SET @q = UUID();
INSERT INTO qcm_questions (id, trail_id, question, point) VALUES (@q, @trail_id, 'Quel evenement detruisit une grande partie de la ville en 1944 ?', 10);
INSERT INTO qcm_answers (id, qcm_question_id, answer, isCorrect) VALUES
 (UUID(), @q, 'Les combats de la Liberation', 1), (UUID(), @q, 'Un incendie accidentel', 0), (UUID(), @q, 'Un raz-de-maree', 0), (UUID(), @q, 'Un tremblement de terre', 0);

-- ============================================================
-- Fin du seed : 27 trails / 81 questions / 324 reponses
-- ============================================================
