import { Search } from "lucide-react";
import React, { useState } from "react";

const SearchBar = ({ placeholder = "Search...", onChange,value }) => {
    const [query, setQuery] = useState("");

    return (
        <div className="flex  w-full h-10  mx-auto bg-white-100 rounded-full shadow-lg overflow-hidden transition-all hover:shadow-xl">
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="flex-1 px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-300"
            />
            <button
                type="button"
                className="bg-gray-800 hover:bg-gray-900 transition-colors duration-300 h-auto w-10 flex items-center justify-center"
            >
                <Search size={18} className="text-white" />
            </button>
        </div>
    );
};

export default SearchBar;
