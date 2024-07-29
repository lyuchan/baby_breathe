

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
        password: CryptoJS.MD5(password).toString()
    }
    if (uuid == "" || password == "") {
        Toast.fire({
            icon: 'error',
            title: '帳號或密碼不得為空'
        })
        return;
    }
    window.api.send("toMain", JSON.stringify(data));
}

function tosingup() {
    data = {
        get: 'tosingup'
    }
    window.api.send("toMain", JSON.stringify(data));
}
window.api.receive("fromMain", (event) => {
    // console.log(`Received ${data} from main process`);

    console.log('Message from server ', event);
    const data = JSON.parse(event);
    if (data.get == "popup") {
        Toast.fire({
            icon: data.icon,
            title: data.title
        })
    }
});
