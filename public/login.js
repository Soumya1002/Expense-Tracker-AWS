function login(e) {
    e.preventDefault();
    console.log(e.target.name);

    const loginDetails = {
        email: e.target.email.value,
        password: e.target.password.value
    }
    console.log(loginDetails)
    axios.post('/user/login',loginDetails).then(response => {
            alert(response.data.message)
            localStorage.setItem('token',response.data.token)
            window.location.href = "/expense/index"
    }).catch(err => {
        console.log(JSON.stringify(err))
        document.body.innerHTML += `<div style="color:red;">${err.message} <div>`;
    })
    e.target.reset();
}

function forgetpassword() {
    window.location.href = "forgetpass"
}
