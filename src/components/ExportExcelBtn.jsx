import react from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ExportExcelBtn = ({ data,filename = "data.xlsx" }) => {
    const exportToExcel = () => {
        if (!data || data.length === 0) {
            alert("Tidak ada data untuk diekspor.");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        const excelbuffer = XLSX.write(workbook, {bookType: "xlsx", type: "array"});
        const blob = new Blob ([excelbuffer], {type: "application/octet-stream"});
        saveAs(blob, filename);
    }
  return (
    <button
      onClick={exportToExcel}
      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
    >
      Export to Excel
    </button>
  );
};

export default ExportExcelBtn;