import { useEffect, useRef, useState } from "react";
import API from "../api/API";

export default function FaceVerifyModal({userId,onSuccess,onClose}) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [loading,setLoading] = useState(false);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream => {videoRef.current.srcObject = stream;}))
    }, []);

    const verify = async() => {
        setLoading(true);

        navigator.geolocation.getCurrentPosition(async pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            const canvas = canvasRef.current;
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;

            canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

            const base64= canvas.toDataURL('image/jpeg');
            
            const res = await fetch (API + "attendance/face-verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId,
                    foto_base64: base64,
                    lat,
                    lng
                }),
            });

            setLoading(false);

            if (res.ok) {
                onSuccess();
            } else {
                alert("Verifikasi wajah gagal. Silakan coba lagi.");
            }
        })
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50">

                <div className="bg-white p-6 rounded-xl text-center w-[350px]">
                    <h3 className="font-bold text-lg mb-3">
                        Verifikasi Wajah
                    </h3>

                    <video
                        ref={videoRef}
                        autoPlay
                        className="rounded-xl mb-3"
                        width="300"
                        height="220"
                    />

                    <canvas ref={canvasRef} hidden />

                    <div className="flex gap-3">
                        <button
                            className="flex-1 bg-gray-300 py-2 rounded"
                            onClick={onClose}
                        >
                            Batal
                        </button>

                        <button
                            disabled={loading}
                            onClick={verify}
                            className="flex-1 bg-green-600 text-white py-2 rounded"
                        >
                            {loading ? "Verifying..." : "Scan"}
                        </button>
                    </div>

                </div>
            </div>

        </>
    )
}