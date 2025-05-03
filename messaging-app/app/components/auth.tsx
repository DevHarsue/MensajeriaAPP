'use client';

import { useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { getCookie,deleteCookie } from 'cookies-next';
import { VARS } from '../utils/env';
import { useUser } from '@/providers/UserContext';

export default function Auth({children}: {children: React.ReactNode;}) {

    const router = useRouter();
    const {setUser} = useUser()

    useEffect(() => {
        const validateToken = async () => {
            const token = await getCookie('token');
            if (!token) return;

            await fetch(VARS.API_URL+'users/validate_token', {
                headers: { Authorization: `Bearer ${token}` },
                
            }).then(async res=>{
                if (!res.ok) throw new Error('Token inválido');
                const data = await res.json()
                setUser(data)
            }).catch(err=>{
                console.log(err)
                deleteCookie("token")
                router.push('/')
            });
                
        };

        validateToken();
    }, [router]);

    return <>{children}</>
}