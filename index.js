import inquirer from 'inquirer';
import fs from 'fs/promises';

const INPUT_FILE = './TEMPLATE.md'
const OUTPUT_DIR = './output';
const OUTPUT_FILENAME = 'README.md';
const LICENSE_MANIFEST = './licenses/LicenseManifest.json';
const LICENSE_DIR = './licenses/';

const questions = [{
        type: 'input',
        message: 'Project Name:',
        name: 'name'
    },
    {
        type: 'input',
        message: 'Description:',
        name: 'description'
    },
    {
        type: 'input',
        message: 'Installation Instructions:',
        name: 'install'
    },
    {
        type: 'input',
        message: 'Usage:',
        name: 'usage'
    },
    {
        type: 'list',
        message: 'Choose A License',
        name: 'license',
        choices: []
    },
    {
        type: 'input',
        message: 'Contributing:',
        name: 'contribute'
    },
    {
        type: 'input',
        message: 'Tests:',
        name: 'test'
    },
    {
        type: 'input',
        message: 'GitHub Username:',
        name: 'github'
    },
    {
        type: 'input',
        message: 'Email Address:',
        name: 'email'
    },
];

async function main() {
    // Load licenses from a file and put the names into the question prompt
    const licenses = JSON.parse(await fs.readFile(LICENSE_MANIFEST, 'utf8'));
    const shortLicenses = [];
    licenses.forEach(license => shortLicenses.push(license.name));
    questions[4].choices = shortLicenses;

    // Get input then determine which license object was selected
    const responses = await inquirer.prompt(questions);
    let license = licenses[shortLicenses.indexOf(responses.license)];

    // Read the license text file
    let rawLicenseText = await fs.readFile(LICENSE_DIR+`${license.fileName}`, 'utf8');

    let licenseText = formatLicenseText(rawLicenseText, responses.github);
    let title = responses.name;
    let description = responses.description;
    let installation = responses.install;
    let usage = responses.usage;
    let contributing = responses.contribute;
    let tests = responses.test;
    let github = responses.github;
    let email = responses.email;
    let licenseBadgeUrl = createLicenseBadgeUrl(license);

    // Read the template file in, format it, then write it out
    const template = await fs.readFile(INPUT_FILE, 'utf8');
    const filledTemplate = eval("`"+template+"`");

    writeReadmeToFile(OUTPUT_DIR, OUTPUT_FILENAME, filledTemplate);
}

function createLicenseBadgeUrl(licenseDetails) {
    // URL Scheme for shields.io
    // space -> _
    // - -> --
    // https://img.shields.io/badge/License-${license}-${color}.svg
    // A handful of explicitly supported licenses
    const licenseMap = {
        'agpl-3.0': 'AGPLv3',
        'apache-2.0': 'Apache_2.0',
        'bsd-2-clause': 'BSD_2--Clause',
        'bsd-3-clause': 'BSD_3--Clause',
        'bsl-1.0': 'Boost_1.0',
        'cc0-1.0': 'CC0_1.0',
        'epl-2.0': 'EPL_1.0',
        'gpl-2.0': 'GPLv2',
        'gpl-3.0': 'GPLv3',
        'lgpl-2.1': 'LGPL--2.1',
        'mit': 'MIT',
        'mpl-2.0': 'MPL--2.0',
        'unlicense': 'Unlicense'
    };

    const license = licenseMap[licenseDetails.key] ? licenseMap[licenseDetails.key] : licenseDetails.fileName.replace('-', '--');
    const color = 'blue';

    return `https://img.shields.io/badge/License-${license}-${color}.svg`;
}

// Some licenses have year and name placeholders
// This fills those in
function formatLicenseText(licenseText, github) {
    let formattedText = licenseText.replace('[year]', (new Date()).getFullYear()).replace('[fullname]', github);
    return formattedText;
}

async function writeReadmeToFile(outputDir, outputFile, readmeText) {
    try {
        // Try to write to a file
        await fs.writeFile(`${outputDir}/${outputFile}`, readmeText);
    } catch {
        // If unable, make a directory then write to a file
        await fs.mkdir(outputDir);
        await fs.writeFile(`${outputDir}/${outputFile}`, readmeText);
    }
}

main();