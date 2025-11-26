import { BrowserRouter, Routes,Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Users from "../pages/admin/Users";
import Rooms from "../pages/admin/Rooms";
import RoomDetail from "../pages/admin/RoomDetail";
import Tasks from "../pages/admin/Tasks";
import Attendances from "../pages/admin/Attendances";
import Profile from "../pages/Profile";
import Login from "../pages/login";
import Attendance from "../pages/Users/Attendance";



function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/dashboard" element={<HomePage />} />
                <Route path="/users" element={<Users />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/roomdetail/:id" element={<RoomDetail />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/attendances" element={<Attendances />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/profile" element={<Profile />} />


                {/* default ke login */}
                <Route path="/" element={<Login />} />
                <Route path="*" element={<Login />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;