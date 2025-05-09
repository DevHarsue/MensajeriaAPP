'use client'

import { useState } from "react"
import { Logo } from "./components/logo"
import { AText, H1Text } from './components/texts';
import Input from "./components/inputs";
import { ButtonSend } from "./components/buttons";
import ContainerForm from "./components/containerForm";
import { VARS } from "../utils/env";
import { useNotification } from "@/providers/NotificationContext";
import { setCookie } from "cookies-next";

export default function LoginComponent(){
    const [username,setUsername] = useState("")
    const [password,setPassword] = useState("")
    const [loading,setLoading] = useState(false)
    const {showNotification} = useNotification()

    const handleButton = async ()=>{
        setLoading(true)
        await fetch(VARS.API_URL+"token/",{
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `username=${username}&password=${password}`
        }).then(async res=>{
            if (res.status==200){
                const data = await res.json()
                setCookie("token",data.access_token,{
                    secure: VARS.ENV=="production",
                    sameSite: "none",
                    maxAge: 86400 * 7
                })
                
                showNotification({"message":"SESION INICIADA.","type":"success"})
                window.location.assign("/home")

            }else if (res.status==401){
                showNotification({"message":"Usuario o Contraseña Incorrecta.","type":"info"})
                setLoading(false)
            }else{
                throw "Intente nuevamente."
            }

        }).catch(err=>{
            showNotification({"message":err.toString(),"type":"error"})
            setLoading(false)

        })
    }

    

    return (
        <ContainerForm loading={loading}>
            <div className="flex justify-center mb-6">
                <Logo />
            </div>
            <H1Text text="Bienvenido a Messaging App" />
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
            <ButtonSend text="INICIAR SESION" onClick={handleButton}/>
            <AText href="/recover" text="¿Olvidaste tus datos?" />
            <AText href="register" text="¿No tienes usuario? Registrate aqui."/>
        </ContainerForm>
    )
}