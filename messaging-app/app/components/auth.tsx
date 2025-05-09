'use client';

import { useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { VARS } from '../utils/env';
import { useUser } from '@/providers/UserContext';

export default function Auth({children}: {children: React.ReactNode;}) {

    const router = useRouter();
    const {setUser} = useUser()

    useEffect(() => {
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
    }, [router]);

    return <>{children}</>
}