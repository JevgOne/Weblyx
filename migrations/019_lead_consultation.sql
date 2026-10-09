-- Answers from a consultation call, kept with the enquiry they belong to.
-- JSON: { answers: { [questionId]: string | string[] }, updatedAt, updatedBy }
ALTER TABLE leads ADD COLUMN consultation TEXT;
