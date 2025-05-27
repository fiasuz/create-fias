#!/usr/bin/env node
const TEMPLATE_REPO = "https://github.com/fiasuz/fias-ui.git";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const chalk = require("chalk");
const {
  askProjectName,
  initializeGitRepo,
  cleanup,
  cloneTemplate,
  removeGitFolder,
  reinitializeGit,
  askTemplateType
} = require("../helpers/fn");
const log = require("../helpers/colors");

let projectName = process.argv[2];
let targetPath = projectName ? path.join(process.cwd(), projectName) : null;

// Return branch name based on Template
function getTemplateBranch(templateType) {
  return templateType === "next" ? "templ-next" : "templ-react";
}

// Get template name
function getTemplateDisplayName(templateType) {
  return templateType === "next" ? "Next.js" : "React";
}

// Main function
async function init() {
  try {
    if (!projectName) {
      projectName = await askProjectName();

      if (!projectName) {
        log.error("Project name is required!");
        process.exit(1);
      }
    }

    targetPath = path.join(process.cwd(), projectName);

    // Check if the folder is available
    if (fs.existsSync(targetPath)) {
      log.error(`Folder "${projectName}" already exists`);
      process.exit(1);
    }

    const templateType = await askTemplateType();
    const templateBranch = getTemplateBranch(templateType);
    const templateName = getTemplateDisplayName(templateType);

    // Create a new project folder
    log.info(chalk.bold(`Generating FIAS project with ${templateName} template`));
    fs.mkdirSync(targetPath, { recursive: true });

    // Template fayllarni nusxalash
    cloneTemplate(TEMPLATE_REPO, targetPath, templateBranch);
    log.success(`${templateName} template created`);

    removeGitFolder(targetPath);
    reinitializeGit(targetPath);
    log.success("Git initialized");

    // package.json ni yangilash
    const packageJsonPath = path.join(targetPath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    packageJson.name = projectName;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log.success("package.json updated");

    // npm paketlarni o'rnatish
    log.info("\nInstalling packages");
    execSync("npm install", { cwd: targetPath, stdio: "inherit" });
    log.success("Packages installed");

    initializeGitRepo(targetPath);
    log.success("First commit added");

    // Yakuniy xabar
    console.log("\n" + chalk.bold.green("🎉 Created successfully!"));
    log.title("Next steps:");
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan("  npm run dev"));

    log.info("\nAbout your project:");
    console.log(`  Project name: ${chalk.cyan(projectName)}`);
    console.log(`  Template: ${chalk.cyan(templateName)}`);
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
