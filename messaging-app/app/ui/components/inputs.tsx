
interface InputProps{
    varValue: any
    setState: React.Dispatch<React.SetStateAction<any>>;
    type: "password" | "text"
    name: string
    label: string
    disabled: boolean
}

export default function Input({varValue, setState, type, name, label,disabled=false}:InputProps){
    return (
        <>
            <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-600 mb-2"
            >
                {label}
            </label>
            <input
                type={type}
                id={name}
                value={varValue}
                onChange={e=>setState(e.target.value)}
                placeholder={label}
                className="w-full px-4 py-3 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                disabled = {disabled}
            />
        </>
    )
}