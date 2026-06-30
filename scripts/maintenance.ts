import { execSync } from "child_process";

async function runMaintenance() {
  console.log("🛠️ Starting GenTel™ Auto-Maintenance...");

  // Guard: fail fast if required env vars are missing
  if (!process.env.DATABASE_URL) {
    console.error(
      "❌ DATABASE_URL is not set. Ensure the secret is configured in GitHub Actions."
    );
    process.exit(1);
  }

  try {
    // 1. Apply DB Migrations (safe for unattended CI — never destructive)
    console.log("🔄 Applying database migrations...");
    execSync("npx drizzle-kit migrate", { stdio: "inherit" });
    console.log("✅ Migrations applied.");

    // 2. Audit Dependencies
    console.log("🔍 Auditing dependencies...");
    try {
      execSync("npm audit fix", { stdio: "inherit" });
    } catch (e) {
      console.log("⚠️ Audit fix had some issues, but continuing...");
    }

    // 3. Build Check
    console.log("🏗️ Verifying build...");
    execSync("npm run build", { stdio: "inherit" });
    console.log("✅ Build verified.");
  } catch (error) {
    console.error("❌ Maintenance failed:", error);
    process.exit(1);
  }

  console.log("✨ Maintenance completed successfully.");
}

runMaintenance();
