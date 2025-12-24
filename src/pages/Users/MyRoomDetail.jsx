// src/pages/admin/MyRoomDetail.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import { useParams } from "react-router-dom";
import axios from "axios";
import API from "../../api/API";
import Card from "../../components/card";
import { ActivityIcon, Clipboard } from "lucide-react";
import Modal from "../../components/modal";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const MyRoomDetail = () => {

    const { id } = useParams();
    const [users, SetUsers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [room, setRoom] = useState({});
    const [formatDataMember, setFormatDataMember] = useState(
        {
            user_id: "",
            room_id: id,
            role_in_room: "member",
        }
    );
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [task_assignments, setTask_assignments] = useState([]);
    const [formatTaskAssignment, setFormatTaskAssignment] = useState({
        user_id: "",
        room_id: id,
        task_id: "",
    })

    const fetchRoom = async () => {
        try {
            const response = await axios.get(API + "rooms", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const selectedRoom = response.data.find(
                (room) => room.id === parseInt(id)
            );
            setRoom(selectedRoom || {});
        } catch (error) {
            if (error.response?.status === 401 ){
                localStorage.removeItem("token");
                console.log("Token expired atau tidak valid. Silakan login kembali.");
                navigate("/login", { replace: true });
            } else {
            console.log(error);
            toast.error("Gagal mengambil data room");
            }
        }
    };



    const fetchUsers = async () => {
        try {
            const response = await axios.get(API + "users", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            SetUsers(response.data);
        } catch (error) {
            if (error.response?.status === 401 ){
                localStorage.removeItem("token");
                console.log("Token expired atau tidak valid. Silakan login kembali.");
                navigate("/login", { replace: true });
            } else {
            console.log(error);
            toast.error("Gagal mengambil data users");
            }
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await axios.get(API + "room_membership",
                { headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }, }
            );
            const data = response.data || [];
            const filteredMembers = data.filter(
                (member) => member.room && member.room.id === parseInt(id)
            );
            setMembers(filteredMembers);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchTasks = async () => {
        try {
            // ambil semua task dan task_assignment secara bersamaan
            const [tasksRes, assignedRes] = await Promise.all([
                axios.get(API + "tasks"),
                axios.get(API + "task_assignments"),
            ]);

            // ambil semua ID task yang sudah di-assign
            const assignedIds = assignedRes.data.map((a) => a.task_id);

            // filter agar hanya task yang belum ada di assignment yang ditampilkan
            const unassignedTasks = tasksRes.data.filter(
                (task) => !assignedIds.includes(task.id) && task.status !== "done"
            );

            // simpan ke state
            setTasks(unassignedTasks);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const fetchTasks_assignment = async () => {
        try {
            const response = await axios.get(API + "task_assignments");

            // ✅ Step 1: Ambil task_id yang ada di room ini
            const tasksInThisRoom = response.data
                .filter(a => a.room && a.room.id === parseInt(id))
                .map(a => a.task?.id)
                .filter(Boolean);

            // ✅ Step 2: Ambil SEMUA orang yang mengerjakan task tersebut
            const allAssignmentsForTheseTasks = response.data.filter(
                a => a.task?.id && tasksInThisRoom.includes(a.task.id)
            );

            // ✅ Step 3: Group berdasarkan task
            const grouped = allAssignmentsForTheseTasks.reduce((acc, item) => {
                const taskId = item.task?.id;

                if (!taskId) return acc;

                if (!acc[taskId]) {
                    acc[taskId] = {
                        id: item.task.id,
                        title: item.task.title,
                        description: item.task.description,
                        status: item.task.status,
                        assignedUsers: []
                    };
                }

                // Tambahkan user (tanpa info room)
                const userName = item.user?.fullname || "Unknown";
                if (!acc[taskId].assignedUsers.includes(userName)) {
                    acc[taskId].assignedUsers.push(userName);
                }

                return acc;
            }, {});

            setTask_assignments(Object.values(grouped));
        } catch (error) {
            console.log("❌ Error fetching task assignments:", error);
            setTask_assignments([]);
        }
    }




    useEffect(() => {
        fetchTasks();
        fetchRoom();
        fetchUsers();
        fetchMembers();
        fetchTasks_assignment();
    }, [id]);

    return (
        <>
            <div className="flex h-screen bg-gray-50">
                <Sidebar />

                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="flex justify-start ">

                        <h1 className="text-2xl font-bold mb-6">
                            <Link to={'/myrooms'}>  Rooms</Link>  /<span> {room?.name || "Nama Ruangan"}</span>
                        </h1>

                        <h1 className="text-2xl font-bold mb-6">

                        </h1>
                    </div>


                    {/* ===== ANGGOTA ===== */}
                    <div className=" mb-4 flex justify-between">
                        <span className="text-2xl font-bold">Daftar Anggota</span>
                    </div>
                    {members.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                            {members.map((member) => (
                                <Card
                                    key={member.id}
                                    avatar="https://img.freepik.com/premium-photo/3d-character-avatar_113255-5300.jpg"
                                    name={member.user.username}
                                    fullname={member.user.fullname}
                                    role={member.role_in_room}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Belum ada anggota di ruangan ini.</p>
                    )}

                    {/* ===== TASK ===== */}
                    {/* ===== TASK ===== */}
                    <div className="mb-4 mt-9 flex justify-between">
                        <span className="text-2xl font-bold">Daftar Task</span>
                    
                    </div>

                    {task_assignments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {task_assignments.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col"
                                >
                                    <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full mb-4 mx-auto">
                                        <Clipboard className="text-white" size={24} />
                                    </div>

                                    <h2 className="text-lg font-semibold text-gray-800 text-center mb-2">
                                        {item.title}
                                    </h2>

                                    <p className="text-gray-600 text-sm text-center mb-3 flex-grow">
                                        {item.description}
                                    </p>

                                    <div className="flex justify-center mb-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === "done"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {item.status}
                                        </span>
                                    </div>

                                    <div className="pt-3 border-t border-gray-100">
                                        <p className="text-gray-500 text-xs font-medium mb-1">
                                            Dikerjakan oleh:
                                        </p>
                                        <p className="text-gray-700 text-sm">
                                            {item.assignedUsers.join(", ")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Belum ada task di ruangan ini.</p>
                    )}
                </div>
            </div>

        </>
    );
};

export default MyRoomDetail;
