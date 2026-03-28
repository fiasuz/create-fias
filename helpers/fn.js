const { execSync } = require("child_process");
const inquirer = require("inquirer");
const log = require("./colors");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");

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
};

function initializeGitRepo(targetPath) {
  try {
    execSync("git add .", { cwd: targetPath });
    execSync('git commit -n -m "init create-fias"', { cwd: targetPath });
  } catch (error) {
    log.warning("There's a problem creating Git commit:" + error.message);
  };
};

function cleanup(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
    log.info("The created files have been deleted");
  };
};

function cloneTemplate(repoUrl, targetPath, branch = "templ-next") {
  try {
    if (branch.includes("github")) {
      execSync(
        `git clone ${branch} "${targetPath}"`,
        {
          stdio: "inherit",
        },
      );

      return;
    };

    execSync(
      `git clone --branch ${branch} --single-branch ${repoUrl} "${targetPath}"`,
      {
        stdio: "inherit",
      },
    );
  } catch (error) {
    log.error("Error creating project:");
    console.error(chalk.red(error));
    cleanup(targetPath);
    process.exit(1);
  };
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

async function askTemplateType() {
  const { template } = await inquirer.prompt([
    {
      type: "list",
      name: "template",
      message: "Which template would you like to use?",
      choices: [
        {
          name: "Next.js",
          value: "next",
          short: "Next.js",
        },
        {
          name: "React",
          value: "react",
          short: "React",
        },
        {
          name: "Express.js",
          value: "express",
          short: "Express"
        }
      ],
      default: "next",
    },
  ]);
  return template;
};

// Checks for we are in the src folder, returns boolean value.
function checkRootFolder() {
  const currentDir = process.cwd();
  const srcIndex = currentDir.split("/").indexOf("src");
  return srcIndex !== -1;
};

// If target path ends with .ts then the function prepared to create a file, other case folder.
function createPath(targetPath) {
  if(targetPath.endsWith(".ts")) {
    if(!fs.existsSync(targetPath)) {
      fs.mkdirSync(path.dirname(targetPath), {recursive: true});
      fs.writeFileSync(targetPath, "");
      log.info("File created: " + targetPath);
    }else {
      log.error("File already exists: " + targetPath);
    }
  }else {
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
      log.info("Folder created: " + targetPath);
    } else {
      log.error("Folder already exists: " + targetPath);
    };
  }
}

// It checks whether argv includes -f or not
function checkForName(argv) {
  if (argv.includes("-f")) {
    const targetValue = argv[argv.indexOf("-f") + 1];
    return targetValue;
  } else {
    log.error("Unknown argument provided. Use -f to create new feature folders.");
  };
};

// This function will create feature folders
function createFeatureFolders(featureFolderName) {
  const isRoot = checkRootFolder();

  if (!isRoot) {
    log.error("You must be in the root directory of your project to create feature folders.");
    process.exit(1);
  };

  const srcPath = path.join(process.cwd());
  const featureFolderPath = path.join(srcPath, "features", featureFolderName);
  const featureFolderUiPath = path.join(featureFolderPath, "ui");
  const featureFolderUiIndex = path.join(featureFolderUiPath, "index.ts");
  const featureFolderLibPath = path.join(featureFolderPath, "lib");
  const featureFolderLibIndex = path.join(featureFolderLibPath, "index.ts");
  const featureFolderApiPath = path.join(srcPath, "shared", "config", "api", featureFolderName);
  const featureFolderApiTypes = path.join(featureFolderApiPath, `${featureFolderName}.model.ts`);
  const featureFolderApiRequests = path.join(featureFolderApiPath, `${featureFolderName}.requests.ts`);

  const files = [
    featureFolderPath,
    featureFolderUiPath,
    featureFolderUiIndex,
    featureFolderLibPath,
    featureFolderLibIndex,
    featureFolderApiPath,
    featureFolderApiTypes,
    featureFolderApiRequests
  ];

  for (const filePath of files) {
    createPath(filePath);
  }
};


module.exports = {
  askProjectName,
  initializeGitRepo,
  cleanup,
  cloneTemplate,
  removeGitFolder,
  reinitializeGit,
  startLoading,
  askTemplateType,
  checkForName,
  createFeatureFolders
};
