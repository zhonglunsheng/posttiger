// backup.js

const fs = require('fs');
const path = require('path');

// 备份数据保存的目录
const backupDir = path.join(__dirname, '..', 'backups');

// 创建备份目录（如果不存在）
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

// 备份数据的有效期（一天）
const backupLifetime = 24 * 60 * 60 * 1000; // 24小时

function backupData(data) {
    // 生成当前日期的字符串，包含秒数
    const currentTimestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const backupFileName = `${currentTimestamp}.json`;
    const backupFilePath = path.join(backupDir, backupFileName);

    // 写入备份文件
    fs.writeFileSync(backupFilePath, JSON.stringify(data));
}

function cleanupExpiredBackups() {
    const files = fs.readdirSync(backupDir);

    // 排序备份文件，以确保最新的文件在前面
    const sortedFiles = files.sort((a, b) => {
        const aDate = new Date(a.slice(0, 10)).getTime();
        const bDate = new Date(b.slice(0, 10)).getTime();
        return bDate - aDate;
    });

    // 保留最新的30个备份文件，删除其他文件
    const filesToKeep = sortedFiles.slice(0, 30);

    files.forEach((file) => {
        const filePath = path.join(backupDir, file);

        if (!filesToKeep.includes(file)) {
            fs.unlinkSync(filePath);
        }
    });
}

function backupRouteHandler(req, res) {
    const data = req.body.data;

    if (!data) {
        return res.status(400).send({ error: 'Missing data parameter' });
    }

    // 使用备份函数
    backupData(data);

    res.json({ success: true });
}

function syncDataRouterHandler(req, res) {
    try {
        const files = fs.readdirSync(backupDir);

        // 获取最新的备份文件路径
        const latestBackup = files[files.length - 1];
        const latestBackupPath = path.join(backupDir, latestBackup);
        console.log(latestBackupPath)
        // 读取文件内容
        const fileContent = fs.readFileSync(latestBackupPath, 'utf-8');

        // 直接返回文件内容字符串
        res.status(200).send(fileContent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { backupRouteHandler, cleanupExpiredBackups, syncDataRouterHandler };
