// fix-conflict.js
// Run with: node fix-conflict.js
// Removes git merge conflict markers from package.json, keeping the HEAD (local) version

const fs   = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "package.json");

let content = fs.readFileSync(filePath, "utf8");

if (!content.includes("<<<<<<<")) {
  console.log("✅ No conflicts found in package.json — nothing to fix.");
  process.exit(0);
}

// Remove conflict blocks, keeping only the HEAD (top) side
const fixed = content.replace(
  /<<<<<<< .*\n([\s\S]*?)=======\n[\s\S]*?>>>>>>> .*\n?/g,
  "$1"
);

// Validate it's still valid JSON
try {
  JSON.parse(fixed);
} catch (e) {
  console.error("❌ After fixing conflicts, package.json is not valid JSON.");
  console.error("   Please paste your package.json here and ask Claude to fix it manually.");
  process.exit(1);
}

fs.writeFileSync(filePath, fixed, "utf8");
console.log("✅ Conflicts resolved! package.json is clean.");
console.log("");
console.log("Now run:");
console.log('  git add .');
console.log('  git commit -m "fix: resolve package.json conflict"');
console.log("  git push");
