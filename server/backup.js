const fs = require("fs");
const path = require("path");

const serverDir = __dirname;
const dbPath = path.join(serverDir, "store.db");
const backupDir = path.join(serverDir, "backups");

function backupDatabase() {
  if (!fs.existsSync(dbPath)) {
    console.log("ℹ️ No existing database found; backup skipped.");
    return;
  }

  fs.mkdirSync(backupDir, { recursive: true });

  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const backupPath =
    path.join(backupDir, `store-${stamp}.db`);

  fs.copyFileSync(dbPath, backupPath);

  console.log(
    `💾 Database backup created: ${path.basename(backupPath)}`
  );

  // Keep the newest 30 backups.
  const backups = fs.readdirSync(backupDir)
    .filter((name) => /^store-.*\.db$/i.test(name))
    .map((name) => {
      const full = path.join(backupDir, name);
      return {
        name,
        time: fs.statSync(full).mtimeMs,
      };
    })
    .sort((a, b) => b.time - a.time);

  for (const old of backups.slice(30)) {
    try {
      fs.unlinkSync(
        path.join(backupDir, old.name)
      );
    } catch (err) {
      console.log(
        `⚠️ Unable to remove old backup ${old.name}:`,
        err.message
      );
    }
  }
}

try {
  backupDatabase();
} catch (err) {
  console.error(
    "❌ Database backup failed:",
    err.message
  );
}
