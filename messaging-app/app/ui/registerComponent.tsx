'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { validateEmail, validatePassword, validateUsername } from "../utils/validate"
import { useNotification } from "@/providers/NotificationContext"
import VerificationCodeInput from "./components/codeInput"
import { VARS } from "../utils/env"
import Input from "./components/inputs"
import { Logo } from "./components/logo"
import { ButtonSend } from "./components/buttons"
import { H1Text, AText } from './components/texts';
import ContainerForm from "./components/containerForm"

export default function RegisterComponent(){
    const [username,setUsername] = useState("");
    const [email,setEmail] = useState("");
    const [showData,setShowData] = useState(false);
    const [showCode,setShowCode] = useState(false);
    const [password,setPassword] = useState("");
    const [passwordConfirm,setPasswordConfirm] = useState("");
    const [code,setCode] = useState("")
    const [loading,setLoading] = useState(false);
    const {showNotification} = useNotification();
    const router = useRouter();

    const handleButton = async ()=>{
        if (!validateEmail(email)){
            showNotification({"message":"Correo Electronico Invalido.","type":"error"})
            return
        }
        setLoading(true)
        const response = await fetch(VARS.API_URL+"users/get_user_by_email/?email="+email,{method:"GET"})
        
        if (response.status==404){
            await fetch(VARS.API_URL+"codes/",{
                method: "POST",
                body:email
            }).then(res=>{
                if (res.status==201){
                    setShowCode(true)
                    showNotification({"message":"Codigo Enviado.","type":"info"})
                }else{
                    throw "Codigo no enviado, intente nuevamente."
                }
            }).catch((err:any)=>{
                showNotification({"message":err.toString(),"type":"error"})
            })
        }else{
            showNotification({"message":"Email utilizado por otro usuario.","type":"error"})
        }

        setLoading(false)
    }

    const handleCodeChange = async (code_input:string)=>{
        if (code_input.length == 6){
            setCode(code_input)
            setLoading(true)
            await fetch(VARS.API_URL+`codes/?email=${email}&code=${code_input}`,{
                method:"GET"
            }).then(res=>{
                if (res.ok){
                    setShowData(true)
                    setShowCode(false)
                    showNotification({"message":"Codigo Validado.","type":"info"})
                }else{
                    throw "Codigo Incorrecto"
                }
            }).catch((err:any)=>{
                showNotification({"message":err.toString(),"type":"error"})
            })
            setLoading(false)
        }
    }
    
    const handleButtonRegister = async ()=>{
        if (loading) return;

        if (!validateUsername(username)){
            showNotification({message:"Usuario Invalido, Debe tener al menos 3 caracteres.",type:"error"})
            return
        }
        if (password!=passwordConfirm){
            showNotification({message:"Las contraseñas no coinciden.",type:"error"})
            return
        }
        if (!validatePassword(password)){
            showNotification({message:"Contraseña Invalida, Debe tener al menos una mayuscula, una minuscula, un numero, un caracteres especial y tener al menos 8 caracteres.",type:"error"})
            return
        }
        if (!validateEmail(email)){
            showNotification({message:"Email Invalido.",type:"error"})
            return
        }
        setLoading(true)
        await fetch(VARS.API_URL+"users/",{
            method: "POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({
                username:username,
                password:password,
                code:code,
                email:email
            })
        }).then(res=>{
            if (res.status==201){
                showNotification({message:"Registro Realizado Correctamente.",type:"success"})
                router.push("/")
            }else if (res.status==409){
                setLoading(false)
                throw "El nombre de usuario ya esta siendo utilizado por otro usuario."
            }
        }).catch((err:any) => {
            showNotification({"message":err.toString(),"type":"error"})
        })
    }

    return (
        <ContainerForm loading={loading}>
            <div className="flex justify-center mb-6">
                <Logo />
            </div>
            <H1Text text="Registro de Usuario" />
            {showData &&(
                <div className="mb-6">
                    <Input 
                        name="username"
                        varValue={username}
                        setState={setUsername}
                        type="text"
                        label="Nombre de Usuario"
                        disabled={false}
                    />
                </div>
                
            )}
            {!showCode &&(
                <div className="mb-6">
                    <Input 
                        varValue={email} 
                        type="text" 
                        name="email" 
                        label="Correo Electronico" 
                        disabled={!showData ? false: true} 
                        setState={setEmail} / >
                </div>
            )}
            {showData && (
                <>
                    <div className="mb-6">
                        <Input 
                            name="password"
                            varValue={password}
                            setState={setPassword}
                            type="password"
                            label="Contraseña"
                            disabled={false}
                        />
                    </div>
                    <div className="mb-6">
                        <Input 
                            name="password-confirm"
                            varValue={passwordConfirm}
                            setState={setPasswordConfirm}
                            type="password"
                            label="Confirmar Contraseña"
                            disabled={false}
                        />
                    </div>
                </>
            )}
            {showCode && (
                <div>
                    <a className="block w-full text-center text-sm text-gray-700 cursor-pointer hover:text-orange-900" onClick={()=>setShowCode(false)}>{email}.¿Es correcto?</a>
                    <div className="flex items-center justify-center pb-9">
                        <VerificationCodeInput onCodeChange={handleCodeChange} />
                    </div>
                </div>
            )}
            {!showCode &&(
                <ButtonSend
                    onClick={!showData ? handleButton : handleButtonRegister}
                    text= {!showData ? "ENVIAR CODIGO" : "ENVIAR"}
                />
            )}
            <AText href="/" text="¿Ya tienes una cuenta? Ingresa aqui." />
        </ContainerForm>
    )
}