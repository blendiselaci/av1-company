-- Rename ContactStatus enum value ARCHIVED -> REPLIED to better reflect the
-- actual inbox workflow ("has an admin responded?" rather than "filed away").
-- Safe in-place rename (PostgreSQL 10+), no data migration needed.
ALTER TYPE "ContactStatus" RENAME VALUE 'ARCHIVED' TO 'REPLIED';
