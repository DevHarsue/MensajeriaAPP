'use client';

import { useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/UserContext';

export default function Auth({children}: {children: React.ReactNode;}) {

    const router = useRouter();
    const {setUser} = useUser()

    useEffect(() => {

        const validateToken = async () => {
            const response = await fetch("api/validateToken")
            if (response.ok){
                const data = await response.json()
                setUser(data)
                return
            }

            await fetch("api/logout",{method:"POST"})
            router.push("/")

        };

        validateToken();
    }, [router]);

    return <>{children}</>
}