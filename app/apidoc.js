const path = require('path');
const { createDoc } = require('apidoc');

const doc = createDoc({
    src: path.resolve(__dirname, '..', 'public', 'apidoc', '1', 'src'),
    dest: path.resolve(__dirname, '..', 'public', 'apidoc', '1'),
    config: path.resolve(__dirname, '..', 'public', 'apidoc', '1'),
    dryRun: false,
    silent: false,
});

console.log(doc)

if (typeof doc !== 'boolean') {
    console.log(doc.data); // the parsed api documentation object
    console.log(doc.project); // the project information
}

// const { exec } = require('child_process');
//
// // const command = 'apidoc -i ../public/apidoc/1/src/ -o ../public/apidoc/1/doc/';
//
// const command = 'apidoc -i src/ -o apidoc/';
//
// exec(command, (error, stdout, stderr) => {
//     if (error) {
//         console.error(`Error: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.error(`stderr: ${stderr}`);
//         return;
//     }
//     console.log(`stdout: ${stdout}`);
// });