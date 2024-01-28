async function signup(e){
    try {
        e.preventDefault()
        const signupDetails = {
            name: e.target.name.value,
            email: e.target.email.value,
            password: e.target.password.value
        }
        const response = await axios.post('/user/signup', signupDetails)
        if (response.status >= 200 && response.status < 300) {
            window.location.href = "/user/login"
        }else{
            throw new Error('Failed to login')
        }


    } catch (error) {
        document.getElementById('error-alert').innerText = error.message;
        document.getElementById('error-alert').style.display = 'block';
    }
    e.target.reset();
}