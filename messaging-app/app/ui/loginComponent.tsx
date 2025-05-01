'use client'

import { useState } from "react"
import { Logo } from "./components/logo"
import { AText, H1Text } from './components/texts';
import Input from "./components/inputs";
import { ButtonSend } from "./components/buttons";
import ContainerForm from "./components/containerForm";

export default function LoginComponent(){
    const [username,setUsername] = useState("")
    const [password,setPassword] = useState("")
    const [loading,setLoading] = useState(false)
    setLoading(false)
    const handleButton = async ()=>{

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