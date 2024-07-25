const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

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
        }
    });
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

