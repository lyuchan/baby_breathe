

window.api.send("toMain", JSON.stringify({ get: 'tallyip', }));



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
}
window.api.receive("fromMain", (event) => {
    // console.log(`Received ${data} from main process`);

    console.log('Message from server ', event);
    const data = JSON.parse(event);
    if (data.get === 'login') {
        if (!data.password) {

            swal.fire("Error", "Wrong password", "error");
        }
    }
    if (data.get === 'connect') {
        if (data.data) {
            Toast.fire({
                icon: 'success',
                title: '連線成功'
            })
        } else {
            Toast.fire({
                icon: 'error',
                title: '連線失敗，請檢查設定'
            })
        }
    }
    if (data.get === 'error') {

        Toast.fire({
            icon: 'error',
            title: data.data
        })

    }
    if (data.get === 'findtally') {
        if (data.data) {
            Toast.fire({
                icon: 'success',
                title: '已發送尋找請求'
            })
        }
    }
    if (data.get === 'tallyip') {
        ip = data.ip;
        console.log(ip);
        $('#table-list').empty();
        for (let i = 0; i < ip.length; i++) {
            let template = $('#col-template').text();
            template = template.replace(/{{ip}}/g, ip[i]).replace(/{{id}}/g, i + 1);
            $('#table-list').append(template);
        }
    }
    if (data.get === 'tallylight') {
        if (data.data === 'ok') {
            Toast.fire({
                icon: 'success',
                title: '變更成功'
            })
        }
    }
});

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
}
/*
    window.api.receive("fromMain", (data) => {
            console.log(`Received ${data} from main process`);
        });
        window.api.send("toMain", "some data");
 */
function settings() {
    //swal html settings
    Swal.fire({
        title: '設定',
        html: $('#settings-template').text(),
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        preConfirm: () => {
            const opt = Swal.getPopup().querySelector('#type-opt').value;
            const opt2 = Swal.getPopup().querySelector('#ip').value;
            console.log(opt);
            console.log(opt2);
            setip(opt, opt2);
            return;
        }
    })
}
