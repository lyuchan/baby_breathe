




let lineuuid_timer = setInterval(() => {
    window.api.send("toMain", JSON.stringify({ get: 'userdata', }));
    if (userdata.lineuuid != null) {
        clearInterval(lineuuid_timer)
    }
}, 1000);
let userdata = {};
const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-right',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
})
function hide() {
    data = {
        get: 'hide'
    }
    window.api.send("toMain", JSON.stringify(data));
}
function login() {
    const uuid = $("#uuid").val();
    const password = $("#password").val();
    data = {
        get: 'login',
        uuid: uuid,
        password: password
    }
    window.api.send("toMain", JSON.stringify(data));
}
function logout() {
    data = {
        get: 'logout',
    }
    window.api.send("toMain", JSON.stringify(data));
}
window.api.receive("fromMain", (event) => {
    // console.log(`Received ${data} from main process`);

    console.log('Message from server ', event);
    const data = JSON.parse(event);
    switch (data.get) {
        case 'settings':
            settings(data.username);
            break;
        case 'csettings':
            userdata = data.userdata;
            csettings(data.userdata);
            break;
        case 'userdata':
            userdata = data.userdata;
            console.log(userdata)
            break;
    }

});
function settings(username) {
    //swal html settings
    Swal.fire({
        title: '綁定LINE帳號',
        html: `<div class="setBox">
        <p class="setBox-title">請使用手機掃描以下條碼</p>
    </div>
    <div class="setBox">
   <img src="https://db.lyuchan.com/chart?cht=qr&chs=250x250&chl=https://liff.line.me/2005687870-noDkeM50?username=${username}">
    </div>`,
        focusConfirm: false,
        confirmButtonText: '確定',
    })
}
function csettings(userdata) {
    Swal.fire({
        title: '綁定LINE帳號',
        html: `<div class="setBox">
        <p class="setBox-title">你已經綁定line帳號了，要重新綁定嗎?</p>
       
    </div>
     <p class="setBox-title" style="color:#181717;">你已經綁定line帳號了，要重新綁定嗎?</p>
    <div class="setBox">
   <img style="width:150px;height:150px;border-radius: 50%;object-fit: cover; "src="${userdata.lineimg}">
   
    </div>
    <p class="setBox-title" style="color:#181717;">你已經綁定line帳號了，要重新綁定嗎?</p>
    <p class="setBox-title">${userdata.linename}</p>`,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        preConfirm: () => {
            settings(userdata.uuid);
            return;
        }
    })
}
function tosettings() {
    data = {
        get: 'contline'
    }
    window.api.send("toMain", JSON.stringify(data));
}
function settingdevice(deviceid) {
    console.log(deviceid);
}
function showinfo(deviceid) {
    console.log(deviceid);
    Swal.fire({
        title: '查看裝置',
        html: `<div class="setBox">
        <p class="setBox-title">請選擇視圖放置位置</p>
       
    </div>
     <p class="setBox-title" style="color:#181717;">你已經綁定line帳號了，要重新綁定嗎?</p>
    <div class="setBox">
    <button class="windowsbutton">1</button><button class="windowsbutton">2</button><button class="windowsbutton">3</button>
    </div>
     <div class="setBox">
    <button class="windowsbutton">4</button><button class="windowsbutton">5</button><button class="windowsbutton">6</button>
    </div><div class="setBox">
    <button class="windowsbutton">7</button><button class="windowsbutton">8</button><button class="windowsbuttonx"></button>
    </div>   `,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        preConfirm: () => {
            //settings(userdata.uuid);
            return;
        }
    })
}

function display() {
    data = {
        get: 'display'
    }
    window.api.send("toMain", JSON.stringify(data));
}