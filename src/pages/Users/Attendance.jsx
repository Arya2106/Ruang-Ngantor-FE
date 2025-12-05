import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../components/sidebar";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CheckCircle, XCircle, RefreshCw, User, Briefcase, Building2, QrCode } from "lucide-react";

const Attendance = () => {
    const html5QrCode = useRef(null);
    const isScanning = useRef(false);

    const [scannedData, setScannedData] = useState(null);
    const [employeeData, setEmployeeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [scannerStarted, setScannerStarted] = useState(false);

    const startScanner = async () => {
        if (isScanning.current) return;

        // Set state dulu agar element qr-reader muncul di DOM
        setScannerStarted(true);

        // Tunggu sebentar agar element sudah ada di DOM
        setTimeout(async () => {
            const qrRegionId = "qr-reader";
            let scanner = null;

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
                setScannerStarted(false);
            }
        }, 100); // Delay 100ms untuk memastikan DOM sudah render
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

    useEffect(() => {
        return () => {
            if (html5QrCode.current && isScanning.current) {
                html5QrCode.current.stop()
                    .then(() => {
                        isScanning.current = false;
                        html5QrCode.current.clear();
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
        setScannerStarted(false);
        window.location.reload(); // Reload untuk restart scanner
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Sidebar />

            <div className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistem Absensi</h1>
                        <p className="text-gray-600">Scan QR code untuk mencatat kehadiran</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Scanner Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <QrCode className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">QR Scanner</h2>
                            </div>

                            <div className="space-y-4">
                                {!scannerStarted && !scannedData && (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                                            <Camera className="w-16 h-16 text-white" />
                                        </div>
                                        <p className="text-gray-600 mb-6 text-center">Klik tombol di bawah untuk memulai scanning</p>
                                        <button
                                            onClick={startScanner}
                                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                        >
                                            <Camera className="w-5 h-5" />
                                            Mulai Scan QR
                                        </button>
                                    </div>
                                )}

                                {scannerStarted && !scannedData && (
                                    <div
                                        id="qr-reader"
                                        className="w-full rounded-xl overflow-hidden"
                                    />
                                )}

                                {scannedData && (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-10 h-10 text-green-600" />
                                        </div>
                                        <p className="text-gray-700 font-medium mb-6">QR Code berhasil di-scan!</p>
                                        <button
                                            onClick={resetScanner}
                                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Scan Ulang
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Employee Data Section */}
                        {scannedData && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <User className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-800">Data Karyawan</h2>
                                </div>

                                {loading && (
                                    <div className="flex items-center justify-center py-12">
                                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                                    </div>
                                )}

                                {!loading && employeeData && (
                                    <div className="space-y-6">
                                        {/* Profile Card */}
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                                    {employeeData.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-800">{employeeData.username}</h3>
                                                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded-full mt-1 capitalize">
                                                        {employeeData.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info Cards */}
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <User className="w-5 h-5 text-gray-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">ID Karyawan</label>
                                                    <p className="text-gray-800 font-semibold">{employeeData.id}</p>
                                                </div>
                                            </div>

                                            {employeeData.position && (
                                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <Briefcase className="w-5 h-5 text-gray-600 mt-0.5" />
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Jabatan</label>
                                                        <p className="text-gray-800 font-semibold">{employeeData.position}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {employeeData.department && (
                                                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <Building2 className="w-5 h-5 text-gray-600 mt-0.5" />
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Departemen</label>
                                                        <p className="text-gray-800 font-semibold">{employeeData.department}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            onClick={handleAttendance}
                                            disabled={loading}
                                            className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                    Memproses...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-5 h-5" />
                                                    Konfirmasi Absensi
                                                </>
                                            )}
                                        </button>

                                        {/* Message */}
                                        {message && (
                                            <div className={`p-4 rounded-xl flex items-center gap-3 ${message.includes("✅")
                                                    ? "bg-green-50 text-green-700 border border-green-200"
                                                    : "bg-red-50 text-red-700 border border-red-200"
                                                }`}>
                                                {message.includes("✅") ? (
                                                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 flex-shrink-0" />
                                                )}
                                                <span className="font-medium">{message}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;