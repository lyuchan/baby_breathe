/////////////////////////////////////引入必要的模組/////////////////////////////////////
require('dotenv').config();//環境變數
const fs = require('fs');//系統文件
const path = require('path');//目錄
const express = require('express');//網頁
const { Client, middleware } = require('@line/bot-sdk');//line bot
const mysql = require('mysql');
/////////////////////////////////////變數區/////////////////////////////////////
// 創建 Express 應用程式
const app = express();
const lineapp = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '500000mb' }));
app.use(bodyParser.urlencoded({ limit: '500000mb', extended: true }));
app.use(express.static(__dirname + "/web"));
// 設定路由處理程序
/////////////////////////////////////mysql/////////////////////////////////////
const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env["user"],
    password: process.env["password"],
    database: 'data' // 資料庫名稱
});

connection.connect((err) => {
    if (err) {
        console.error('無法連線到 MySQL：', err);
        return;
    }
    console.log('已成功連線到 MySQL');

    // 函式：新增或更新資料表
    function createOrUpdateTable(token, freq, up, date) {
        const tableName = token; // 使用 token 作為資料表名稱

        // 建立 SQL 指令
        const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          freq INT,
          up BOOLEAN,
          date DATETIME
        )
      `;

        // 執行 SQL 指令
        connection.query(createTableSQL, (err) => {
            if (err) {
                console.error('無法建立資料表：', err);
                return;
            }
            console.log(`已建立或更新資料表 ${tableName}`);

            // 插入資料
            const insertDataSQL = `
          INSERT INTO ${tableName} (freq, up, date)
          VALUES (?, ?, ?)
        `;
            const values = [freq, up, date];
            connection.query(insertDataSQL, values, (err, result) => {
                if (err) {
                    console.error('無法插入資料：', err);
                    return;
                }
                console.log(`已插入資料到 ${tableName}，ID：${result.insertId}`);
            });
        });
    }
    //createOrUpdateTable('asdfghjk', t, y, new Date());
    // 結束 MySQL 連線
    //  connection.end();

    /////////////////////////////////////api功能/////////////////////////////////////
    app.get('/api', (req, res) => {
        const { token, freq, up } = req.query; // 從查詢參數中獲取 freq 和 up 的值
        //如果token或freq或up是undefine則返回data error!
        if (token === undefined || freq === undefined || up === undefined) {
            res.send('Data error!');
            return;
        }
        let upb = false;
        if (up == 'true') {
            upb = true;
        } else {
            upb = false;
        }

        createOrUpdateTable(token, parseInt(freq), upb, new Date());
        res.send('Data saved successfully!');
    });

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