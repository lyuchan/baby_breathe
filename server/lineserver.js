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

function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }
    let echo
    switch (event.message.text) {
        case '即時快照':
        case '拍照':
            echo = {
                "type": "text",
                "text": "好歐幫你拍照",
            };
            break;
        case '歷史資料':
            echo = {
                "type": "text",
                "text": "你要管理哪個裝置",
            };
            break;
        case '裝置管理':
            echo = {
                "type": "flex",
                "text": "你要管理哪個裝置",

                "type": "carousel",
                "contents": [
                    {
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
                                            "text": "asokaopsdk",
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
                                            "text": "asokaopsdk",
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
                                        "data": "hello",
                                        "displayText": "刪除裝置"
                                    },
                                    "style": "primary",
                                    "margin": "20px",
                                    "color": "#c82333"
                                }
                            ]
                        }
                    },
                    {
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
                                            "text": "asokaopsdk",
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
                                            "text": "asokaopsdk",
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
                                        "data": "hello",
                                        "displayText": "刪除裝置"
                                    },
                                    "style": "primary",
                                    "margin": "20px",
                                    "color": "#c82333"
                                }
                            ]
                        }
                    },
                    {
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
                                            "text": "asokaopsdk",
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
                                            "text": "asokaopsdk",
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
                                        "data": "hello",
                                        "displayText": "刪除裝置"
                                    },
                                    "style": "primary",
                                    "margin": "20px",
                                    "color": "#c82333"
                                }
                            ]
                        }
                    }
                ]

            };
            break;
        default:
            echo = {
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
    }

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