import OpenAI from "openai";

async function runRescueCheck() {
  console.log("🚀 Starting GenTel™ Rescue Agent Check...");
  let healthy = true;
  let checksRun = 0;
  let checksPassed = 0;

  // 1. Check Database Connection (direct)
  if (process.env.DATABASE_URL) {
    checksRun++;
    try {
      console.log("📡 Checking Database connection...");
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(process.env.DATABASE_URL);
      const result = await sql`SELECT 1 as health_check`;
      console.log("✅ Database is reachable:", result.length > 0 ? "healthy" : "unknown");
      checksPassed++;
    } catch (error) {
      console.error("❌ Database Check Failed:", error);
      healthy = false;
    }
  } else {
    console.log("⚠️  Skipping Database check (DATABASE_URL not configured)");
  }

  // 2. Check OpenAI API
  if (process.env.OPENAI_API_KEY) {
    checksRun++;
    try {
      console.log("🤖 Checking OpenAI API...");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      await openai.models.list();
      console.log("✅ OpenAI API is reachable.");
      checksPassed++;
    } catch (error) {
      console.error("❌ OpenAI Check Failed:", error);
      healthy = false;
    }
  } else {
    console.log("⚠️  Skipping OpenAI check (OPENAI_API_KEY not configured)");
  }

  // 3. Environment Variable Validation
  const requiredEnv = [
    "DATABASE_URL",
    "OPENAI_API_KEY",
    "OAUTH_STATE_SECRET"
  ];

  const missingVars = requiredEnv.filter(env => !process.env[env]);

  if (missingVars.length > 0) {
    console.log("⚠️  Missing environment variables:", missingVars.join(", "));
    console.log("ℹ️  Configure GitHub secrets for full health monitoring");
  }

  // Summary
  console.log(`\n📊 Health Check Summary:`);
  console.log(`   Checks run: ${checksRun}`);
  console.log(`   Checks passed: ${checksPassed}`);
  console.log(`   Missing env vars: ${missingVars.length}`);

  if (checksRun === 0) {
    console.log("\n⚠️  No checks could be run - configure GitHub secrets");
    console.log("✅ Exiting gracefully (no-op health check)");
    process.exit(0);
  }

  if (!healthy) {
    console.error("\n🚨 Health check failed!");
    process.exit(1);
  }

  console.log("\n✨ All systems healthy.");
}

runRescueCheck().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
