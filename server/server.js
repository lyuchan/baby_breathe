/////////////////////////////////////引入必要的模組/////////////////////////////////////
require('dotenv').config();//環境變數
const fs = require('fs');//系統文件
const path = require('path');//目錄
const express = require('express');//網頁
const mysql = require('mysql');//資料庫
const axios = require('axios');
/////////////////////////////////////變數區/////////////////////////////////////
// 創建 Express 應用程式
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '500000mb' }));
app.use(bodyParser.urlencoded({ limit: '500000mb', extended: true }));
app.use(express.static(__dirname + "/web"));
// 設定路由處理程序
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
        console.error('無法連線到 MySQL：', err);
        return;
    }
    console.log('已成功連線到 MySQL');
    app.post('/add_device', function (req, res) {
        let { uuid, device } = req.body;
        const query = 'INSERT INTO linebot_device (uuid,device) VALUES ( ?, ?)';
        userdb.query(query, [uuid, device], (err, result) => {
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
/////////////////////////////////////啟動伺服器/////////////////////////////////////
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

