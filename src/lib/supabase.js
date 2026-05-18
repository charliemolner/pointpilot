import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fmvkkhxwjoogqtqqcoyg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtdmtraHh3am9vZ3F0cXFjb3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTY3MTcsImV4cCI6MjA5NDU3MjcxN30.6umWF7OW3FKTqK6n6Cv-9RWEzj3b-SBlJUXfpSOxuVM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
