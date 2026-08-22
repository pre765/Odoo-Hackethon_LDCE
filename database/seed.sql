-- Sample destination and activity data for local GlobeTrotter development.
-- This is idempotent and does not recreate any table.
INSERT INTO cities (name, country, region, cost_index, popularity, rating, image_url, description)
VALUES
  ('Santorini', 'Greece', 'Europe', 1.45, 98, 4.9, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=700&q=85', 'A whitewashed dream in the Aegean Sea.'),
  ('Bali', 'Indonesia', 'Asia', 0.85, 96, 4.8, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=700&q=85', 'Lush, peaceful, and full of wonder.'),
  ('Swiss Alps', 'Switzerland', 'Europe', 1.65, 91, 4.7, 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=700&q=85', 'Snow-capped peaks and mountain railways.'),
  ('Maldives', 'Maldives', 'Asia', 1.80, 94, 4.8, 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=700&q=85', 'Turquoise lagoons made for slowing down.'),
  ('Kyoto', 'Japan', 'Asia', 1.15, 93, 4.9, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=700&q=85', 'Temple gardens, lantern-lit lanes, and centuries of craft.')
ON CONFLICT (name, country) DO UPDATE SET
  region = EXCLUDED.region, cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity,
  rating = EXCLUDED.rating, image_url = EXCLUDED.image_url, description = EXCLUDED.description;

INSERT INTO activities (city_id, name, category, description, cost, duration_mins, rating)
SELECT c.id, data.name, data.category::activity_category, data.description, data.cost, data.duration_mins, data.rating
FROM (
  VALUES
    ('Santorini', 'Sunset sailing cruise', 'relaxation', 'Sail the caldera at golden hour.', 95.00, 180, 4.8),
    ('Bali', 'Ubud rice terrace walk', 'nature', 'A guided walk through Bali''s iconic terraces.', 28.00, 150, 4.7),
    ('Swiss Alps', 'Mountain rail adventure', 'adventure', 'A scenic mountain train and summit walk.', 120.00, 240, 4.9),
    ('Maldives', 'House reef snorkelling', 'nature', 'Discover colourful reef life close to shore.', 42.00, 120, 4.6),
    ('Kyoto', 'Fushimi Inari sunrise walk', 'culture', 'Walk through the torii gates before the crowds arrive.', 12.00, 150, 4.9)
) AS data(city_name, name, category, description, cost, duration_mins, rating)
JOIN cities c ON c.name = data.city_name
WHERE NOT EXISTS (
  SELECT 1 FROM activities a WHERE a.city_id = c.id AND a.name = data.name
);
INSERT INTO cities
(name, country, region, cost_index, popularity, rating, image_url, description)
VALUES
(
  'Dubai',
  'UAE',
  'Middle East',
  1.60,
  97,
  4.8,
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=85',
  'A futuristic city of luxury, architecture, and adventure.'
),
(
  'Paris',
  'France',
  'Europe',
  1.50,
  95,
  4.9,
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=700&q=85',
  'Art, culture, food, and timeless architecture.'
),
(
  'Tokyo',
  'Japan',
  'Asia',
  1.40,
  94,
  4.8,
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=700&q=85',
  'A vibrant mix of tradition, technology, food, and culture.'
),
(
  'Rome',
  'Italy',
  'Europe',
  1.30,
  92,
  4.8,
  'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=700&q=85',
  'Ancient history, incredible food, and iconic landmarks.'
)
ON CONFLICT (name, country) DO UPDATE SET
  region = EXCLUDED.region,
  cost_index = EXCLUDED.cost_index,
  popularity = EXCLUDED.popularity,
  rating = EXCLUDED.rating,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description;