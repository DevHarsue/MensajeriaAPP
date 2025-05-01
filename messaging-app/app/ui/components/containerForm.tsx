import Loader from "./loader";

interface ContainerFormProps{
    children: React.ReactNode
    loading: boolean
}

export default function ContainerForm({ children, loading }: ContainerFormProps) {
    return (
        <div className="flex flex-col items-center justify-center w-full p-9" >
            {loading && (<Loader />)}
            <form className="w-full max-w-md p-8 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
                {children} 
            </form>
        </div>
    );
}