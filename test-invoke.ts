import { createClient } from '@supabase/supabase-js';

async function run() {
  const supabase = createClient('https://xxx.supabase.co', 'xxx');
  // Just log what the error object structure is
  // But wait, we can't test a real invoke error easily without a real url.
}
run();
