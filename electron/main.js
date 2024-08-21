//try {
//  require('electron-reloader')(module, {});
//} catch (_) { }
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const request = require('request');
const qs = require('qs');
const { title } = require('process');
let userdata = {};
let devtools = false;
function createWindow(w, h, preloadjs, mainpage) {
    if (devtools) {
        const mainWindow = new BrowserWindow({
            width: w + 350,
            height: h,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, preloadjs)
            }
        })
        mainWindow.loadFile(mainpage)
        mainWindow.webContents.openDevTools()//!!!devtools!!!
        return mainWindow;
    } else {
        const mainWindow = new BrowserWindow({
            width: w,
            height: h,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, preloadjs)
            }
        })
        mainWindow.loadFile(mainpage)
        return mainWindow;
    }

}
let win2;
app.whenReady().then(() => {
    const win = createWindow(600, 900, 'preload.js', './web/index.html');//600x900

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
                    userdata.lineuuid = JSON.parse(response.body).uuid
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
                        userdata.lineuuid = resuserdata.data[0].uuid
                        userdata.linename = resuserdata.data[0].name;
                        userdata.lineimg = resuserdata.data[0].photo_url;
                        win.webContents.send("fromMain", JSON.stringify({ get: "csettings", userdata: userdata }));
                    }
                });
                break;
            case 'userdata':
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
                        //win.webContents.send("fromMain", JSON.stringify({ get: "settings", username: userdata.uuid }));
                    } else {
                        let resuserdata = JSON.parse(response.body)
                        console.log(resuserdata)
                        userdata.lineuuid = resuserdata.data[0].uuid
                        userdata.linename = resuserdata.data[0].name;
                        userdata.lineimg = resuserdata.data[0].photo_url;
                        win.webContents.send("fromMain", JSON.stringify({ get: "userdata", userdata: userdata }));
                    }
                });
                break;
            case 'display':
                //console.log(win2)
                if (win2 == undefined) {
                    win2 = createWindow(1920, 1080, 'preload.js', './web/display/index.html');//600x900
                    win2.on('close', (e) => {
                        win2 = undefined;
                    })
                } else {
                    win2.moveTop();
                }

                break;
            //getuserdata
        }
    });
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

