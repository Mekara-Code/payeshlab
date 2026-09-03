-- Add separately selectable time periods to each working-hours range.
ALTER TABLE "SiteWorkingHour"
ADD COLUMN "startPeriod" VARCHAR(16) NOT NULL DEFAULT 'MORNING',
ADD COLUMN "endPeriod" VARCHAR(16) NOT NULL DEFAULT 'NIGHT';

-- Classify existing values so previously saved hours keep a sensible public label.
UPDATE "SiteWorkingHour"
SET
  "startPeriod" = CASE
    WHEN "startTime" >= '18:00' THEN 'NIGHT'
    WHEN "startTime" >= '15:00' THEN 'AFTERNOON'
    WHEN "startTime" >= '12:00' THEN 'NOON'
    ELSE 'MORNING'
  END,
  "endPeriod" = CASE
    WHEN "endTime" >= '18:00' THEN 'NIGHT'
    WHEN "endTime" >= '15:00' THEN 'AFTERNOON'
    WHEN "endTime" >= '12:00' THEN 'NOON'
    ELSE 'MORNING'
  END;
