import fs from 'fs/promises';
import fetch from 'node-fetch';

const LICENSES_URL = 'https://api.github.com/licenses';

const licenses = await fetch(LICENSES_URL).then(response => response.json());

let licenseDetailsArray = [];
licenses.forEach(license => {
    licenseDetailsArray.push(fetch(license.url).then(response => response.json()));
});

let values = await Promise.all(licenseDetailsArray);

let licenseObjs = [];
values.forEach((element) => {
    let fileName = element.spdx_id;
    let key = element.key;
    let licenseName = element.name;
    let url = element.html_url;
    let short = element.description;
    let body = element.body;

    fs.writeFile(`./licenses/${fileName}`, body);

    let licenseObj = {
        key: key,
        name: licenseName,
        fileName: fileName,
        brief: short,
        url: url
    };
    licenseObjs.push(licenseObj);
});

fs.writeFile(`./LicenseManifest.json`, JSON.stringify(licenseObjs));