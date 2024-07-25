

//window.api.send("toMain", JSON.stringify({ get: 'tallyip', }));



const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-right',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
})

function login() {
    const uuid = $("#uuid").val();
    const password = $("#password").val();
    data = {
        get: 'login',
        uuid: uuid,
        password: password
    }
    if(uuid==""||password==""){
        Toast.fire({
            icon: 'error',
            title: '帳號或密碼不得為空'
        })
        return;
    }
    window.api.send("toMain", JSON.stringify(data));
}

function tosingup(){
    data = {
        get: 'tosingup'
    }
    window.api.send("toMain", JSON.stringify(data));
}
/*function atemip() {
    const atemip = $("#atemip").val();
    if (atemip === "") {
        Toast.fire({
            icon: 'error',
            title: '請輸入 ATEM IP'
        })
        return;
    }
    data = {
        get: 'atemip',
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

*/
window.api.receive("fromMain", (event) => {
    // console.log(`Received ${data} from main process`);

    console.log('Message from server ', event);
    const data = JSON.parse(event);
    if (data.get === 'login') {
        if (!data.password) {

            //swal.fire("Error", "Wrong password", "error");
            Toast.fire({
                icon: 'error',
                title: '帳號或密碼錯誤'
            })
        }
    }
    if (data.get === 'atemip') {
        if (data.data) {
            Toast.fire({
                icon: 'success',
                title: '已連線到 ATEM'
            })
        }
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