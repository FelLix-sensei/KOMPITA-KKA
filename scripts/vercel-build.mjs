import { execSync } from "node:child_process";

const requiredVariables = [
  "DATABASE_URL",
  "DIRECT_URL",
  "SESSION_SECRET",
  "ADMIN_USERNAME",
  "ADMIN_INITIAL_PASSWORD",
];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
  console.error(`Set these environment variables in Vercel before deploying: ${missingVariables.join(", ")}`);
  process.exit(1);
}

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
execSync(`${npm} run db:generate`, { stdio: "inherit" });
execSync(`${npm} run db:setup`, { stdio: "inherit" });
execSync(`${npm} run build`, { stdio: "inherit" });
