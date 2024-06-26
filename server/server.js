/////////////////////////////////////引入必要的模組/////////////////////////////////////
require('dotenv').config();//環境變數
const fs = require('fs');//系統文件
const path = require('path');//目錄
const express = require('express');//網頁
const mysql = require('mysql');//資料庫
const line = require("@line/bot-sdk");//linebot
/////////////////////////////////////變數區/////////////////////////////////////
// 創建 Express 應用程式
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '500000mb' }));
app.use(bodyParser.urlencoded({ limit: '500000mb', extended: true }));
app.use(express.static(__dirname + "/web"));
const config = { channelSecret: process.env["CHANNEL_SECRET"], };
const client = new line.messagingApi.MessagingApiClient({ channelAccessToken: process.env["CHANNEL_ACCESS_TOKEN"] });

/////////////////////////////////////mysql/////////////////////////////////////
const datadb = mysql.createConnection({
    host: 'localhost',
    user: process.env["user"],
    password: process.env["password"],
    database: 'data' // 資料庫名稱
});
const userdb = mysql.createConnection({
    host: 'localhost',
    user: process.env["user"],
    password: process.env["password"],
    database: 'userdata' // 資料庫名稱
});

datadb.connect((err) => {
    if (err) {
        console.error('無法連線到datadb', err);
        return;
    }
    console.log('已成功連線到datadb');

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
        datadb.query(createTableSQL, (err) => {
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
            datadb.query(insertDataSQL, values, (err, result) => {
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
    //  datadb.end();

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
    app.get('/getapi', (req, res) => {
        const { token, limit } = req.query; // 從查詢參數中獲取 freq 和 up 的值
        //如果token或freq或up是undefine則返回data error!
        if (token === undefined || limit === undefined) {
            res.send('Data error!');
            return;
        }
        const insertDataSQL = `SELECT * FROM ${token} order by id desc limit ${limit};`;
        datadb.query(insertDataSQL, (err, result) => {
            if (err) {
                console.error('err:', err);
                return;
            }
            // console.log(`data is:${result}`);
            let data = []
            for (let i = 0; i < result.length; i++) {
                data.push(result[result.length - i - 1])
            }
            res.send(data)
        });
    });



});
userdb.connect((err) => {
    if (err) {
        console.error('無法連線到userdb', err);
        return;
    }
    console.log('已成功連線到userdb');
    app.post('/add_device', function (req, res) {
        let { uuid, device, name } = req.body;
        const query = 'INSERT INTO linebot_device (uuid,device,name) VALUES ( ?, ?, ?)';
        userdb.query(query, [uuid, device, name], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    res.json({ error: 'username_used' });
                } else {
                    res.status(500).json({ error: err.code });
                }
                return;
            }
            res.json({ success: true });
        });
    })

    app.post('/del_device', function (req, res) {
        let { device } = req.body;
        const query = `DELETE FROM linebot_device WHERE linebot_device.device = '${device}'`
        userdb.query(query, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    res.json({ error: 'username_used' });
                } else {
                    res.status(500).json({ error: err.code });
                }
                return;
            }
            res.json({ success: true });
        });
    })
    app.get('/user_device_list', function (req, res) {
        const { user_id } = req.query;
        const query = `SELECT device FROM linebot_device WHERE linebot_device.uuid = '${user_id}'`
        userdb.query(query, (err, result) => {
            if (err) {
                res.status(500).json({ error: err.code });
                return;
            }
            res.json({ success: true, data: result });
        });
    })
    app.get('/device_user_list', function (req, res) {
        const { device_id } = req.query;
        const query = `SELECT uuid FROM linebot_device WHERE linebot_device.device = '${device_id}'`
        userdb.query(query, (err, result) => {
            if (err) {
                res.status(500).json({ error: err.code });
                return;
            }
            res.json({ success: true, data: result });
        });
    })
})
/////////////////////////////////////接收圖片/////////////////////////////////////
app.post('/uploadimg', function (req, res) {

    let data = decodeURI(req.body.img)
    let token = decodeURI(req.body.token)
    if (data == "undefined" || token == "undefined") {
        res.send('data error!');
        return;
    }
    const dir = './web/img/';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    let filename = `${token}.png`
    fs.writeFileSync(`./web/img/${filename}`, data, 'base64');
    res.send(encodeURI(filename));
});

/////////////////////////////////////linebot功能/////////////////////////////////////
const line_app = express();
line_app.post('/linebotwebhook', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});
line_app.get('/linepushmsg', (req, res) => {
    const { text, user_id } = req.query;
    client.pushMessage({
        to: user_id,
        messages: [{
            type: "text",
            text: text
        }]
    });
    res.json({ success: true });
});

function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }
    switch (event.message.text) {
        case '即時快照':
        case '拍照':

            client.replyMessage({
                replyToken: event.replyToken,
                messages: [{
                    "type": "text",
                    "text": "好歐幫你拍照",
                }],
            });
            break;
        case '歷史資料':
            client.replyMessage({
                replyToken: event.replyToken,
                messages: [{
                    "type": "text",
                    "text": "歷史資料",
                }],
            });
            break;
        case '裝置管理':
            let echo = []
            const query = `SELECT device FROM linebot_device WHERE linebot_device.uuid = '${event.source.userId}'`
            userdb.query(query, (err, result) => {
                if (err) {
                    //  res.status(500).json({ error: err.code });
                    //   return;
                } else {
                    for (let i = 0; i < result.length; i++) {
                        echo.push({
                            "type": "bubble",
                            "body": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "裝置狀態",
                                        "size": "30px",
                                        "weight": "bold",
                                        "align": "center"
                                    },
                                    {
                                        "type": "box",
                                        "layout": "horizontal",
                                        "contents": [
                                            {
                                                "type": "image",
                                                "url": "https://cdn-icons-png.flaticon.com/512/404/404956.png",
                                                "flex": 0,
                                                "size": "20px",
                                                "aspectRatio": "1:1"
                                            },
                                            {
                                                "type": "text",
                                                "text": "小孩名稱",
                                                "flex": 0,
                                                "margin": "3px",
                                                "weight": "bold"
                                            },
                                            {
                                                "type": "text",
                                                "text": result[i].name,
                                                "wrap": true,
                                                "align": "start",
                                                "flex": 3,
                                                "margin": "10px"
                                            }
                                        ],
                                        "justifyContent": "flex-start",
                                        "alignItems": "flex-start",
                                        "margin": "20px"
                                    },
                                    {
                                        "type": "box",
                                        "layout": "horizontal",
                                        "contents": [
                                            {
                                                "type": "image",
                                                "url": "https://cdn-icons-png.flaticon.com/512/80/80932.png",
                                                "flex": 0,
                                                "size": "20px",
                                                "aspectRatio": "1:1"
                                            },
                                            {
                                                "type": "text",
                                                "text": "裝置名稱",
                                                "flex": 0,
                                                "margin": "3px",
                                                "weight": "bold"
                                            },
                                            {
                                                "type": "text",
                                                "text": result[i].device,
                                                "wrap": true,
                                                "align": "start",
                                                "flex": 3,
                                                "margin": "10px"
                                            }
                                        ],
                                        "justifyContent": "flex-start",
                                        "alignItems": "flex-start",
                                        "margin": "5px"
                                    },
                                    {
                                        "type": "box",
                                        "layout": "horizontal",
                                        "contents": [
                                            {
                                                "type": "image",
                                                "size": "20px",
                                                "aspectRatio": "1:1",
                                                "flex": 0,
                                                "url": "https://cdn-icons-png.flaticon.com/512/1824/1824953.png"
                                            },
                                            {
                                                "type": "text",
                                                "text": "連接狀態",
                                                "flex": 0,
                                                "margin": "3px",
                                                "weight": "bold"
                                            },
                                            {
                                                "type": "text",
                                                "text": "線上✅",
                                                "wrap": true,
                                                "align": "start",
                                                "flex": 3,
                                                "margin": "10px"
                                            }
                                        ],
                                        "justifyContent": "flex-start",
                                        "alignItems": "flex-start",
                                        "margin": "5px"
                                    },
                                    {
                                        "type": "button",
                                        "action": {
                                            "type": "postback",
                                            "label": "刪除裝置",
                                            "data": result[i].uuid,
                                            "displayText": "刪除裝置"
                                        },
                                        "style": "primary",
                                        "margin": "20px",
                                        "color": "#c82333"
                                    }
                                ]
                            }
                        })
                    }
                }
                // res.json({ success: true, data: result });
            });
            client.replyMessage({
                replyToken: event.replyToken,
                messages: [
                    {
                        "type": "flex",
                        "altText": "裝置狀態",
                        'contents': {
                            "type": "carousel",
                            "contents": [echo]
                        }
                    }],
            });
            break;
        default:
            echo = {
                "type": "flex",
                "altText": "我並未理解您的訊息",
                "contents": {
                    "type": "bubble",
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "separator",
                                "color": "#000000"
                            },
                            {
                                "type": "text",
                                "text": "我並未理解您的訊息",
                                "size": "25px",
                                "align": "center",
                                "weight": "bold",
                                "margin": "15px"
                            },
                            {
                                "type": "separator",
                                "color": "#000000",
                                "margin": "15px"
                            },
                            {
                                "type": "text",
                                "text": "我有以下功能",
                                "size": "20px",
                                "margin": "15px",
                                "weight": "bold",
                                "align": "center"
                            },
                            {
                                "type": "button",
                                "action": {
                                    "type": "uri",
                                    "label": "綁定",
                                    "uri": "https://liff.line.me/2005687870-mLLOD7wA?device_id=lyuchan"
                                },
                                "margin": "15px",
                                "style": "secondary",
                                "height": "sm"
                            },
                            {
                                "type": "button",
                                "action": {
                                    "type": "message",
                                    "label": "action",
                                    "text": "hello1"
                                },
                                "style": "secondary",
                                "height": "sm",
                                "margin": "10px"
                            },
                            {
                                "type": "separator",
                                "color": "#000000",
                                "margin": "15px"
                            }
                        ]
                    }
                }
            };
    }


}

/////////////////////////////////////啟動伺服器/////////////////////////////////////
const line_port = 3001;
line_app.listen(line_port, () => {
    console.log(`linebot is listening on ${line_port}`);
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

