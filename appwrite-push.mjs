/**
 * Helper script to run appwrite push commands non-interactively.
 * Auto-answers YES to all confirmation prompts.
 *
 * Usage: node appwrite-push.mjs [args...]
 * Example: node appwrite-push.mjs collection --all
 */
import { spawn } from "child_process";

const args = ["push", ...process.argv.slice(2)];
console.log(`Running: appwrite ${args.join(" ")}`);

const p = spawn("appwrite", args, {
  stdio: ["pipe", "pipe", "pipe"],
  shell: true,
  cwd: process.cwd(),
});

let output = "";

const respond = (chunk) => {
  const text = chunk.toString();
  output += text;
  // Respond YES to any confirmation prompt
  if (
    text.includes("confirm") ||
    text.includes("cancel") ||
    text.includes("YES")
  ) {
    p.stdin.write("YES\n");
  }
};

p.stdout.on("data", respond);
p.stderr.on("data", respond);

p.on("close", (code) => {
  if (code === 0) {
    console.log("Push completed successfully.");
  } else {
    console.error("Push failed with code:", code);
    console.error(output.slice(-500));
  }
  process.exit(code);
});

// Safety timeout — 90 seconds
setTimeout(() => {
  console.error("Timeout reached, killing process.");
  p.kill();
  process.exit(1);
}, 90000);
