import React from "react";
import ChatBox from "../../components/chatbox";

export default function RoomChatPage({ currentUserId, roomId }) {
    const token = localStorage.getItem("token");
    const wsUrl = `ws://localhost:8000/ws/room?token=${token}&room_id=${roomId}`;

    return (
        <div className="h-screen flex justify-center items-center bg-gray-100">
            <ChatBox wsUrl={wsUrl} currentUserId={currentUserId} />
        </div>
    );
}
