
/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 * 
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
/*
const { ipcRenderer } = require('electron');
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('logout_bth')) {
    document.getElementById('logout_bth').addEventListener('click', () => {
      ipcRenderer.send('logout', "logout");
    })
  }
  if (document.getElementById('login')) {
    document.getElementById('login').addEventListener('click', () => {
      login();
    })
  }



  ipcRenderer.on('timer', (event, args) => {
    ip = args.ip;
    ipset(ip)
  });
  // ipcRenderer.send('getip', JSON.stringify({ip:ip }));



})

function login() {
  const uuid = document.getElementById("uuid").value;
  const password = document.getElementById("password").value;
  data = {
    uuid: uuid,
    password: password
  }
  ipcRenderer.send('login', JSON.stringify(data));
}



//win 2
*/
const {
  contextBridge,
  ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
}
);