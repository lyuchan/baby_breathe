

//window.api.send("toMain", JSON.stringify({ get: 'tallyip', }));



const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-right',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
})

function singup() {
    const name = $("#name").val();
    const phone = $("#phone").val();
    const uuid = $("#uuid").val();
    const password = $("#password").val();
    data = {
        get: 'singup',
        name: name,
        phone: phone,
        uuid: uuid,
        password: CryptoJS.MD5(password).toString()
    }

    if (name == "" || phone == "" || uuid == "" || password == "") {
        Toast.fire({
            icon: 'error',
            title: '任一資料不得為空'
        })
        return;
    }
    window.api.send("toMain", JSON.stringify(data));
}
function tologin() {
    data = {
        get: 'tologin'
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
