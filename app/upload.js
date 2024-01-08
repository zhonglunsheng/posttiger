const path = require('path')
const fs = require('fs')
const os = require("os");


function getServerIP() {
    const ifaces = os.networkInterfaces();

    // for (const ifaceName in ifaces) {
    //     const iface = ifaces[ifaceName];
    //     for (let i = 0; i < iface.length; i++) {
    //         const alias = iface[i];
    //         if (alias.family === 'IPv4') {
    //             return alias.address;
    //         }
    //     }
    // }

    // Default to localhost if the server IP cannot be determined
    return 'localhost';
}


function uploadImageRouteHandler(request, response) {
    // Get the uploaded file object
    let avatarFiles = request.files['file[]'];
    if (!Array.isArray(avatarFiles)) {
        avatarFiles = [avatarFiles]
    }

    const promises = [];
    let succMap = {}
    avatarFiles.forEach(avatarFile => {

        const promise = new Promise((resolve, reject) => {
            console.log(avatarFile)
            const fileName = avatarFile.name;

            // Get the current date for creating the folder
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Ensure two-digit month
            const day = currentDate.getDate().toString().padStart(2, '0'); // Ensure two-digit day

            // Create the folder path based on the current date
            const folderPath = path.join(__dirname, '..', 'public', 'markdown', 'images', year + month + day + "");

            // Create the folder if it doesn't exist
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, {recursive: true});
            }

            // Generate a unique filename based on the current timestamp
            const timestamp = new Date().getTime();
            const uniqueFileName = `${timestamp}_${fileName}`;

            // Set the file upload path
            const uploadPath = path.join(folderPath, uniqueFileName);

            // Move the uploaded file to the specified path
            avatarFile.mv(uploadPath, function (err) {
                if (err) {
                    reject(fileName);
                } else {
                    const serverBaseUrl = `http://${getServerIP()}:3000`; // Replace with your actual server URL
                    const originalURL = `${serverBaseUrl}/markdown/images/${year + month + day + "/" + uniqueFileName}`;

                    resolve({ serverBaseUrl, fileName, originalURL });
                }
            });
        })

        promises.push(promise);

    })

    Promise.all(promises)
        .then((results) => {
            const errFiles = results.filter((result) => result instanceof Error);
            const succMap = results.reduce((acc, result) => {
                if (!(result instanceof Error)) {
                    acc[result.fileName] = result.originalURL;
                }
                return acc;
            }, {});

            response.json({
                msg: '文件上传完成！',
                code: 0,
                data: {
                    errFiles: errFiles,
                    succMap: succMap
                }
            });
        })
        .catch((error) => {
            response.status(500).json({
                msg: '文件上传失败！',
                code: 2,
                data: null
            });
        });
}

module.exports = {uploadImageRouteHandler};