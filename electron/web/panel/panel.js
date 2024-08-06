

window.api.send("toMain", JSON.stringify({ get: 'username', }));

let username;

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
/*
function atemip() {
    const atemip = $("#atemip").val();
    if (atemip === "") {
        Toast.fire({
            icon: 'error',
            title: 'IP不得為空'
        })
        return;
    }
    let strAry = atemip.split('.').map(num => parseInt(num));
    if (strAry.length != 4) {
        Toast.fire({
            icon: 'error',
            title: 'IP長度錯誤'
        })
        return;
    }
    if (strAry[3] != 255) {
        Toast.fire({
            icon: 'error',
            title: 'IP非廣播域'
        })
        return;
    }
    Toast.fire({
        icon: 'success',
        title: '成功設置ip'
    })

    data = {
        get: 'broadcastip',
        ip: atemip,
    }
    window.api.send("toMain", JSON.stringify(data));
}

function tallyip() {
    data = {
        get: 'tallyip',
    }
    window.api.send("toMain", JSON.stringify(data));
}

function find(tip) {
    data = {
        get: 'findtally',
        ip: tip
    }
    window.api.send("toMain", JSON.stringify(data));
}

function changeid(ip, id) {
    data = {
        get: 'tallylight',
        ip: ip,
        data: id
    }
    window.api.send("toMain", JSON.stringify(data));
}

function setip(opt, ip) {
    data = {
        get: 'set',
        source: opt,
        ip: ip
    }
    window.api.send("toMain", JSON.stringify(data));
}*/
window.api.receive("fromMain", (event) => {
    // console.log(`Received ${data} from main process`);

    console.log('Message from server ', event);
    const data = JSON.parse(event);
    if (data.get === 'username') {
        username = data.username;
    }

});
/*
function setTally(ip) {
    Swal.fire({
        title: ip,
        html: $('#selectbox-template').text(),
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        preConfirm: () => {
            const select = parseInt(Swal.getPopup().querySelector('#opt').value);
            if (!select) {
                Swal.showValidationMessage(`請選擇一個選項`)
                return;
            }
            changeid(ip, select);
            return;
        }
    })
}

function reloadTally() {
    $('#table-list').empty();
    tallyip();
    Toast.fire({
        icon: 'success',
        title: '已重新整理'
    })
}*/
/*
    window.api.receive("fromMain", (data) => {
            console.log(`Received ${data} from main process`);
        });
        window.api.send("toMain", "some data");
 */
function settings() {
    //swal html settings
    Swal.fire({
        title: '綁定LINE帳號',
        html: `<div class="setBox">
        <p class="setBox-title">請使用手機掃描以下條碼</p>
    </div>
    <div class="setBox">
   <img src="https://db.lyuchan.com/chart?cht=qr&chs=250x250&chl=https://liff.line.me/2005687870-noDkeM50?username=${username}">
    </div>`,
        // showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: '確定',
        //cancelButtonText: '取消',
        /* preConfirm: () => {
             const opt = Swal.getPopup().querySelector('#type-opt').value;
             const opt2 = Swal.getPopup().querySelector('#ip').value;
             console.log(opt);
             console.log(opt2);
             setip(opt, opt2);
             return;
         }*/
    })
}
