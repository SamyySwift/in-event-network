-- Add vote limit column to polls table
ALTER TABLE public.polls 
ADD COLUMN vote_limit integer DEFAULT NULL;

-- Add a comment to explain the column
COMMENT ON COLUMN public.polls.vote_limit IS 'Maximum number of votes allowed for this poll. NULL means unlimited votes.';