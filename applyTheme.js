import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

// Define the themes directory
const themesDir = path.join(process.cwd(), 'themes');
const settingsFilePath = path.join(process.cwd(), '.vscode', 'settings.json');

// Read the available theme files
fs.readdir(themesDir, (err, files) => {
  if (err) {
    console.error(`Error reading themes directory: ${err.message}`);
    process.exit(1);
  }

  // Filter the files to only include .json files
  const themeFiles = files.filter(file => file.endsWith('.json'));

  if (themeFiles.length === 0) {
    console.error("No theme files found in the themes directory.");
    process.exit(1);
  }

  // Remove the .json extension for better display
  const themeNames = themeFiles.map(file => path.basename(file, '.json'));

  // Prompt the user to choose a theme
  inquirer.prompt([
    {
      type: 'list',
      name: 'theme',
      message: 'Choose a theme to apply:',
      choices: themeNames
    }
  ]).then(answers => {
    const selectedTheme = answers.theme;
    const themeFilePath = path.join(themesDir, `${selectedTheme}.json`);

    // Read the selected theme file
    fs.readFile(themeFilePath, 'utf8', (err, themeData) => {
      if (err) {
        console.error(`Error reading the theme file: ${err.message}`);
        process.exit(1);
      }

      // Parse the theme JSON data
      const themeJson = JSON.parse(themeData);

      // Read the current settings.json file
      fs.readFile(settingsFilePath, 'utf8', (err, settingsData) => {
        let settingsJson = {};
        if (err && err.code !== 'ENOENT') {
          console.error(`Error reading settings.json: ${err.message}`);
          process.exit(1);
        } else if (!err) {
          settingsJson = JSON.parse(settingsData);
        }

        // Merge the workbench.colorCustomizations
        settingsJson["workbench.colorCustomizations"] = {
          ...settingsJson["workbench.colorCustomizations"],
          ...themeJson["workbench.colorCustomizations"]
        };

        // Merge or set the peacock.color
        settingsJson["peacock.color"] = themeJson["peacock.color"];

        // Write the updated settings back to settings.json
        fs.writeFile(settingsFilePath, JSON.stringify(settingsJson, null, 4), 'utf8', (err) => {
          if (err) {
            console.error(`Error writing to settings.json: ${err.message}`);
            process.exit(1);
          }

          console.log(`Successfully applied the '${selectedTheme}' theme to the settings.json file.`);
        });
      });
    });
  }).catch(error => {
    console.error(`Error during theme selection: ${error.message}`);
    process.exit(1);
  });
});
