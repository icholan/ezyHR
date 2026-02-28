const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

for (const file of files) {
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Original Content Hash (to check if modified)
    const orig = content;

    // 1. db.exec("...") -> await db.exec("...")
    // But be careful of db.exec(...)[0], it needs to be (await db.exec(...))[0]
    // Regex for: db.exec(...) optionally followed by [
    content = content.replace(/db\.exec\((.*?)\)(\s*\[)/g, '(await db.exec($1))$2');

    // For standard isolated db.exec(...)
    content = content.replace(/([^a-zA-Z0-9_])db\.exec\(/g, '$1await db.exec(');

    // Prevent double awaits: await await db.exec -> await db.exec
    content = content.replace(/await\s+await\s+db\.exec/g, 'await db.exec');

    // 2. db.run("...") -> await db.run("...")
    content = content.replace(/([^a-zA-Z0-9_])db\.run\(/g, '$1await db.run(');
    content = content.replace(/await\s+await\s+db\.run/g, 'await db.run');

    // 3. db.prepare("...") -> await db.prepare("...")
    content = content.replace(/([^a-zA-Z0-9_])db\.prepare\(/g, '$1await db.prepare(');
    content = content.replace(/await\s+await\s+db\.prepare/g, 'await db.prepare');

    // 4. stmt.step() -> await stmt.step()
    content = content.replace(/([^a-zA-Z0-9_])stmt\.step\(\)/g, '$1await stmt.step()');
    content = content.replace(/await\s+await\s+stmt\.step/g, 'await stmt.step');

    if (orig !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Refactored: ${file}`);
    }
}

// We also need to rewrite other synchronous occurrences outside of routes, such as:
// server/index.js (if any), server/db/migrate-payroll.js, etc.
// But routes are the main target.
console.log('✅ Done applying AST/regex refactors to routes.');
