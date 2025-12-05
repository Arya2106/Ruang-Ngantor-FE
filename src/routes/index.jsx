import { BrowserRouter, Routes,Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Users from "../pages/admin/Users";
import Rooms from "../pages/admin/Rooms";
import RoomDetail from "../pages/admin/RoomDetail";
import Tasks from "../pages/admin/Tasks";
import Attendances from "../pages/admin/Attendances";
import Profile from "../pages/Profile";
import Login from "../pages/Login";
import Attendance from "../pages/Users/Attendance";
import PersonalChatPage from "../pages/Chats/PersonalChatPage";
import Chats from "../pages/Chat";
import MyRooms from "../pages/Users/MyRooms";
import MyAttendance from "../pages/Users/MyAttendance";
import MyRoomDetail from "../pages/Users/MyRoomDetail";



function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/dashboard" element={<HomePage />} />
                <Route path="/users" element={<Users />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/roomdetail/:id" element={<RoomDetail />} />
                <Route path="/myroomdetail/:id" element={<MyRoomDetail />} />
                <Route path="/myattendance" element={<MyAttendance />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/attendances" element={<Attendances />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/chats" element={<Chats />} />
                <Route path="/chat/personal/:otherUserId" element={<PersonalChatPage />} />
                <Route path="/myrooms" element={<MyRooms />} />
                
                

                {/* default ke login */}
                <Route path="/" element={<Login />} />
                <Route path="*" element={<Login />} />
                
            </Routes>
        </BrowserRouter>
    );
}

export default App;