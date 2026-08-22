-- Migration: store the price configurator's output on the lead
-- Created: 2026-08-17
--
-- JSON: { tierId, tierName, hours, deliveryDays, price, addons: [{ id, name, hours, price }] }
-- A dedicated column rather than project_details, which already holds the old
-- questionnaire structure and is rendered by a flat key/value renderer.

ALTER TABLE leads ADD COLUMN configuration TEXT;
