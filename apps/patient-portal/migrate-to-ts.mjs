/**
 * migrate-to-ts.mjs
 * Renames .js → .ts and .jsx → .tsx for the patient portal migration.
 * Also renames the extensionless ScrollToTop file to .tsx.
 */
import { readdir, rename, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const SRC = 'c:/Users/Denzel/Desktop/HealthProvida/apps/patient-portal/src';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip node_modules, .vite, assets, inspiration
      if (['node_modules', '.vite', 'assets'].includes(entry.name)) continue;
      if (entry.name === 'inspiration') continue;
      files.push(...await walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const files = await walk(SRC);
  let renamed = 0;

  for (const file of files) {
    const ext = extname(file);
    const name = basename(file);

    // Skip non-JS files, images, CSS, HTML, etc.
    if (['.css', '.png', '.jpg', '.jpeg', '.svg', '.mp4', '.html', '.ts', '.tsx', '.d.ts', '.json'].includes(ext)) continue;

    let newPath;
    if (ext === '.jsx') {
      newPath = file.replace(/\.jsx$/, '.tsx');
    } else if (ext === '.js') {
      // Check if file contains JSX (React components)
      const { readFile } = await import('node:fs/promises');
      const content = await readFile(file, 'utf-8');
      const hasJSX = content.includes('React.forwardRef') ||
        content.includes('<') && (content.includes('/>') || content.includes('</')) && content.includes('import') && content.includes('react');
      
      if (name === 'use-toast.js') {
        // use-toast has no JSX, rename to .ts
        newPath = file.replace(/\.js$/, '.ts');
      } else if (hasJSX) {
        newPath = file.replace(/\.js$/, '.tsx');
      } else {
        newPath = file.replace(/\.js$/, '.ts');
      }
    } else if (ext === '' && name === 'ScrollToTop') {
      newPath = file + '.tsx';
    } else {
      continue;
    }

    if (newPath && newPath !== file) {
      console.log(`${file.replace(SRC, 'src')} → ${newPath.replace(SRC, 'src')}`);
      await rename(file, newPath);
      renamed++;
    }
  }

  console.log(`\nRenamed ${renamed} files.`);
}

main().catch(console.error);

