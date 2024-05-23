/////////////////////////////////////引入必要的模組/////////////////////////////////////
require('dotenv').config();//環境變數
const fs = require('fs');//系統文件
const path = require('path');//目錄
const express = require('express');//網頁
const { Client, middleware } = require('@line/bot-sdk');//line bot
/////////////////////////////////////變數區/////////////////////////////////////
// 創建 Express 應用程式
const app = express();
const lineapp = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '5000mb' }));
app.use(bodyParser.urlencoded({ limit: '5000mb', extended: true }));
app.use(express.static(__dirname + "/web"));
// 設定路由處理程序

/////////////////////////////////////api功能/////////////////////////////////////
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

/////////////////////////////////////接收圖片/////////////////////////////////////
app.post('/uploadimg', function (req, res) {

    let data = decodeURI(req.body.img)
    let token = decodeURI(req.body.token)
    if (data == "undefined" || token == "undefined") {
        res.send('data error!');
        return;
    }
    let filename = `${token}.png`
    fs.writeFileSync(`./web/img/${filename}`, data, 'base64');
    res.send(encodeURI(filename));
});
/////////////////////////////////////linebot功能/////////////////////////////////////
const lineConfig = {
    channelAccessToken: process.env["CHANNEL_ACCESS_TOKEN"],
    channelSecret: process.env["CHANNEL_SECRET"]
};
const client = new Client(lineConfig);
lineapp.post('/linebotwebhook', middleware(lineConfig), async (req, res) => {
    try {
        let result = await req.body.events.map(handleEvent);
        res.json(result);
    }
    catch (err) {
        console.log(err);
    }
});

const handleEvent = (event) => {

    switch (event.type) {
        case 'join': //這隻機器人加入別人的群組
            break;
        case 'follow': //追蹤這隻機器人
            break;
        case 'message': //傳訊息給機器人
            switch (event.message.type) {
                case 'text':
                    try {
                        let resText;
                        switch (event.message.text) {
                            case '/uuid':
                                resText = `uuid is:${event.source.userId}`;
                                break;
                            case 'test':
                                resText = `測試`;
                                break
                            default:
                                resText = '我不太清楚你再說什麼';
                        }
                        return client.replyMessage(event.replyToken, {
                            type: 'text',
                            text: resText
                        });
                    } catch (err) {
                        console.log(err)
                    }
                    break;
                case 'sticker':
                    // do sth with sticker
                    return
            }
    }
}


/////////////////////////////////////啟動伺服器/////////////////////////////////////
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
lineapp.listen(port + 1, () => {
    console.log(`Line server is running on port ${port + 1}`);
});