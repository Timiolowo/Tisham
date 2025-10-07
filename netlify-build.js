// Netlify Build Script
// This script handles environment variables at build time for Netlify

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get environment variables from Netlify
const envVars = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
  VITE_SUPABASE_SERVICE_ROLE_KEY: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  VITE_GROQ_API_KEY: process.env.VITE_GROQ_API_KEY || '',
};

console.log('Building with environment variables...');

try {
  // Run the build
  execSync('npm run build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      // Ensure these are available during build
      VITE_SUPABASE_URL: envVars.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: envVars.VITE_SUPABASE_ANON_KEY,
      VITE_SUPABASE_SERVICE_ROLE_KEY: envVars.VITE_SUPABASE_SERVICE_ROLE_KEY,
      VITE_GROQ_API_KEY: envVars.VITE_GROQ_API_KEY,
    }
  });
  
  // Create a runtime environment injection script
  const runtimeEnvScript = `
// Runtime Environment Variables
// This file is generated at build time and contains the environment variables
window.__ENV__ = {
  VITE_SUPABASE_URL: '${envVars.VITE_SUPABASE_URL}',
  VITE_SUPABASE_ANON_KEY: '${envVars.VITE_SUPABASE_ANON_KEY}',
  VITE_SUPABASE_SERVICE_ROLE_KEY: '${envVars.VITE_SUPABASE_SERVICE_ROLE_KEY}',
  VITE_GROQ_API_KEY: '${envVars.VITE_GROQ_API_KEY}',
};
`;

  // Write the runtime environment script to the dist folder
  fs.writeFileSync(path.join('dist', 'runtime-env.js'), runtimeEnvScript);
  
  // Update index.html to include the runtime environment script
  const indexPath = path.join('dist', 'index.html');
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Inject the runtime environment script before the main script
  indexContent = indexContent.replace(
    '<script type="module" crossorigin src="/assets/',
    '<script src="/runtime-env.js"></script>\n    <script type="module" crossorigin src="/assets/'
  );
  
  fs.writeFileSync(indexPath, indexContent);
  
  console.log('Build completed successfully with runtime environment injection!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
