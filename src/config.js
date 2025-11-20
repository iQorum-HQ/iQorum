// Debug environment variables
console.log('=== ENVIRONMENT DEBUG ===');
console.log('import.meta object:', import.meta);
console.log('import.meta.env:', import.meta.env);
console.log('All keys in import.meta.env:', Object.keys(import.meta.env));
console.log('VITE_SUPABASE_URL exists:', 'VITE_SUPABASE_URL' in import.meta.env);
console.log('VITE_SUPABASE_ANON_KEY exists:', 'VITE_SUPABASE_ANON_KEY' in import.meta.env);
console.log('=== END DEBUG ===');

const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'NOT_LOADED',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'NOT_LOADED'
};

console.log('Supabase Config:', supabaseConfig);
export default supabaseConfig;