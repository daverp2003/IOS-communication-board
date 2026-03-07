import { createClient } from "@supabase/supabase-js";

// Single shared client instance — imported by useSync, useBoardShare,
// and useSymbolRequests so credentials only live in one place.
export const supabase = createClient(
  "https://fgrfvoazrkutlmiqnmov.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncmZ2b2F6cmt1dGxtaXFubW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODkwNjgsImV4cCI6MjA4ODQ2NTA2OH0.lofg1sMtoeY-XIbtkUVb4pMcbUXmD8lnL-N3uYfwTT0"
);
