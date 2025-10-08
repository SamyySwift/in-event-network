-- Add 'category' column to facilities to distinguish between facilities and exhibition booths
ALTER TABLE public.facilities
ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'facility';

-- Optional: Enforce values via a CHECK constraint (text-based for simplicity)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'facilities_category_check'
  ) THEN
    ALTER TABLE public.facilities
    ADD CONSTRAINT facilities_category_check
    CHECK (category IN ('facility', 'exhibitor'));
  END IF;
END $$;