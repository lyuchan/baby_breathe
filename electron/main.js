const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const axios = require('axios');
const qs = require('qs');
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
                let data = qs.stringify({
                    'uuid': res.uuid,
                    'password': res.password,
                    'phone': res.phone,
                    'name': res.name
                });
                let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: 'https://db.lyuchan.com/add_user',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: data
                };
                axios.request(config)
                    .then((response) => {
                        console.log(JSON.stringify(response.data));
                    })
                    .catch((error) => {
                        //console.log(error);
                    });

                break;
        }
    });
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

