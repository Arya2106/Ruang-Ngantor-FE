import React from "react";
import { BarChart3, Users, ShoppingBag, Activity, Bell } from "lucide-react";

const Table = ({columns = [],data = []}) => {
    return (
        <>
            <table className="w-full text-left">
                <thead>
                    <tr className="text-gray-500 text-sm border-b">
                        {columns.map((col, i) => (
                            <th key={i} className="py-3">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                  {data.length > 0 ? (
                    data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b hover:bg-gray-50">
                        {Object.values(row).map((value,j) => (
                          <td key={j} className="py-4">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="py-4 text-center">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
            </table>
        </>
    );
}

export default Table;
