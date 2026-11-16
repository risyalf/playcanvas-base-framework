const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCRIPTS_DIR = path.resolve(PROJECT_ROOT, 'scripts');
const SRC_DIR = path.resolve(PROJECT_ROOT, 'src');

function findOrphans(dir) {
    if (!fs.existsSync(dir)) return [];
    let orphans = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            orphans = orphans.concat(findOrphans(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            const relPath = path.relative(SCRIPTS_DIR, fullPath);
            const tsRelPath = relPath.replace(/\.js$/, '.ts');
            const tsFullPath = path.join(SRC_DIR, tsRelPath);

            const content = fs.readFileSync(fullPath, 'utf8');
            let isTsGenerated = false;

            const match = content.match(/\/\/# sourceMappingURL=data:application\/json;base64,([A-Za-z0-9+/=]+)/);
            if (match) {
                try {
                    const parsed = JSON.parse(Buffer.from(match[1], 'base64').toString('utf8'));
                    isTsGenerated = parsed.sources && parsed.sources.some(s => s.includes('/src/'));
                } catch (e) {
                    isTsGenerated = true;
                }
            }

            if (isTsGenerated && !fs.existsSync(tsFullPath)) {
                orphans.push({
                    fullPath,
                    remotePath: path.join('scripts', relPath)
                });
            }
        }
    }
    return orphans;
}

function removeEmptyDirs(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const fullPath = path.join(dir, entry.name);
            removeEmptyDirs(fullPath);
            if (fs.readdirSync(fullPath).length === 0) {
                fs.rmdirSync(fullPath);
                const relDir = path.relative(PROJECT_ROOT, fullPath);
                console.log(`[sync-clean] Removing empty remote directory: ${relDir}`);
                try {
                    execSync(`node node_modules/playcanvas-sync/bin/pcsync.js rm "${relDir}"`, { 
                        cwd: PROJECT_ROOT,
                        stdio: 'inherit' 
                    });
                } catch (e) {}
            }
        }
    }
}

const orphans = findOrphans(SCRIPTS_DIR);
if (orphans.length > 0) {
    console.log(`[sync-clean] Found ${orphans.length} orphaned compiled file(s):`);
    for (const orphan of orphans) {
        console.log(` - Removing ${orphan.remotePath}...`);
        fs.unlinkSync(orphan.fullPath);
        try {
            execSync(`node node_modules/playcanvas-sync/bin/pcsync.js rm "${orphan.remotePath}"`, { 
                cwd: PROJECT_ROOT,
                stdio: 'inherit' 
            });
        } catch (err) {
            console.error(`Failed to remove remote ${orphan.remotePath}:`, err.message);
        }
    }
    removeEmptyDirs(SCRIPTS_DIR);
}
