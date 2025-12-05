import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./sidebar";
import EmojiPicker from 'emoji-picker-react';
import API from "../api/API";
import { Check, CheckCheck } from "lucide-react";

export default function ChatBox({ wsUrl, currentUserId, token, otherUserId }) {
    const [messages, setMessages] = useState([]);
    const [showEmoji, setShowEmoji] = useState(false);
    const [input, setInput] = useState("");
    const ws = useRef(null);
    const scrollRef = useRef(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const hasMarkedAsRead = useRef(false);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(scrollToBottom, [messages]);

    // Fetch user profile info
    useEffect(() => {
        if (!otherUserId || !token) return;

        const fetchUser = async () => {
            try {
                const res = await fetch(API + `users/${otherUserId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                console.log("🆔 otherUserId:", otherUserId);
                console.log("📦 Fetch user result:", data);
                setSelectedUser(data);
            } catch (err) {
                console.error("❌ Error fetching user:", err);
            }
        };

        fetchUser();
    }, [otherUserId, token]);

    // Mark messages as read ketika user melihat chat
    useEffect(() => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
        if (hasMarkedAsRead.current) return;

        // Cek apakah ada pesan dari lawan bicara yang belum dibaca
        const unreadMessages = messages.filter(
            msg => Number(msg.sender_id) === Number(otherUserId) && !msg.is_read
        );

        if (unreadMessages.length > 0) {
            console.log("📨 Marking messages as read");
            ws.current.send(JSON.stringify({ type: "mark_read" }));
            hasMarkedAsRead.current = true;
        }
    }, [messages, otherUserId]);

    useEffect(() => {
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log("✅ Connected to chat server");
            hasMarkedAsRead.current = false; // Reset saat reconnect
        };

        ws.current.onmessage = (ev) => {
            const data = JSON.parse(ev.data);

            // History dari server (saat pertama connect atau refresh)
            if (data.type === "history") {
                console.log("📜 Received history:", data.messages);
                setMessages(data.messages);
                hasMarkedAsRead.current = false; // Allow marking as read untuk history baru
            }

            // Message baru masuk
            if (data.type === "message") {
                console.log("📩 New message:", data.message);
                setMessages((prev) => [...prev, data.message]);
                hasMarkedAsRead.current = false; // Reset agar bisa mark as read message baru
            }

            // Read receipt update
            if (data.type === "read") {
                console.log("✅ Read receipt received");
                setMessages(prev =>
                    prev.map(msg => {
                        // Update hanya pesan yang dikirim oleh currentUser ke otherUser
                        if (Number(msg.sender_id) === Number(currentUserId) &&
                            Number(msg.receiver_id) === Number(otherUserId)) {
                            return { ...msg, is_read: true };
                        }
                        return msg;
                    })
                );
            }
        };

        ws.current.onclose = () => {
            console.log("🔌 Disconnected");
            hasMarkedAsRead.current = false;
        };

        return () => {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
        };
    }, [wsUrl, currentUserId, otherUserId]);

    const sendMessage = (text = input) => {
        if (!text.trim()) return;

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(
                JSON.stringify({
                    type: "message",
                    message: text
                })
            );
            setInput("");
        } else {
            console.warn("⚠️ WebSocket belum siap / sudah tertutup");
        }
    };

    // Helper function untuk initial dari nama
    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Helper untuk warna background random berdasarkan nama
    const getColorFromName = (name) => {
        if (!name) return "bg-gray-400";
        const colors = [
            "bg-blue-500",
            "bg-green-500",
            "bg-purple-500",
            "bg-pink-500",
            "bg-indigo-500",
            "bg-red-500",
            "bg-yellow-500",
            "bg-teal-500"
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <>
            <div className="flex h-screen w-screen bg-gray-100">
                {/* Sidebar */}
                <Sidebar />

                {/* Chat Area */}
                <div className="flex flex-col flex-1 w-full bg-white border-l">
                    {/* Header dengan Profile */}
                    <div className="flex items-center gap-3 p-4 border-b bg-white shadow-sm">
                        {/* Profile Picture */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${getColorFromName(selectedUser?.name || selectedUser?.username)}`}>
                            {selectedUser?.foto ? (
                                <img
                                    src={selectedUser.foto}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                getInitials(selectedUser?.name || selectedUser?.username || "User")
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold text-gray-800">
                                {selectedUser?.name || selectedUser?.username || "Loading..."}
                            </h1>
                            {selectedUser?.status && (
                                <p className="text-sm text-gray-500">{selectedUser.status}</p>
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3"
                    >
                        {messages.map((msg) => {
                            const senderId = Number(msg.sender_id ?? msg.user_id);
                            const myId = Number(currentUserId);
                            const isMine = senderId === myId;

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}
                                >
                                    {/* Profile picture untuk pesan orang lain */}
                                    {!isMine && (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${getColorFromName(selectedUser?.name || selectedUser?.username)}`}>
                                            {selectedUser?.profile_picture ? (
                                                <img
                                                    src={selectedUser.profile_picture}
                                                    alt={selectedUser.name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                getInitials(selectedUser?.name || selectedUser?.username || "U")
                                            )}
                                        </div>
                                    )}

                                    <div
                                        className={`px-4 py-2 rounded-lg max-w-[60%] break-words shadow-sm ${isMine
                                                ? "bg-blue-500 text-white rounded-br-none"
                                                : "bg-white text-gray-800 rounded-bl-none border"
                                            }`}
                                    >
                                        <div>{msg.message}</div>

                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <small
                                                className={`text-xs ${isMine ? "text-blue-100" : "text-gray-500"
                                                    }`}
                                            >
                                                {msg.created_at
                                                    ? new Date(msg.created_at).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })
                                                    : "??:??"}
                                            </small>

                                            {/* ✅ READ RECEIPT ICON - Hanya untuk pesan sendiri */}
                                            {isMine && (
                                                msg.is_read ? (
                                                    <CheckCheck
                                                        size={16}
                                                        className="text-blue-300"
                                                        title="Dibaca"
                                                    />
                                                ) : (
                                                    <Check
                                                        size={16}
                                                        className="text-blue-200"
                                                        title="Terkirim"
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Input */}
                    <div className="relative p-4 flex items-center border-t bg-white gap-2">
                        <button
                            className="p-2 hover:bg-gray-100 rounded-full transition"
                            onClick={() => setShowEmoji(!showEmoji)}
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

                        {showEmoji && (
                            <div className="absolute bottom-20 left-4 z-50">
                                <EmojiPicker
                                    onEmojiClick={(emojiData) => {
                                        setInput((prev) => prev + emojiData.emoji);
                                        setShowEmoji(false);
                                    }}
                                    theme="light"
                                    width={300}
                                    height={400}
                                />
                            </div>
                        )}

                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type a message..."
                            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                        />

                        <button
                            onClick={() => sendMessage(input)}
                            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}