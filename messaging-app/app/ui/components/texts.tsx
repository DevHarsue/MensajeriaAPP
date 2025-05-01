
interface H1Props{
    text: string
}

export const H1Text = ({text}:H1Props) => {
    return (
        <h1 className="text-2xl font-bold text-gray-200 mb-6 text-center">
            {text}
        </h1>
    )
}; 

interface AProps{
    text: string
    href: string
}
export const AText = ({text,href}:AProps) => { 
    return (
        <a 
            href={href} 
            className="text-center w-full block mt-4 text-gray-200 text-bold hover:text-orange-700 transition duration-200"
        >
            {text}
        </a>
    )
};

