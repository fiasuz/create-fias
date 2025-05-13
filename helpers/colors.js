const chalk = require("chalk");

const log = {
  success: (text) => console.log(chalk.green("✔ ") + text),
  info: (text) => console.log(chalk.blue("") + text),
  warning: (text) => console.log(chalk.yellow("⚠ ") + text),
  error: (text) => console.log(chalk.red("✖ ") + text),
  title: (text) => console.log(chalk.magenta.bold("\n" + text)),
};

module.exports = log