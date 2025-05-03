#!/usr/bin/env node

const NEXT_JS_UI = "https://github.com/fiasuz/fias-ui.git"

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const chalk = require("chalk");

// Ranglar uchun helper
const log = {
  success: (text) => console.log(chalk.green("✔ ") + text),
  info: (text) => console.log(chalk.blue("") + text),
  warning: (text) => console.log(chalk.yellow("⚠ ") + text),
  error: (text) => console.log(chalk.red("✖ ") + text),
  title: (text) => console.log(chalk.magenta.bold("\n" + text)),
};

const projectName = process.argv[2];
const targetPath = projectName ? path.join(process.cwd(), projectName) : null;

if (!projectName) {
  log.error("Please, enter the project name");
  log.info("Example: npx create-fias my-app");
  process.exit(1);
}

function createGitignore(targetPath) {
  const gitignorePath = path.join(targetPath, ".gitignore");

  const gitignoreContent = `# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# IDE
.idea
.vscode`;

  fs.writeFileSync(gitignorePath, gitignoreContent);
  log.success(".gitignore file created");
}

// Initialize git repo
function initializeGitRepo(targetPath) {
  try {
    execSync("git add .", { cwd: targetPath });
    execSync('git commit -m "init create-fias"', { cwd: targetPath });
  } catch (error) {
    log.warning("There's a problem creating Git commit:" + error.message);
  }
}

// Cleanup function to delete project directory if an error occurs
function cleanup(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
    log.info("The created files have been deleted");
  }
}

// Clone ui
function cloneTemplate(repoUrl, targetPath) {
  try {
    execSync(`git clone ${repoUrl} ${targetPath}`, { stdio: "inherit" });
  } catch (error) {
    log.error("Error creating project:");
    console.error(chalk.red(error));
    cleanup(targetPath);
    process.exit(1);
  }
}

function removeGitFolder(targetPath) {
  const gitPath = path.join(targetPath, ".git");
  if (fs.existsSync(gitPath)) {
    fs.rmSync(gitPath, { recursive: true, force: true });
  }
}

function reinitializeGit(targetPath) {
  try {
    execSync("git init", { cwd: targetPath });
  } catch (error) {
    log.error("Error in Git init:");
    console.error(chalk.red(error));
    process.exit(1);
  }
}

// Loading animation
function startLoading(message) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;

  return setInterval(() => {
    process.stdout.write(`\r${chalk.cyan(frames[i])} ${message}`);
    i = (i + 1) % frames.length;
  }, 80);
}

// Main function
async function init() {
  try {

    // Check if the folder is available
    if (fs.existsSync(targetPath)) {
      log.error(`Folder "${projectName}" already exists`);
      process.exit(1);
    }

    // Create a new project folder
    log.info("Generating Next js project...");
    fs.mkdirSync(targetPath, { recursive: true });

    // Template fayllarni nusxalash
    const copyingLoader = startLoading("Copying files...");
    cloneTemplate(NEXT_JS_UI, targetPath);
    removeGitFolder(targetPath);
    reinitializeGit(targetPath);
    clearInterval(copyingLoader);
    createGitignore(targetPath);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    // package.json ni yangilash
    const packageJsonPath = path.join(targetPath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    packageJson.name = projectName;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log.success("package.json updated");

    // npm paketlarni o'rnatish
    log.info("\nInstalling packages...");
    execSync("npm install", { cwd: targetPath, stdio: "inherit" });

    initializeGitRepo(targetPath);

    // Yakuniy xabar
    console.log("\n" + chalk.bold.green("🎉 Created successfully!"));
    log.title("Next steps:");
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan("  npm run dev"));

    log.info("\nAbout your project:");
    console.log(`  Project name: ${chalk.cyan(projectName)}`);
    console.log(`  Directory: ${chalk.cyan(targetPath)}`);
  } catch (error) {
    log.error("\nAn error occured:");
    console.error(chalk.red(error));
    // Call cleanup if there's an error
    cleanup(path.join(process.cwd(), projectName));
    process.exit(1);
  }
}

// Dasturni ishga tushirish
init().catch((error) => {
  log.error("Unexpected error:");
  console.error(chalk.red(error));
  cleanup(path.join(process.cwd(), projectName)); // Ensure cleanup on any unhandled error
  process.exit(1);
});
