-- Seed de recompenses (rewards) generiques avec photos coherentes
-- Les images sont des URLs externes (loremflickr, coherentes par mot-cle, stables via ?lock=)
-- getFileUrl() laisse passer les URLs absolues telles quelles (cf. minio.service.ts)
-- Usage : docker exec -i 1kulte-mysql mysql -uroot -proot app_db < scripts/seed-rewards.sql

INSERT INTO rewards (id, title, description, cost, image) VALUES
  (UUID(), 'Carte cadeau 10 EUR', 'Bon d''achat de 10 EUR valable chez nos partenaires culturels.', 10.00, 'https://loremflickr.com/600/400/gift,card?lock=11'),
  (UUID(), 'Carte cadeau 25 EUR', 'Bon d''achat de 25 EUR valable chez nos partenaires culturels.', 25.00, 'https://loremflickr.com/600/400/gift,voucher?lock=12'),
  (UUID(), 'Tote bag en coton', 'Sac en toile de coton ecru, ideal pour vos courses et balades.', 12.50, 'https://loremflickr.com/600/400/tote,bag?lock=13'),
  (UUID(), 'Mug ceramique', 'Mug en ceramique 350 ml passant au lave-vaisselle.', 9.90, 'https://loremflickr.com/600/400/mug,coffee?lock=14'),
  (UUID(), 'T-shirt coton bio', 'T-shirt unisexe en coton biologique, coupe classique.', 19.90, 'https://loremflickr.com/600/400/tshirt?lock=15'),
  (UUID(), 'Gourde isotherme', 'Gourde inox double paroi 500 ml, garde chaud et froid.', 22.00, 'https://loremflickr.com/600/400/water,bottle?lock=16'),
  (UUID(), 'Casquette brodee', 'Casquette ajustable en coton avec broderie.', 15.00, 'https://loremflickr.com/600/400/cap,hat?lock=17'),
  (UUID(), 'Carnet de notes', 'Carnet A5 a couverture rigide, papier ligne 192 pages.', 8.50, 'https://loremflickr.com/600/400/notebook?lock=18'),
  (UUID(), 'Ecouteurs sans fil', 'Ecouteurs Bluetooth avec boitier de charge.', 39.90, 'https://loremflickr.com/600/400/headphones?lock=19'),
  (UUID(), 'Stylo metal', 'Stylo a bille en metal brosse, recharge bleue.', 6.00, 'https://loremflickr.com/600/400/pen?lock=20'),
  (UUID(), 'Porte-cles cuir', 'Porte-cles en cuir veritable, finition surpiquee.', 7.50, 'https://loremflickr.com/600/400/keychain?lock=21'),
  (UUID(), 'Sac a dos urbain', 'Sac a dos 18 L avec compartiment ordinateur 15 pouces.', 45.00, 'https://loremflickr.com/600/400/backpack?lock=22'),
  (UUID(), 'Batterie externe', 'Power bank 10000 mAh, double sortie USB.', 29.90, 'https://loremflickr.com/600/400/powerbank,charger?lock=23'),
  (UUID(), 'Lot d''autocollants', 'Planche de 12 stickers vinyle resistants a l''eau.', 4.50, 'https://loremflickr.com/600/400/stickers?lock=24');
