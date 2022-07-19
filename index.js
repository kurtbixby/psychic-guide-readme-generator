import inquirer from 'inquirer';
import fs from 'fs/promises';
import fetch from 'node-fetch';

const INPUT_FILE = './TEMPLATE.md'
const OUTPUT_FILE = './output/README.md';
const LICENSES_URL = 'https://api.github.com/licenses';
const LICENSE_MANIFEST = './licenses/LicenseManifest.json';
const LICENSE_DIR = './licenses/';

let licenses;

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
    
    const licenses = await fetch(LICENSES_URL).then(response => response.json());
    // console.log(licenses);
    const shortLicenses = [];
    licenses.forEach(license => shortLicenses.push(license.name));
    // console.log(shortLicenses);
    questions[4].choices = shortLicenses;

    const responses = await inquirer.prompt(questions);
    let licenseObj = licenses[shortLicenses.indexOf(responses.license)];

    let licenseDetails = await fetch(licenseObj.url).then(response => response.json());

    let licenseBadgeUrl = createLicenseBadgeUrl(licenseDetails);

    let licenseText = formatLicenseText(licenseDetails.body, responses.github);
    let title = responses.name;
    let description = responses.description;
    let installation = responses.install;
    let usage = responses.usage;
    let contributing = responses.contribute;
    let tests = responses.test;
    let github = responses.github;
    let email = responses.email;

    const template = await fs.readFile(INPUT_FILE);
    const filledTemplate = eval("`"+template+"`");

    fs.writeFile(OUTPUT_FILE, filledTemplate);
}

function createLicenseBadgeUrl(licenseDetails) {
    // _ -> space
    // -- -> -
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

    const license = licenseMap[licenseDetails.key] ? licenseMap[licenseDetails.key] : licenseDetails.spdx_id;
    const color = 'blue';

    return `https://img.shields.io/badge/License-${license}-${color}.svg`;
}

function formatLicenseText(licenseText, github) {
    let formattedText = licenseText.replace('[year]', (new Date()).getFullYear()).replace('[fullname]', github);
    return formattedText;
}

main();