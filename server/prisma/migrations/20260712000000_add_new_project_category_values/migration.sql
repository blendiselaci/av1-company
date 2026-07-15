-- Records enum values that were already added directly to the database
-- (via ALTER TYPE ... ADD VALUE) in an earlier session, so migration
-- history matches the live schema before any further migrations run.
ALTER TYPE "ProjectCategory" ADD VALUE IF NOT EXISTS 'FENCES';
ALTER TYPE "ProjectCategory" ADD VALUE IF NOT EXISTS 'STAIRS';
ALTER TYPE "ProjectCategory" ADD VALUE IF NOT EXISTS 'FOUNTAINS';
ALTER TYPE "ProjectCategory" ADD VALUE IF NOT EXISTS 'WALLS';
