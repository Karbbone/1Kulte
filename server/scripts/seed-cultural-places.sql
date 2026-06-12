-- Seed de lieux culturels bretons (+ Mont-Saint-Michel)
-- Identifies par les emails des offices de tourisme / gestionnaires fournis
-- Usage : docker exec -i 1kulte-mysql mysql -uroot -proot app_db < scripts/seed-cultural-places.sql

INSERT INTO cultural_places (id, name, description, postCode, city, latitude, longitude, type) VALUES
  (UUID(), 'La Roche-Bernard', 'Petite Cite de Caractere surplombant la Vilaine, ancien port fluvial. Contact : l.letrionnaire@damgan-larochebernard-tourisme.com', '56130', 'La Roche-Bernard', 47.5183000, -2.3050000, 'patrimoine'),
  (UUID(), 'Damgan - Presqu''ile de Penerf', 'Station balneaire et sentiers cotiers entre Damgan et la ria de Penerf. Contact : p.techer@damgan-larochebernard-tourisme.com', '56750', 'Damgan', 47.5156000, -2.5836000, 'patrimoine'),
  (UUID(), 'Cote Sauvage de Quiberon', 'Falaises battues par l''Atlantique sur la presqu''ile de Quiberon. Contact : communication@baiedequiberon.bzh', '56170', 'Quiberon', 47.4833000, -3.1200000, 'patrimoine'),
  (UUID(), 'Golfe du Morbihan', 'Mer interieure parsemee d''iles, classee Parc Naturel Regional. Contact : tourisme@golfedumorbihan.bzh', '56000', 'Vannes', 47.6000000, -2.7500000, 'patrimoine'),
  (UUID(), 'Cite de la Voile Eric Tabarly', 'Musee dedie a la course au large, sur la base de sous-marins de Lorient. Contact : gcaudal@lorient-tourisme.fr', '56100', 'Lorient', 47.7217000, -3.3692000, 'patrimoine'),
  (UUID(), 'Station Sensation Bretagne - Saint-Quay-Portrieux', 'Station balneaire labellisee Sensation Bretagne, port en eau profonde. Contact : info@sensation-bretagne.com', '22410', 'Saint-Quay-Portrieux', 48.6514000, -2.8283000, 'patrimoine'),
  (UUID(), 'Cote de Granit Rose', 'Chaos de rochers roses sculptes entre Perros-Guirec et Plougrescant. Contact : contact@bretagne-cotedegranitrose.com', '22700', 'Perros-Guirec', 48.8144000, -3.4478000, 'patrimoine'),
  (UUID(), 'Basilique Notre-Dame de Bon-Secours', 'Basilique gothique de Guingamp, etape sur le Tro Breiz. Contact : tourisme@guingamp-paimpol.com', '22200', 'Guingamp', 48.5583000, -3.1500000, 'patrimoine'),
  (UUID(), 'Pays du Roi Morvan', 'Terre legendaire du roi Morvan, entre Le Faouet et Gourin. Contact : direction@tourismepaysroimorvan.com', '56320', 'Le Faouet', 48.0333000, -3.4900000, 'mythe'),
  (UUID(), 'Rochefort-en-Terre', 'Petite Cite de Caractere aux facades fleuries, elue village prefere des Francais. Contact : info@rochefortenterre-tourisme.bzh', '56220', 'Rochefort-en-Terre', 47.6978000, -2.3442000, 'patrimoine'),
  (UUID(), 'Cite medievale de Guerande', 'Remparts et porte Saint-Michel encerclant la vieille ville des paludiers. Contact : contact@labaule-guerande.com', '44350', 'Guerande', 47.3286000, -2.4297000, 'patrimoine'),
  (UUID(), 'Chateau des Rohan de Pontivy', 'Forteresse du XVe siecle au coeur de la ville des Rohan. Contact : tourisme@pontivycommunaute.com', '56300', 'Pontivy', 48.0700000, -2.9594000, 'patrimoine'),
  (UUID(), 'Vieux Morlaix et son viaduc', 'Ville d''Art et d''Histoire dominee par un viaduc ferroviaire du XIXe siecle. Contact : informations@tourisme-morlaix.bzh', '29600', 'Morlaix', 48.5783000, -3.8281000, 'patrimoine'),
  (UUID(), 'Cathedrale Saint-Etienne de Saint-Brieuc', 'Cathedrale fortifiee des XIIIe-XIVe siecles en baie de Saint-Brieuc. Contact : info@baiedesaintbrieuc.com', '22000', 'Saint-Brieuc', 48.5139000, -2.7658000, 'patrimoine'),
  (UUID(), 'Cap d''Erquy', 'Cap de gres rose classe Grand Site de France, face au Cap Frehel. Contact : info@capderquy-valandre.com', '22430', 'Erquy', 48.6367000, -2.4717000, 'patrimoine'),
  (UUID(), 'Parlement de Bretagne', 'Ancien siege du Parlement, chef-d''oeuvre du XVIIe siecle au centre de Rennes. Contact : infos@destinationrennes.com', '35000', 'Rennes', 48.1117000, -1.6800000, 'patrimoine'),
  (UUID(), 'Chateau de Josselin', 'Forteresse medievale des Rohan dominant l''Oust, facade flamboyante. Contact : contact@chateaudejosselin.com', '56120', 'Josselin', 47.9536000, -2.5481000, 'patrimoine'),
  (UUID(), 'Chateau de Suscinio', 'Residence des ducs de Bretagne en bord de mer, sur la presqu''ile de Rhuys. Contact : contact@suscinio.fr', '56370', 'Sarzeau', 47.5150000, -2.6481000, 'patrimoine'),
  (UUID(), 'Foret de Broceliande', 'Foret legendaire de Paimpont, tombeau de Merlin et val sans retour. Contact : contact@tourisme-broceliande.com', '35380', 'Paimpont', 48.0072000, -2.1725000, 'mythe'),
  (UUID(), 'Cairn de Gavrinis', 'Tumulus neolithique orne de gravures sur une ile du golfe du Morbihan. Contact : accueil@cairndegavrinis.com', '56870', 'Larmor-Baden', 47.5717000, -2.8992000, 'patrimoine'),
  (UUID(), 'Citadelle de Port-Louis', 'Citadelle Vauban abritant le musee de la Compagnie des Indes. Contact : communication@sellor.com', '56290', 'Port-Louis', 47.7075000, -3.3539000, 'patrimoine'),
  (UUID(), 'Port de Saint-Goustan', 'Ancien port fluvial d''Auray, pave et maisons a colombages. Contact : patrimoine@ville-auray.fr', '56400', 'Auray', 47.6667000, -2.9833000, 'patrimoine'),
  (UUID(), 'Site des Megalithes de Locmariaquer', 'Grand Menhir brise, Table des Marchands et tumulus d''Er Grah. Contact : accueil@locmariaquer.bzh', '56740', 'Locmariaquer', 47.5742000, -2.9458000, 'mythe'),
  (UUID(), 'Mont-Saint-Michel', 'Abbaye millenaire dressee sur un ilot rocheux, patrimoine mondial UNESCO. Contact : noemie.monpays@msm-normandie.fr', '50170', 'Le Mont-Saint-Michel', 48.6361000, -1.5114000, 'patrimoine'),
  (UUID(), 'Alignements de Carnac', 'Plus grand ensemble megalithique au monde, pres de 3000 menhirs. Contact : accueil@ot-carnac.fr', '56340', 'Carnac', 47.5931000, -3.0758000, 'mythe'),
  (UUID(), 'Domaine de Kerguehennec', 'Centre d''art contemporain et parc de sculptures autour d''un chateau du XVIIIe. Contact : kerguehennec@morbihan.fr', '56500', 'Bignan', 47.9069000, -2.7156000, 'art'),
  (UUID(), 'Intra-muros de Saint-Malo', 'Cite corsaire ceinte de remparts, rebatie apres la Seconde Guerre mondiale. Contact : info@saint-malo-tourisme.com', '35400', 'Saint-Malo', 48.6494000, -2.0257000, 'patrimoine');
