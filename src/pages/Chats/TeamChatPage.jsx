import React from "react";
import ChatBox from "../../components/chatbox";

export default function TeamChatPage({ currentUserId, taskId }) {
    const token = localStorage.getItem("token");
    const wsUrl = `ws://localhost:8000/ws/team?token=${token}&task_id=${taskId}`;

    return (
        <div className="h-screen flex justify-center items-center bg-gray-100">
            <ChatBox wsUrl={wsUrl} currentUserId={currentUserId} />
        </div>
    );
}
