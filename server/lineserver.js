/////////////////////////////////////引入必要的模組/////////////////////////////////////
const line = require("@line/bot-sdk");//linebot
const express = require("express");//web server
require('dotenv').config();//環境變數
const config = { channelSecret: process.env["CHANNEL_SECRET"], };
const client = new line.messagingApi.MessagingApiClient({ channelAccessToken: process.env["CHANNEL_ACCESS_TOKEN"] });

const app = express();
app.post('/linebotwebhook', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});
function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }
    const echo = {
        "type": "flex",
        "altText": "carousel flex",
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
    return client.replyMessage({
        replyToken: event.replyToken,
        messages: [echo],
    });
}

// listen on port
const port = 3001;
app.listen(port, () => {
    console.log(`linebot is listening on ${port}`);
});