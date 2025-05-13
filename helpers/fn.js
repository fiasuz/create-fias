const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const chalk = require("chalk");
const log = require("./colors");

function askProjectName() {
  return new Promise((resolve) => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question("Enter project name: ", (name) => {
      readline.close();
      resolve(name.trim());
    });
  });
}

function initializeGitRepo(targetPath) {
  try {
    execSync("git add .", { cwd: targetPath });
    execSync('git commit -n -m "init create-fias"', { cwd: targetPath });
  } catch (error) {
    log.warning("There's a problem creating Git commit:" + error.message);
  }
}

function cleanup(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
    log.info("The created files have been deleted");
  }
}

function cloneTemplate(repoUrl, targetPath) {
  try {
    execSync(`git clone ${repoUrl} ${targetPath}`, { stdio: "ignore" });
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

function startLoading(message) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;

  return setInterval(() => {
    process.stdout.write(`\r${chalk.cyan(frames[i])} ${message}`);
    i = (i + 1) % frames.length;
  }, 80);
}

module.exports = {
  askProjectName,
  initializeGitRepo,
  cleanup,
  cloneTemplate,
  removeGitFolder,
  reinitializeGit,
  startLoading
};
