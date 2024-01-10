// node拷贝dist目录到跟目录

import * as fs from "fs";

fs.cp('./dist', '../public', { recursive: true }, (err) => {
    if (err) {
        console.error(err);
    }
});
