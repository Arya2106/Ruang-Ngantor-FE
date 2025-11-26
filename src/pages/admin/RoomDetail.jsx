// src/pages/admin/RoomDetail.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import { useParams } from "react-router-dom";
import axios from "axios";
import API from "../../api/API";
import Card from "../../components/card";
import { ActivityIcon, Clipboard } from "lucide-react";
import Modal from "../../components/modal";
import { Link } from "react-router-dom";

const RoomDetail = () => {

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
    const [task_assignments,setTask_assignments] = useState([]);
    const [formatTaskAssignment, setFormatTaskAssignment] = useState({
        user_id: "",
        room_id: id,
        task_id: "",
    })

    const fetchRoom = async () => {
        try {
            const response = await axios.get(API + "rooms");
            const selectedRoom = response.data.find(
                (room) => room.id === parseInt(id)
            );
            setRoom(selectedRoom || {});
        } catch (error) {
            console.log(error);
        }
    };



    const fetchUsers = async () => {
        try {
            const response = await axios.get(API + "users");
            SetUsers(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await axios.get(API + "room_membership");
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

    function handleSubmit(e) {
        e.preventDefault();

        axios
            .post(API + "room_membership", {
                user_id: parseInt(formatDataMember.user_id),
                room_id: parseInt(formatDataMember.room_id),
                role_in_room: formatDataMember.role_in_room,
                
            })
            
            .then((response) => {
                console.log({
                    user_id: parseInt(formatDataMember.user_id),
                    room_id: parseInt(formatDataMember.room_id),
                    role_in_room: formatDataMember.role_in_room,
                });

                console.log("✅ Berhasil tambah anggota:", response.data);
                fetchMembers();
                setIsOpen(false);
            })
            .catch((error) => {
                console.log({
                    user_id: parseInt(formatDataMember.user_id),
                    room_id: parseInt(formatDataMember.room_id),
                    role_in_room: formatDataMember.role_in_room,
                });

                console.log("❌ Gagal tambah anggota:", error.response?.data || error);
            });
    }

    function handleSubmitTaskAssignment(e) {
        e.preventDefault();

        axios
            .post(API + "task_assignment", {
                user_id: parseInt(formatTaskAssignment.user_id),
                room_id: parseInt(formatTaskAssignment.room_id),
                task_id: parseInt(formatTaskAssignment.task_id),
            })
            .then((response) => {
                console.log({
                    user_id: parseInt(formatTaskAssignment.user_id),
                    room_id: parseInt(formatTaskAssignment.room_id),
                    task_id: parseInt(formatTaskAssignment.task_id),
                });

                console.log("✅ Berhasil tambah anggota:", response.data);
                fetchTasks();
                fetchTasks_assignment();
                setIsOpen2(false);
            })
            .catch((error) => {
                console.log({
                    user_id: parseInt(formatTaskAssignment.user_id),
                    room_id: parseInt(formatTaskAssignment.room_id),
                    task_id: parseInt(formatTaskAssignment.task_id),
                });

                console.log("❌ Gagal tambah anggota:", error.response?.data || error);
            });
            
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
                            <Link to={'/rooms'}>  Rooms</Link>  /<span> {room?.name || "Nama Ruangan"}</span>
                            </h1>
                      
                        <h1 className="text-2xl font-bold mb-6">
                           
                        </h1>
                </div>
              

                {/* ===== ANGGOTA ===== */}
                <div className=" mb-4 flex justify-between">
                    <span className="text-2xl font-bold">Daftar Anggota</span>
                    <button onClick={() => setIsOpen(true)} className="bg-gray-800 hover:bg-gray-900 transition-colors duration-300 h-auto w-40 flex items-center justify-center rounded-full ml-2 text-white" >Tambah Anggota</button>
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
                        <button
                            onClick={() => setIsOpen2(true)}
                            className="bg-gray-800 hover:bg-gray-900 transition-colors duration-300 h-auto w-40 flex items-center justify-center rounded-full ml-2 text-white"
                        >
                            Add Task
                        </button>
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

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Tambah Anggota">
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* PILIH ANGGOTA */}
                    <div>
                        <label
                            htmlFor="anggota"
                            className="block text-sm font-medium text-white mb-1"
                        >
                            Pilih Anggota
                        </label>
                        <select
                            id="user_id"
                            name="user_id"
                            value={formatDataMember.user_id}
                            onChange={(e) => setFormatDataMember({ ...formatDataMember, user_id: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-black"
                        >
                            <option value="">Pilih Anggota</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.fullname}
                                </option>
                            ))}
                        </select>   
                    </div>

                    {/* PILIH ROOM */}
                    <div>
                        <label
                            htmlFor="room"
                            className="block text-sm font-medium text-white mb-1"
                        >
                            Pilih Room
                        </label>
                        <select
                            id="room"
                            name="room"
                            value={formatDataMember.room_id}
                            onChange={(e) => setFormatDataMember({ ...formatDataMember, room_id: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-black" disabled
                        >
                            <option value={room.id}>{room.name}</option>
                        </select>
                    </div>

                    <input type="text" name="role_in_room" value={formatDataMember.role_in_room} readOnly={true}  hidden />

                    {/* TOMBOL AKSI */}
                    <div className="flex justify-end space-x-3 pt-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={isOpen2} onClose={() => setIsOpen2(false)} title="Tambah Task">
                    <form className="space-y-5" onSubmit={handleSubmitTaskAssignment}>
                        {/* PILIH TASK */}
                    <div>
                        <label
                            htmlFor="task"
                            className="block text-sm font-medium text-white mb-1"
                        >
                            Pilih Task
                        </label>
                        <select
                            id="member"
                            name="member"
                            value={formatTaskAssignment.user_id}
                            onChange={(e) => setFormatTaskAssignment({ ...formatTaskAssignment, user_id: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-black"
                        >
                            <option value="">Pilih Member</option>
                            {members.map((member) => (
                                <option key={member.user.id} value={member.user.id} className="text-black">
                                    {member.user.fullname}
                                </option>
                            ))}
                        </select>
                    </div>
                        <div>
                            <label
                                htmlFor="task"
                                className="block text-sm font-medium text-white mb-1"
                            >
                                Pilih Task
                            </label>
                            <select
                                id="task"
                                name="task"
                                value={formatTaskAssignment.task_id}
                                onChange={(e) => setFormatTaskAssignment({ ...formatTaskAssignment, task_id: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-black"
                            >
                                <option value="">Pilih Task</option>
                                {tasks.map((task) => (
                                    <option key={task.id} value={task.id}>
                                        {task.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end space-x-3 p-3">
                                <button className="bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 text-gray-600 transition" onClick={(e) => setIsOpen2(false)}>
                                     Batal
                                </button>
                                <button type="submit">
                                    Simpan
                                </button>
                        </div>

                    </form>
            </Modal>

        </>
    );
};

export default RoomDetail;
