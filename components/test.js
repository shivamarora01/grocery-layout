export default function Test() {
    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-6 w-full pl-5 gap-5 justify-center">
                {[...Array(16)].map((_, index) => (
                    <div key={index} className="bg-slate-200 h-48 w-40 rounded-lg"></div>
                ))}
            </div>



        </>
    )
}