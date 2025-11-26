import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../components/sidebar";
import { Html5Qrcode } from "html5-qrcode";

const Attendance = () => {
    const html5QrCode = useRef(null);
    const isScanning = useRef(false);

    const [scannedData, setScannedData] = useState(null);
    const [employeeData, setEmployeeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const qrRegionId = "qr-reader";
        let scanner = null;

        const startScanner = async () => {
            if (isScanning.current) return;

            try {
                scanner = new Html5Qrcode(qrRegionId);

                await scanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 300, height: 300 },
                        aspectRatio: 1.0,
                    },
                    async (decodedText) => {
                        // Stop scanner setelah berhasil scan
                        if (scanner && isScanning.current) {
                            isScanning.current = false;
                            await scanner.stop();
                        }

                        console.log("QR Code Raw:", decodedText);

                        try {
                            // Parse JSON dari QR code
                            const parsedData = JSON.parse(decodedText);
                            console.log("Parsed Data:", parsedData);

                            setScannedData(parsedData);
                            await fetchEmployeeData(parsedData);
                        } catch (error) {
                            console.error("Invalid QR format:", error);
                            setMessage("❌ Format QR Code tidak valid");
                        }
                    },
                    (err) => {
                        // Ignore scan errors yang terlalu banyak
                    }
                );

                isScanning.current = true;
                html5QrCode.current = scanner;
            } catch (err) {
                console.error("Gagal memulai scanner:", err);
                isScanning.current = false;
            }
        };

        // Fetch data karyawan berdasarkan ID dari QR
        const fetchEmployeeData = async (data) => {
            setLoading(true);
            try {
                // Gunakan ID dari parsed JSON
                const res = await fetch(`http://localhost:8000/attendance/employee/${data.id}`);
                const result = await res.json();

                if (res.ok) {
                    // Gabungkan data dari QR dengan data dari API (jika ada)
                    setEmployeeData({
                        id: data.id,
                        username: data.username,
                        role: data.role,
                        ...result // merge dengan data tambahan dari backend
                    });
                } else {
                    // Kalau API gagal, tetap tampilkan data dari QR
                    setEmployeeData({
                        id: data.id,
                        username: data.username,
                        role: data.role
                    });
                }
            } catch (error) {
                console.error("Error:", error);
                // Fallback: tampilkan data dari QR saja
                setEmployeeData({
                    id: data.id,
                    username: data.username,
                    role: data.role
                });
            } finally {
                setLoading(false);
            }
        };

        startScanner();

        return () => {
            if (scanner && isScanning.current) {
                scanner.stop()
                    .then(() => {
                        isScanning.current = false;
                        scanner.clear();
                    })
                    .catch((err) => console.error("Stop error:", err));
            }
        };
    }, []);

    // Handle submit absensi
    const handleAttendance = async () => {
        if (!scannedData) return;

        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("http://localhost:8000/attendance/scan_qr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scannedData), // Kirim object JSON
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("✅ Absensi berhasil dicatat!");

                // Reset setelah 2 detik
                setTimeout(() => {
                    resetScanner();
                }, 2000);
            } else {
                setMessage(`❌ ${data.message || "Absensi gagal"}`);
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("❌ Gagal mengirim absensi");
        } finally {
            setLoading(false);
        }
    };

    // Reset scanner untuk scan ulang
    const resetScanner = () => {
        setScannedData(null);
        setEmployeeData(null);
        setMessage("");
        window.location.reload(); // Reload untuk restart scanner
    };

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 p-4 flex flex-col bg-gray-100">
                <h1 className="text-2xl font-bold p-4">Absensi</h1>

                <div className="flex gap-6 p-4">
                    {/* Scanner */}
                    <div className="flex flex-col">
                        <div
                            id="qr-reader"
                            style={{
                                width: "350px",
                                display: scannedData ? "none" : "block"
                            }}
                        />

                        {scannedData && (
                            <button
                                onClick={resetScanner}
                                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Scan Ulang
                            </button>
                        )}
                    </div>

                    {/* Data Karyawan */}
                    {scannedData && (
                        <div className="flex-1 bg-white p-6 rounded-lg shadow-md max-w-md">
                            <h2 className="text-xl font-semibold mb-4">Data Karyawan</h2>

                            {loading && <p className="text-gray-500">Loading...</p>}

                            {employeeData && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm text-gray-600">ID</label>
                                        <p className="font-medium">{employeeData.id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Username</label>
                                        <p className="font-medium">{employeeData.username}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Role</label>
                                        <p className="font-medium capitalize">{employeeData.role}</p>
                                    </div>

                                    {/* Field tambahan dari backend (jika ada) */}
                                    {employeeData.position && (
                                        <div>
                                            <label className="text-sm text-gray-600">Jabatan</label>
                                            <p className="font-medium">{employeeData.position}</p>
                                        </div>
                                    )}
                                    {employeeData.department && (
                                        <div>
                                            <label className="text-sm text-gray-600">Departemen</label>
                                            <p className="font-medium">{employeeData.department}</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleAttendance}
                                        disabled={loading}
                                        className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Memproses..." : "Konfirmasi Absensi"}
                                    </button>
                                </div>
                            )}

                            {message && (
                                <div className={`mt-4 p-4 rounded ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {message}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Attendance;