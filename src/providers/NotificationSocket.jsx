import { createContext, useEffect, useRef } from "react";
import { toast } from "react-toastify";

export const NotificationSocketContext = createContext();

export const NotificationSocketProvider = ({ children }) => {
    const ws = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        ws.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/notifications?token=${token}`
        );

        ws.current.onopen = () => {
            console.log("🔔 NOTIF SOCKET CONNECTED");
        };

        ws.current.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.type !== "message") return;

            const senderId = data.message.sender_id;
            const senderName =
                data.message.sender?.fullname || "Pesan Baru";

            // ✅ CEK APAKAH USER LAGI BUKA CHAT YANG SAMA
            const currentPath = window.location.pathname;
            const currentChatPath = `chat/personal/${senderId}`;

            if (currentPath === currentChatPath) {
                console.log("🔕 SKIP NOTIF (sedang buka chat)");
                return;
            }

            // ✅ BARU TOAST
            toast.info(
                <>
                    <b>{senderName}</b>
                    <p className="text-sm">
                        {data.message.message.slice(0, 70)}
                    </p>
                </>,
                {
                    autoClose: 4000,
                    onClick: () => {
                        window.location.href = `chat/personal/${senderId}`;
                    },
                }
            );
        };

        ws.current.onerror = (e) => {
            console.error("❌ NOTIF WS ERROR", e);
        };

        return () => ws.current?.close();
    }, []);

    return (
        <NotificationSocketContext.Provider value={true}>
            {children}
        </NotificationSocketContext.Provider>
    );
};
