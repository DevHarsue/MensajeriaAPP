import { HashLoader } from "react-spinners"

export default function Loader() { 
    return (
        <div className="fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-black/50 " >
            <HashLoader color="rgb(255, 128, 77)" size={150}/>
        </div>
    )
};