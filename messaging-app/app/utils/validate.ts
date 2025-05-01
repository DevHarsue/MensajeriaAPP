
export const validateEmail = (email:string) => {
    const regex_email = /^(?!.*\+\d@)(?:[^@]+@[^@]+\.[^@]+)$/;
    email = email.toUpperCase()
    if (!regex_email.test(email)){
        return false
    }

    return email
}

export const validatePassword = (password:string) =>{
    const regex_password = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!regex_password.test(password)){
        return false
    }
    return password
}

export const validateUsername = (username:string) =>{
    if (username.length < 3 || username.includes(" ")){
        return false
    }

    return username.toUpperCase()
}