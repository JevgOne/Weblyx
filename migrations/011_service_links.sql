-- Migration: give each service somewhere to go
-- Created: 2026-09-19
--
-- The six service tiles on the homepage were plain text. Half the services
-- already have a page of their own (/seo-optimalizace, /redesign-webu,
-- /pagespeed-garance) and the rest have a section on /sluzby, but nothing on
-- the homepage pointed at any of them.
--
-- That mattered twice over. A visitor reading "SEO optimalizace" had no way to
-- read more, and the homepage passed almost no authority down to the pages
-- that are supposed to rank: it carries 14 internal links where the previous
-- structure carried 39.

ALTER TABLE services ADD COLUMN link TEXT;

UPDATE services SET link = '/sluzby#web'          WHERE title = 'Webové stránky';
UPDATE services SET link = '/seo-optimalizace'    WHERE title = 'SEO optimalizace';
UPDATE services SET link = '/redesign-webu'       WHERE title = 'Redesign';
UPDATE services SET link = '/pagespeed-garance'   WHERE title = 'Rychlost načítání';
UPDATE services SET link = '/sluzby#maintenance'  WHERE title = 'Údržba a podpora';
UPDATE services SET link = '/#cenik'              WHERE title = 'Landing page';
