import { useParams } from "react-router-dom";
import ChatBox from "../../components/chatbox";
import { jwtDecode } from "jwt-decode";

export default function PersonalChatPage() {
    const { otherUserId } = useParams();
    const token = localStorage.getItem("token");

    // Decode token
    const payload = jwtDecode(token);
    const currentUserId = Number(payload.id ?? payload.sub);

    const wsUrl = `ws://localhost:8000/ws/personal?token=${token}&with=${otherUserId}`;

    return (
        <div className="h-screen flex justify-center items-center bg-gray-100">
            <ChatBox
                wsUrl={wsUrl}
                currentUserId={currentUserId}   
                otherUserId={otherUserId}
                token={token}
            />
        </div>
    );
}
