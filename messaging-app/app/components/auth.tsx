'use client';

import { useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { VARS } from '../utils/env';
import { useUser } from '@/providers/UserContext';
import { getCookie } from 'cookies-next';

export default function Auth({children}: {children: React.ReactNode;}) {

    const router = useRouter();
    const {setUser} = useUser()
    const token = getCookie("access_token")

    useEffect(() => {
        if (!token) return;

        const validateToken = async () => {
            await fetch(VARS.API_URL+'users/validate_token', {
                credentials: "include"
            }).then(async res=>{
                if (!res.ok) throw new Error('Token inválido');
                const data = await res.json()
                setUser(data)
            }).catch(err=>{
                console.log(err)
                router.push('/')
            });
                
        };

        validateToken();
    }, [router,token]);

    return <>{children}</>
}