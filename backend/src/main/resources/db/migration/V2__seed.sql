-- Seed the three oils the mill presses today. Everything here is data:
-- adding a fourth oil or a 2 litre jar later is an INSERT, not a release.

insert into oil_category (name, slug, tagline, description, oil_color, seed_color, sort_order) values
 ('Groundnut Oil','groundnut-oil','Nutty, golden, built for Gujarati kitchens',
  'Pressed from Saurashtra groundnut, filtered twice and rested before packing.','#E2A227','#C99A5B',1),
 ('Sesame Oil','sesame-oil','Cold pressed til, warm and unmistakable',
  'Wood pressed at low speed so the seed never heats past 45 degrees.','#B9731C','#E8DCC2',2),
 ('Cottonseed Oil','cottonseed-oil','Light and neutral, the bulk kitchen favourite',
  'A clean light oil with almost no aroma of its own.','#EFC64B','#F3EDE1',3);

insert into packaging (name, code, kind, size, unit, gross_weight_kg, sort_order) values
 ('15 Kg Tin','TIN-15KG','TIN',15,'KG',16.4,1),
 ('15 Litre Tin','TIN-15L','TIN',15,'LITRE',14.2,2),
 ('15 Kg Bucket','BKT-15KG','BUCKET',15,'KG',16.1,3),
 ('10 Kg Bucket','BKT-10KG','BUCKET',10,'KG',10.9,4),
 ('10 Litre Tin','TIN-10L','TIN',10,'LITRE',9.6,5),
 ('5 Kg Jar','JAR-5KG','JAR',5,'KG',5.5,6),
 ('5 Litre Tin','TIN-5L','TIN',5,'LITRE',4.9,7),
 ('1 Litre Bottle','BTL-1L','BOTTLE',1,'LITRE',1.02,8),
 ('500 ml Bottle','BTL-500ML','BOTTLE',500,'ML',0.53,9),
 ('1 Litre Pouch','PCH-1L','POUCH',1,'LITRE',0.97,10);

insert into product (oil_category_id, name, slug, short_description, extraction_method, shelf_life_months, made_at, featured, sort_order)
select id, 'Double Filtered Groundnut Oil','double-filtered-groundnut-oil',
       'Twice filtered groundnut oil with the roasted aroma left in.',
       'Expeller pressed, mechanically double filtered', 9, 'Rajkot unit', true, 1
from oil_category where slug = 'groundnut-oil';

insert into product (oil_category_id, name, slug, short_description, extraction_method, shelf_life_months, made_at, featured, sort_order)
select id, 'Cold Pressed Sesame Oil','cold-pressed-sesame-oil',
       'Wooden ghani til oil, deep amber and strongly aromatic.',
       'Wooden ghani, cold pressed', 12, 'Rajkot unit', true, 1
from oil_category where slug = 'sesame-oil';

insert into product (oil_category_id, name, slug, short_description, extraction_method, shelf_life_months, made_at, featured, sort_order)
select id, 'Filtered Cottonseed Oil','filtered-cottonseed-oil',
       'Light, neutral and priced for kitchens that cook all day.',
       'Expeller pressed, filtered', 9, 'Rajkot unit', false, 1
from oil_category where slug = 'cottonseed-oil';

-- Variants: product x packaging, priced per pack.
insert into product_variant (product_id, packaging_id, sku, price, mrp, stock)
select p.id, k.code_id, v.sku, v.price, v.mrp, v.stock
from (values
  ('double-filtered-groundnut-oil','TIN-15KG','MDH-GN-DF-15KT',2850,3150,42),
  ('double-filtered-groundnut-oil','TIN-15L' ,'MDH-GN-DF-15LT',2690,2950,31),
  ('double-filtered-groundnut-oil','BKT-10KG','MDH-GN-DF-10KB',1910,2100,22),
  ('double-filtered-groundnut-oil','TIN-5L'  ,'MDH-GN-DF-05LT', 995,1120,64),
  ('double-filtered-groundnut-oil','BTL-1L'  ,'MDH-GN-DF-01LB', 225, 255,180),
  ('cold-pressed-sesame-oil'      ,'BTL-1L'  ,'MDH-SE-CP-01LB', 495, 560,74),
  ('cold-pressed-sesame-oil'      ,'BTL-500ML','MDH-SE-CP-500B',265, 295,110),
  ('cold-pressed-sesame-oil'      ,'TIN-5L'  ,'MDH-SE-CP-05LT',2290,2480,12),
  ('filtered-cottonseed-oil'      ,'TIN-15KG','MDH-CO-FL-15KT',2190,2420,53),
  ('filtered-cottonseed-oil'      ,'BKT-15KG','MDH-CO-FL-15KB',2150,2380,26),
  ('filtered-cottonseed-oil'      ,'PCH-1L'  ,'MDH-CO-FL-01LP', 165, 185,240)
) as v(product_slug, pack_code, sku, price, mrp, stock)
join product p on p.slug = v.product_slug
join lateral (select id as code_id from packaging where code = v.pack_code) k on true;
