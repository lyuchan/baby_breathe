/////////////////////////////////////引入必要的模組/////////////////////////////////////
require('dotenv').config();//環境變數
const fs = require('fs');//系統文件
const path = require('path');//目錄
const express = require('express');//網頁
const mysql = require('mysql');//資料庫
const line = require("@line/bot-sdk");//linebot
const WebSocket = require('ws');
var bodyParser = require('body-parser');

/////////////////////////////////////變數區/////////////////////////////////////
// 創建 Express 應用程式
const app = express();
const line_app = express();
app.use(bodyParser.json({ limit: '500000mb' }));
app.use(bodyParser.urlencoded({ limit: '500000mb', extended: true }));
app.use(express.static(__dirname + "/web"));
const config = { channelSecret: process.env["CHANNEL_SECRET"], };
const client = new line.messagingApi.MessagingApiClient({ channelAccessToken: process.env["CHANNEL_ACCESS_TOKEN"] });

var crypto = require('crypto');
class CircularArray {
    constructor(size) {
        this.size = size;
        this.array = [];
    }
    add(element) {
        if (this.array.length >= this.size) {
            this.array.shift(); // 移除最早的元素
        }
        this.array.push(element); // 添加最新的元素
    }
    getArray() {
        return this.array;
    }
}

/////////////////////////////////////啟動伺服器/////////////////////////////////////
const line_port = 3001;
line_app.listen(line_port, () => {
    console.log(`linebot is listening on ${line_port}`);
});
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

function getbase64(i) {
    return crypto.randomBytes(i).toString('base64url');
}
const wss = new WebSocket.Server({ server });
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
    database: 'userdata', // 資料庫名稱
    charset: 'utf8mb4'
});

/////////////////////////////////////ws//////////////////////////////////
wss.on("connection", (ws) => {

    ws.on("message", (event) => {
        //  let res = JSON.parse(event.toString());

    });
    ws.on("close", () => {
        console.log("有人斷開連線");
    });
});

function send(data) {
    let clients = wss.clients;
    clients.forEach((client) => {
        let sendData = data
        client.send(sendData);//回去的資料
    });
}
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

    app.post('/add_user', function (req, res) {
        let { uuid, password, phone, name } = req.body;
        userdb.query(`INSERT INTO user (username, password, phone, name) VALUES ( ?, ?, ?, ?);`, [uuid, password, phone, name], (err, result) => {
            if (err) {
                res.status(500).json({ error: err.code });
                return;
            }
            res.json({ success: true });
        })
    })
    app.post('/login', function (req, res) {
        let { username, password } = req.body;

        userdb.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], (err, results) => {
            if (err) {
                res.status(500).json({ error: 'Database query error' });
                return;
            }
            if (results.length > 0) {
                res.status(200).json({ success: true });
            } else {
                res.status(200).json({ error: 'not_found' });
            }
        });
    })
    app.post('/getuserdata', function (req, res) {
        let { username } = req.body;

        userdb.query('SELECT * FROM user WHERE username = ? ', [username], (err, results) => {
            if (err) {
                res.status(500).json({ error: 'Database query error' });
                return;
            }

            if (results.length > 0) {
                console.log(results[0].uuid);
                if (results[0].uuid != 'null') {
                    userdb.query('SELECT * FROM line_user WHERE uuid = ? ', [results[0].uuid], (err, results) => {
                        if (err) {
                            res.status(500).json({ error: 'Database query error' });
                            return;
                        }
                        if (results.length > 0) {
                            res.status(200).json({ success: true, data: results });
                            return;
                        } else {
                            res.status(200).json({ error: 'not_found' });
                            return;
                        }
                    });
                } else {
                    res.status(200).json({ error: 'no_line_id' });
                    return;
                }
            } else {
                res.status(200).json({ error: 'not_found' });
                return;
            }
        });
    })
    app.post('/cont_line2user', function (req, res) {
        let { uuid, username } = req.body;
        const query = `UPDATE user SET uuid='${uuid}' WHERE user.username='${username}';`;
        userdb.query(query, (err, result) => {
            if (err) {
                res.status(500).json({ error: err.code });
                return;
            }
            res.json({ success: true });
        });
    })
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
        const query = `SELECT * FROM linebot_device WHERE linebot_device.uuid = '${user_id}'`
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
    app.get('/device_ping', function (req, res) {
        const { device_id } = req.query;
        const query = `UPDATE linebot_device SET ping = CURRENT_TIMESTAMP() WHERE linebot_device.device = '${device_id}';`
        userdb.query(query, (err, result) => {
            if (err) {
                res.status(500).json({ error: err.code });
                return;
            }
            res.json({ success: true });
        });
    })
    app.get('/cam_ping', function (req, res) {
        const { device_id } = req.query;
        const query = `UPDATE linebot_device SET cam_ping = CURRENT_TIMESTAMP() WHERE linebot_device.device = '${device_id}';`
        userdb.query(query, (err, result) => {
            if (err) {
                res.status(500).json({ error: err.code });
                return;
            }
            res.json({ success: true });
        });
    })

})
/////////////////////////////////////接收圖片/////////////////////////////////////
app.post('/uploadimg', function (req, res) {

    let data = decodeURI(req.body.img)
    let token = decodeURI(req.body.token)
    let replyToken = decodeURI(req.body.replyToken)
    let pushmsg = decodeURI(req.body.pushmsg)
    if (data == "undefined" || token == "undefined" || replyToken == "undefined") {
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
    if (pushmsg == 'true') {
        const query = `SELECT * FROM linebot_device WHERE linebot_device.device='${replyToken}';`
        userdb.query(query, (err, result) => {
            if (err) {
                res.status(500).json({ error: err.code });
                return;
            }
            if (result.length == 0) {
                res.json({ error: "nodata" });
                return;
            }
            result.forEach(element => {
                console.log(element.name)
                client.pushMessage({
                    to: element.uuid,
                    messages: [{
                        type: 'image',
                        originalContentUrl: `https://db.lyuchan.com/img/${token}.png`,
                        previewImageUrl: `https://db.lyuchan.com/img/${token}.png`
                    }]
                });
                // res.json({ success: true });
            });
        });

    } else {
        client.replyMessage({
            replyToken: replyToken,
            messages: [{
                type: 'image',
                originalContentUrl: `https://db.lyuchan.com/img/${token}.png`,
                previewImageUrl: `https://db.lyuchan.com/img/${token}.png`
            }],
        });
        // res.json({ success: true });
    }


});


/////////////////////////////////////linebot功能/////////////////////////////////////

line_app.post('/linebotwebhook', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

app.get('/linepushmsg', (req, res) => {
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


app.get('/alert', (req, res) => {
    const { device, alertText } = req.query;
    const query = `SELECT * FROM linebot_device WHERE linebot_device.device='${device}';`
    userdb.query(query, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.code });
            return;
        }
        if (result.length == 0) {
            res.json({ error: "nodata" });
            return;
        }
        result.forEach(element => {
            console.log(element.name)
            client.pushMessage({
                to: element.uuid,
                messages: [{
                    type: "text",
                    text: alertText
                }]
            });
        });
    });
    res.json({ success: true });
});
app.get('/alertimg', (req, res) => {
    const { device, alertText } = req.query;
    const query = `SELECT * FROM linebot_device WHERE linebot_device.device='${device}';`
    userdb.query(query, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.code });
            return;
        }
        if (result.length == 0) {
            res.json({ error: "nodata" });
            return;
        }
        result.forEach(element => {
            console.log(element.name)
            client.pushMessage({
                to: element.uuid,
                messages: [{
                    type: "text",
                    text: alertText
                }]
            });
        });
    });
    let picname = getbase64(10);
    send(JSON.stringify({ get: "getpic", device: device, picname: picname, replyToken: device, pushmsg: 'true' }));
    res.json({ success: true });
});

function handleEvent(event) {
    //console.log(event.source.userId)
    if (event.source.userId != undefined) {
        userdb.query(`SELECT * FROM line_user WHERE uuid='${(event.source.userId).toString()}';`, (err, result) => {
            if (err) {
                return;
            }
            console.log(result.length);
            if (result.length == 0) {
                client.getProfile(event.source.userId)
                    .then((profile) => {
                        //console.log(profile.displayName); //顯示使用者名字
                        //console.log(profile.userId);
                        //console.log(profile.pictureUrl); // 顯示使用者大頭照網址
                        //console.log(profile.statusMessage) // 使用者自介內容
                        userdb.query(`INSERT INTO line_user (uuid, name, photo_url) VALUES ('${(event.source.userId).toString()}', '${profile.displayName}', '${profile.pictureUrl}');`, (err, result) => {
                            if (err) {
                                console.log("inserterr:", err);
                                return;
                            }
                        });
                    })
                    .catch((err) => {
                        // error handling
                    });

            }
        });

    }
    if (event.type == 'postback') {
        let resdata = JSON.parse(event.postback.data)
        switch (resdata.get) {
            case 'delete_device':
                const query = `DELETE FROM linebot_device WHERE linebot_device.device = '${resdata.device_id}' AND linebot_device.uuid = '${resdata.uuid}' AND linebot_device.name = '${resdata.name}'`
                userdb.query(query, (err, result) => {
                    if (err) {
                        return;
                    }
                });
                client.replyMessage({
                    replyToken: event.replyToken,
                    messages: [{
                        "type": "text",
                        "text": "已刪除",
                    }],
                });
                break;
            case 'getpic':
                let picname = getbase64(10);
                send(JSON.stringify({ get: "getpic", device: resdata.device_id, picname: picname, replyToken: event.replyToken, pushmsg: 'false' }))
                //console.log(event.replyToken)
                break;
            case 'getdata':
                const insertDataSQL = `SELECT * FROM ${resdata.device_id} order by id desc limit 21;`;
                datadb.query(insertDataSQL, (err, result) => {
                    if (err) {
                        console.error('err:', err);
                        return;
                    }
                    // console.log(`data is:${result}`);
                    let data = []
                    let num = []
                    for (let i = 0; i < result.length; i++) {
                        num.push(i)
                        data.push(result[result.length - i - 1].freq)
                    }
                    let showdata = {
                        labels: num,   // Set X-axis labels
                        datasets: [{
                            label: '頻率',                         // Create the 'Users' dataset
                            data: data           // Add data to the chart
                        }]
                    }
                    client.replyMessage({
                        replyToken: event.replyToken,
                        messages: [{
                            type: 'image',
                            originalContentUrl: encodeURI(`https://db.lyuchan.com/chart?c={type:'line',data:${JSON.stringify(showdata)}}&backgroundColor=white`),
                            previewImageUrl: encodeURI(`https://db.lyuchan.com/chart?c={type:'line',data:${JSON.stringify(showdata)}}&backgroundColor=white`)
                        }],
                    });
                });
                break;
            default:
                client.replyMessage({
                    replyToken: event.replyToken,
                    messages: [{
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
                                            "type": "message",
                                            "label": "即時快照",
                                            "text": "即時快照"
                                        },
                                        "margin": "15px",
                                        "style": "secondary",
                                        "height": "sm"
                                    },
                                    {
                                        "type": "button",
                                        "action": {
                                            "type": "message",
                                            "label": "歷史資料",
                                            "text": "歷史資料"
                                        },
                                        "style": "secondary",
                                        "height": "sm",
                                        "margin": "10px"
                                    },
                                    {
                                        "type": "button",
                                        "action": {
                                            "type": "message",
                                            "label": "裝置管理",
                                            "text": "裝置管理"
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
                    }],
                });
        }

    } else if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    } else {
        switch (event.message.text) {
            case '即時快照':
            case '拍照':
                let echo1 = [{
                    "type": "separator",
                    "color": "#000000"
                },
                {
                    "type": "text",
                    "text": "裝置列表",
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
                    "text": "請選擇要查看的裝置",
                    "size": "20px",
                    "margin": "15px",
                    "weight": "bold",
                    "align": "center"
                }]
                let device_count = 0;
                userdb.query(`SELECT * FROM linebot_device WHERE linebot_device.uuid = '${event.source.userId}'`, (err, result) => {
                    if (err) {
                        console.error(err);
                        return;
                    } else {
                        // console.log(result)
                        const now = new Date();
                        if (result.length == 0) {
                            client.replyMessage({
                                replyToken: event.replyToken,
                                messages: [{
                                    "type": "text",
                                    "text": "目前尚未有裝置，請掃描裝置後方qrcode綁定裝置",
                                }],
                            });
                        } else if (result.length == 1) {
                            if (((now - new Date(result[0].cam_ping)) / 1000) <= 10) {
                                let picname = getbase64(10);
                                send(JSON.stringify({ get: "getpic", device: result[0].device, picname: picname, replyToken: event.replyToken }))
                            } else {
                                client.replyMessage({
                                    replyToken: event.replyToken,
                                    messages: [{
                                        "type": "text",
                                        "text": "目前尚未有裝置上線，麻煩請確認裝置連線狀態",
                                    }],
                                });
                            }
                        } else {
                            for (let i = 0; i < result.length; i++) {

                                if (((now - new Date(result[i].cam_ping)) / 1000) <= 10) {
                                    device_count++;
                                    //ping += "攝影機在線 🟢"
                                    echo1.push({
                                        "type": "button",
                                        "action": {
                                            "type": "postback",
                                            "label": result[i].name,
                                            "data": JSON.stringify({
                                                "get": "getpic",
                                                "device_id": result[i].device,
                                                "uuid": event.source.userId,
                                                "name": result[i].name
                                            }),
                                            "displayText": `幫 ${result[i].name} 拍照`
                                        },
                                        "margin": "15px",
                                        "style": "secondary",
                                        "height": "sm"
                                    })
                                }

                            }
                            echo1.push({
                                "type": "separator",
                                "color": "#000000",
                                "margin": "15px"
                            })
                            if (device_count == 0) {
                                client.replyMessage({
                                    replyToken: event.replyToken,
                                    messages: [{
                                        "type": "text",
                                        "text": "目前尚未有裝置上線，麻煩請確認裝置連線狀態",
                                    }],
                                });
                            } else {
                                client.replyMessage({
                                    replyToken: event.replyToken,
                                    messages: [{
                                        "type": "flex",
                                        "altText": "選擇查看裝置",
                                        "contents": {
                                            "type": "bubble",
                                            "body": {
                                                "type": "box",
                                                "layout": "vertical",
                                                "contents": echo1
                                            }
                                        }
                                    }],
                                });
                            }
                        }
                    }

                });




                /*client.replyMessage({
                    replyToken: event.replyToken,
                    messages: [{
                        type: 'image',
                        originalContentUrl: 'https://placehold.jp/85fffd/000000/640x480.png',
                        previewImageUrl: 'https://placehold.jp/85fffd/000000/640x480.png'

                    }],
                });*/
                break;
            case '歷史資料':
                //const data = new CircularArray(30);
                let echo2 = [{
                    "type": "separator",
                    "color": "#000000"
                },
                {
                    "type": "text",
                    "text": "裝置列表",
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
                    "text": "請選擇要查看的裝置",
                    "size": "20px",
                    "margin": "15px",
                    "weight": "bold",
                    "align": "center"
                }]
                let device_counts = 0;
                userdb.query(`SELECT * FROM linebot_device WHERE linebot_device.uuid = '${event.source.userId}'`, (err, result) => {
                    if (err) {
                        console.error(err);
                        return;
                    } else {
                        // console.log(result)
                        const now = new Date();
                        if (result.length == 0) {
                            client.replyMessage({
                                replyToken: event.replyToken,
                                messages: [{
                                    "type": "text",
                                    "text": "目前尚未有裝置，請掃描裝置後方qrcode綁定裝置",
                                }],
                            });
                        } else if (result.length == 1) {
                            if (((now - new Date(result[0].ping)) / 1000) <= 10) {
                                const insertDataSQL = `SELECT * FROM ${result[0].device} order by id desc limit ${21};`;
                                datadb.query(insertDataSQL, (err, result) => {
                                    if (err) {
                                        console.error('err:', err);
                                        return;
                                    }
                                    // console.log(`data is:${result}`);
                                    let data = []
                                    let num = []
                                    for (let i = 0; i < result.length; i++) {
                                        num.push(i)
                                        data.push(result[result.length - i - 1].freq)
                                    }
                                    let showdata = {
                                        labels: num,   // Set X-axis labels
                                        datasets: [{
                                            label: '頻率',                         // Create the 'Users' dataset
                                            data: data           // Add data to the chart
                                        }]
                                    }
                                    client.replyMessage({
                                        replyToken: event.replyToken,
                                        messages: [{
                                            type: 'image',
                                            originalContentUrl: encodeURI(`https://db.lyuchan.com/chart?c={type:'line',data:${JSON.stringify(showdata)}}&backgroundColor=white`),
                                            previewImageUrl: encodeURI(`https://db.lyuchan.com/chart?c={type:'line',data:${JSON.stringify(showdata)}}&backgroundColor=white`)
                                        }],
                                    });
                                });
                            } else {
                                client.replyMessage({
                                    replyToken: event.replyToken,
                                    messages: [{
                                        "type": "text",
                                        "text": "目前尚未有裝置上線，麻煩請確認裝置連線狀態",
                                    }],
                                });
                            }
                        } else {
                            for (let i = 0; i < result.length; i++) {

                                if (((now - new Date(result[i].ping)) / 1000) <= 10) {
                                    device_counts++;
                                    echo2.push({
                                        "type": "button",
                                        "action": {
                                            "type": "postback",
                                            "label": result[i].name,
                                            "data": JSON.stringify({
                                                "get": "getdata",
                                                "device_id": result[i].device,
                                                "uuid": event.source.userId,
                                                "name": result[i].name
                                            }),
                                            "displayText": `查看 ${result[i].name} 的呼吸紀錄`
                                        },
                                        "margin": "15px",
                                        "style": "secondary",
                                        "height": "sm"
                                    })
                                }

                            }
                            echo2.push({
                                "type": "separator",
                                "color": "#000000",
                                "margin": "15px"
                            })
                            if (device_counts == 0) {
                                client.replyMessage({
                                    replyToken: event.replyToken,
                                    messages: [{
                                        "type": "text",
                                        "text": "目前尚未有裝置上線，麻煩請確認裝置連線狀態",
                                    }],
                                });
                            } else {
                                client.replyMessage({
                                    replyToken: event.replyToken,
                                    messages: [{
                                        "type": "flex",
                                        "altText": "選擇查看裝置",
                                        "contents": {
                                            "type": "bubble",
                                            "body": {
                                                "type": "box",
                                                "layout": "vertical",
                                                "contents": echo2
                                            }
                                        }
                                    }],
                                });
                            }
                        }
                    }

                });
                ////////////////////////////////////

                break;
            case '裝置管理':
                let echo = []
                const query = `SELECT * FROM linebot_device WHERE linebot_device.uuid = '${event.source.userId}'`
                userdb.query(query, (err, result) => {
                    if (err) {
                        console.error(err);
                        return;
                    } else {
                        // console.log(result)
                        const now = new Date();
                        if (result.length == 0) {
                            client.replyMessage({
                                replyToken: event.replyToken,
                                messages: [{
                                    "type": "text",
                                    "text": "目前尚未有裝置，請掃描裝置後方qrcode綁定裝置",
                                }],
                            });
                        } else {
                            for (let i = 0; i < result.length; i++) {
                                let ping = ""
                                if (((now - new Date(result[i].ping)) / 1000) > 10) {
                                    ping += "感測器斷線 🔴\n"
                                } else {
                                    ping += "感測器在線 🟢\n"
                                }
                                if (((now - new Date(result[i].cam_ping)) / 1000) > 10) {
                                    ping += "攝影機斷線 🔴"
                                } else {
                                    ping += "攝影機在線 🟢"
                                }

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
                                                        "url": "https://db.lyuchan.com/icon/baby2.png",
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
                                                        "url": "https://db.lyuchan.com/icon/device.png",
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
                                                        "url": "https://db.lyuchan.com/icon/url.png"
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
                                                        "text": ping,
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
                                                    "data": JSON.stringify({
                                                        "get": "delete_device",
                                                        "device_id": result[i].device,
                                                        "uuid": event.source.userId,
                                                        "name": result[i].name
                                                    }),
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

                            client.replyMessage({
                                replyToken: event.replyToken,
                                messages: [
                                    {
                                        "type": "flex",
                                        "altText": "裝置狀態",
                                        'contents': {
                                            "type": "carousel",
                                            "contents": echo
                                        }
                                    }],
                            });
                        }
                    }
                });
                break;
            default:
                client.replyMessage({
                    replyToken: event.replyToken,
                    messages: [{
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
                                            "type": "message",
                                            "label": "即時快照",
                                            "text": "即時快照"
                                        },
                                        "margin": "15px",
                                        "style": "secondary",
                                        "height": "sm"
                                    },
                                    {
                                        "type": "button",
                                        "action": {
                                            "type": "message",
                                            "label": "歷史資料",
                                            "text": "歷史資料"
                                        },
                                        "style": "secondary",
                                        "height": "sm",
                                        "margin": "10px"
                                    },
                                    {
                                        "type": "button",
                                        "action": {
                                            "type": "message",
                                            "label": "裝置管理",
                                            "text": "裝置管理"
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
                    }],
                });
        }

    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}