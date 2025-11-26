import React from "react"

const StatistikCard = ({ title, value, iconColor, Icon}) => {
    return (
        <>
                <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-all border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">{title}</p>
                            <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
                        </div>
                        <div className="bg-white border border-gray-300 p-3 rounded-full">
                        {Icon && <Icon size={22} className={iconColor} />}
                        </div>
                    </div>
                </div>
            </>
    )
}

export default StatistikCard