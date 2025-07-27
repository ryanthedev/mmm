#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔨 Building MMM Package...\n');

// Clean dist directory
console.log('📁 Cleaning dist directory...');
const distDir = path.join(projectRoot, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Step 1: TypeScript compilation
console.log('📝 Compiling TypeScript...');
try {
  execSync('tsc', { cwd: projectRoot, stdio: 'inherit' });
  console.log('✅ TypeScript compilation completed');
} catch (error) {
  console.error('❌ TypeScript compilation failed:', error.message);
  process.exit(1);
}

// Step 2: Create package.json compatible exports
console.log('📦 Updating package exports...');
try {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Update exports for modern ESM
  packageJson.main = 'dist/mmm.js';
  packageJson.types = 'dist/mmm.d.ts';
  packageJson.exports = {
    '.': {
      'import': './dist/mmm.js',
      'types': './dist/mmm.d.ts'
    }
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Package.json exports updated');
} catch (error) {
  console.error('❌ Package.json update failed:', error.message);
  process.exit(1);
}

// Step 3: Clean up old files
const cjsFile = path.join(distDir, 'mmm.cjs');
if (fs.existsSync(cjsFile)) {
  fs.unlinkSync(cjsFile);
  console.log('🗑️  Removed old CommonJS file');
}

const legacyFile = path.join(projectRoot, 'demo', 'web', 'mmm-legacy.js');
if (fs.existsSync(legacyFile)) {
  fs.unlinkSync(legacyFile);
  console.log('🗑️  Removed legacy browser file');
}

const oldBrowserFile = path.join(projectRoot, 'demo', 'web', 'mmm-browser.js');
if (fs.existsSync(oldBrowserFile)) {
  fs.unlinkSync(oldBrowserFile);
  console.log('🗑️  Removed old browser file');
}

console.log('\n🎉 Package build completed successfully!');
console.log('\n📋 Generated files:');
console.log('   - dist/mmm.js (ES Module - works everywhere)');
console.log('   - dist/mmm.d.ts (TypeScript definitions)');
console.log('\n💡 Usage:');
console.log('   Node.js: import { MarkdownParser } from "mmm"');
console.log('   Browser: <script type="module"> import { MarkdownParser } from "./dist/mmm.js" </script>');