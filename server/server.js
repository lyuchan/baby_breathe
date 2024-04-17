// 引入必要的模組
const express = require('express');
const fs = require('fs');
const path = require('path');

// 創建 Express 應用程式
const app = express();
app.use(express.static(__dirname + "/web"));
// 設定路由處理程序
app.get('/api', (req, res) => {
    const { token, freq, up } = req.query; // 從查詢參數中獲取 freq 和 up 的值
    //如果token或freq或up是undefine則返回data error!
    if (token === undefined || freq === undefined || up === undefined) {
        res.send('data error!');
        return;
    }
    const timestamp = new Date().toISOString(); // 獲取當前時間
    try {
        fs.accessSync(`./web/api/${token}.json`, fs.constants.F_OK);
        console.log('檔案已存在。');
    } catch (err) {
        // 檔案不存在，可以在這裡新增一個檔案
        try {
            fs.writeFileSync(`./web/api/${token}.json`, '[]');
            console.log('成功新增檔案！');
        } catch (writeErr) {
            console.error('無法新增檔案：', writeErr);
        }
    }

    // 讀取現有的資料
    const filePath = path.join(__dirname, 'web/api', `${token}.json`);
    let existingData = [];
    try {
        const dataBuffer = fs.readFileSync(filePath);
        existingData = JSON.parse(dataBuffer.toString());
        console.log(existingData)
    } catch (error) {
        console.error('Error reading existing data:', error.message);
    }

    // 將新資料追加到 data.json 檔案
    const newData = { freq, up, timestamp };
    try {
        existingData.push(newData);
    } catch (error) {
        existingData = [existingData];
        existingData.push(newData);
    }

    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    res.send('Data saved successfully!');

});

// 啟動伺服器
const port = process.env.PORT || 80;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
