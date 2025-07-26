-- Drop the existing policy that allows everyone to view published highlights
DROP POLICY IF EXISTS "Everyone can view published highlights" ON highlights;

-- Create a new policy that allows event participants to view published highlights for their events
CREATE POLICY "Event participants can view published highlights for their events" ON highlights
FOR SELECT USING (
  is_published = true AND 
  EXISTS (
    SELECT 1 FROM event_participants ep 
    WHERE ep.event_id = highlights.event_id 
    AND ep.user_id = auth.uid()
  )
);

-- Also update the highlight_media policy to ensure attendees can see media from published highlights in their events
DROP POLICY IF EXISTS "Everyone can view media from published highlights" ON highlight_media;

CREATE POLICY "Event participants can view media from published highlights in their events" ON highlight_media
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM highlights h
    JOIN event_participants ep ON ep.event_id = h.event_id
    WHERE h.id = highlight_media.highlight_id 
    AND h.is_published = true
    AND ep.user_id = auth.uid()
  )
);