-- Refresh PostgREST after restoring a paused project and applying the complete
-- relational schema in one deployment.
notify pgrst, 'reload schema';
