import { FilterIcon } from "lucide-react";
import React from "react";

const FilterBar = ({ filters = [], onChange, onReset }) => {
    return (
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg shadow-md mb-4 h-auto">
            {filters.map((filter) => (
                <div key={filter.name} className="flex flex-col">
                    <label className="text-xs text-gray-500">{filter.label}</label>

                    {filter.type === "select" ? (
                        <select
                            name={filter.name}
                            value={filter.value}
                            onChange={onChange}
                            className="border border-gray-300 rounded-md px-2 py-1 text-xs text-gray-700"
                        >
                            <option value="">Semua</option>
                            {filter.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type={filter.type}
                            name={filter.name}
                            value={filter.value}
                            onChange={onChange}
                            className="border border-gray-300 rounded-md px-2 py-1 text-xs text-gray-700"
                            placeholder={filter.placeholder}
                        />
                    )}
                </div>
            ))}

            <button
                onClick={onReset}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-xs hover:bg-gray-300 transition"
            >
                <FilterIcon size={18} />
            </button>
        </div>
    );
};

export default FilterBar;
