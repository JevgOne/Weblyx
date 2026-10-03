-- Migration: the external booking add-on is not tied to two providers
-- Created: 2026-10-03
--
-- Clients use Reservio, Notino, Bookio, Reservanto, Calendly… The name listed
-- two of them as if those were the only ones we connect to.

UPDATE pricing_addons SET name = 'Napojení na rezervační systém (Reservio, Notino…)', updated_at = unixepoch() WHERE id = 'addon-booking-external';
