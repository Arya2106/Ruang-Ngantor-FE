// src/components/CardProfile.jsx
import React from "react";

const Card = ({ avatar, name, role, fullname, stats, children }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-[280px] mx-auto">
            {/* Avatar */}
            <div className="flex flex-col items-center">
                <img
                    src={avatar}
                    alt={name}
                    className="w-full h-[232px] rounded-md object-cover"
                />
                <h2 className="mt-4 text-xl font-semibold text-gray-800">{name}</h2>
                <p className="text-gray-500 text-sm">{fullname}</p>
                {fullname && <p className="text-gray-400 text-sm mt-1 truncate">{role}</p>}
            </div>

            <div className="p-3">
                {children}
            </div>
           

            {/* Stats */}
            {stats && stats.length > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    {stats.map((item, idx) => (
                        <div key={idx}>
                            <p className="text-lg font-bold text-gray-800">{item.value}</p>
                            <p className="text-gray-400 text-sm">{item.label}</p>
                        </div>
                    ))}
                </div>
               
            )}
        </div>
    );
};

export default Card;
