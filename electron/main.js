//try {
//  require('electron-reloader')(module, {});
//} catch (_) { }
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const request = require('request');
const qs = require('qs');
const { title } = require('process');
let userdata = {};
function createWindow(w, h, preloadjs, mainpage) {
    const mainWindow = new BrowserWindow({
        width: w,
        height: h,
        //frame: false,          // 標題列不顯示
        //transparent: true,     // 背景透明
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, preloadjs)
        }
    })
    mainWindow.loadFile(mainpage)
    //mainWindow.webContents.openDevTools()//!!!devtools!!!
    return mainWindow;
}

app.whenReady().then(() => {
    const win = createWindow(600, 900, 'preload.js', './web/index.html');
    ipcMain.on("toMain", (event, args) => {
        //tomain
        let res = JSON.parse(args);
        console.log(res)
        switch (res.get) {
            //case 'login':
            case 'tosingup':
                win.loadFile("./web/singup/index.html")
                break;
            case 'tologin':
                win.loadFile("./web/index.html")
                break;
            case 'singup':
                request({
                    'method': 'POST',
                    'url': 'https://db.lyuchan.com/add_user',
                    'headers': {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    form: {
                        'uuid': res.uuid,
                        'password': res.password,
                        'phone': res.phone,
                        'name': res.name
                    }
                }, function (error, response) {
                    if (error) {
                        win.webContents.send("fromMain", JSON.stringify({
                            get: "popup",
                            icon: "error",
                            title: "錯誤，請聯繫開發者"
                        }));
                        return;
                    };
                    //console.log(response.body);
                    if (JSON.parse(response.body).success == undefined) {
                        win.webContents.send("fromMain", JSON.stringify({
                            get: "popup",
                            icon: "error",
                            title: "此帳號已被使用"
                        }));
                    } else {
                        win.webContents.send("fromMain", JSON.stringify({
                            get: "popup",
                            icon: "success",
                            title: "成功註冊，請再次登入"
                        }));
                    }

                });
                break;
            case 'login':
                request({
                    'method': 'POST',
                    'url': 'https://db.lyuchan.com/login',
                    'headers': {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    form: {
                        'username': res.uuid,
                        'password': res.password
                    }
                }, function (error, response) {
                    if (error) {
                        win.webContents.send("fromMain", JSON.stringify({
                            get: "popup",
                            icon: "error",
                            title: "錯誤，請聯繫開發者"
                        }));
                        return;
                    };
                    console.log(response.body);
                    userdata.uuid = res.uuid;
                    win.loadFile("./web/panel/index.html")
                });
                break;
            case 'logout':
                win.loadFile("./web/index.html")
                break;
            case 'contline':
                request({
                    'method': 'POST',
                    'url': 'https://db.lyuchan.com/getuserdata',
                    'headers': {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    form: {
                        'username': userdata.uuid
                    }
                }, function (error, response) {
                    if (error) {
                        //error
                        return;
                    };
                    console.log(response.body);
                    if (JSON.parse(response.body).success == undefined) {
                        //error
                        win.webContents.send("fromMain", JSON.stringify({ get: "settings", username: userdata.uuid }));
                    } else {
                        let resuserdata = JSON.parse(response.body)
                        userdata.linename = resuserdata.data[0].name;
                        userdata.lineimg = resuserdata.data[0].photo_url;
                        win.webContents.send("fromMain", JSON.stringify({ get: "csettings", userdata: userdata }));
                    }
                });
                break;
            case 'userdata':

            //getuserdata
        }
    });
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

