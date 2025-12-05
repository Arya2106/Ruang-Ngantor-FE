import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import { UserContext } from "../components/UserContext";
import { formatDate } from "../components/formatDate";
import axios from "axios";
import API from "../api/API";
import Modal from "../components/modal";
import { toast, ToastContainer } from "react-toastify";
import { Pencil } from "lucide-react";

const Profile = () => {
    const { currentUser, refreshUser } = useContext(UserContext);
    const [myTasks, setMyTasks] = useState([]);
    const [myAttendance, setMyAttendance] = useState([]);
    const [isModalEdit, setIsModalEdit] = useState(false);
    const [isModalEditMyTask, setIsModalEditMyTask] = useState(false);
    const [formEdit, setFormEdit] = useState({
        id: "",
        fullname: "",
        username: "",
        gmail: "",
        password: "",
        Birthday: "",
    });
    const [formEditMyTask, setFormEditMyTask] = useState({
        id: "",
        status: "",
        description: "",
    });

    // Loading state jika user belum siap
    if (!currentUser) {
        return (
            <div className="flex items-center justify-center w-full h-screen">
                <div className="animate-bounce text-gray-600 text-xl font-semibold">
                    Loading...
                </div>
            </div>
        );
    }

    // ==================== HANDLER ====================
    const handleChange = (e) => {
        setFormEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleBtnEdit = () => {
        setFormEdit({
            fullname: currentUser.fullname,
            username: currentUser.username,
            gmail: currentUser.gmail,
            password: "",
            Birthday: currentUser.Birthday ? currentUser.Birthday.split("T")[0] : "",
        });
        setIsModalEdit(true);
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API}users/${currentUser.id}`, formEdit);
            setIsModalEdit(false);
            toast.success("User updated successfully");
            await refreshUser();
        } catch (error) {
            console.log(error);
        }
    };

    const handleBtnEditMyTask = (task) => {
        setFormEditMyTask({
            id: task.task.id,
            status: task.task.status,
            description: task.task.description,
        });
        setIsModalEditMyTask(true);
    };

    const handleSubmitEditMyTask = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API}task/${formEditMyTask.id}`, formEditMyTask);
            setIsModalEditMyTask(false);
            toast.success("Task updated successfully");
            await refreshUser();
        } catch (error) {
            console.log(error);
        }
    };

    // ==================== FETCH DATA ====================
    const fetchMyTasks = async () => {
        try {
            const res = await axios.get(`${API}task_assignments`);
            setMyTasks(res.data.filter(task => Number(task.user.id) === Number(currentUser.id)));
        } catch (error) {
            console.log(error);
        }
    };

    const fetchMyAttendances = async () => {
        try {
            const res = await axios.get(`${API}attendances`);
            setMyAttendance(res.data.filter(a => Number(a.user.id) === Number(currentUser.id)));
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchMyTasks();
            fetchMyAttendances();
        }
    }, [currentUser]);

    // ==================== STATISTIK ====================
    const getLamaKerja = (createdAt) => {
        const start = new Date(createdAt);
        const end = new Date();

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
            days += prevMonth;
            months--;
        }

        if (months < 0) {
            months += 12;
            years--;
        }

        let result = [];
        if (years > 0) result.push(`${years} tahun`);
        if (months > 0) result.push(`${months} bulan`);
        if (days > 0) result.push(`${days} hari`);

        return result.length > 0 ? result.join(" ") : "0 hari";
    };

    const getTotalHariKerja = (createdAt) => {
        const start = new Date(createdAt);
        const end = new Date();
        const diffTime = end - start;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const totalHariKerja = getTotalHariKerja(currentUser.created_at);
    const hitungBerdasarkanStatus = (status) => myAttendance.filter(a => a.status === status).length;

    const totalHadir = hitungBerdasarkanStatus("present");
    const totalTelat = hitungBerdasarkanStatus("late");
    const totalAlpa = hitungBerdasarkanStatus("absent");
    const persen = Math.round((totalHadir / totalHariKerja) * 100);
    const lamaKerja = getLamaKerja(currentUser.created_at);

    // ==================== RENDER ====================
    return (
        <>
            <ToastContainer />
            <div className="flex h-screen bg-gray-100">
                <Sidebar />

                {/* MOBILE & TABLET: Vertical Layout */}
                <div className="flex-1 lg:hidden p-6 overflow-y-auto">
                    <div className="space-y-6">
                        {/* 1. Profile Card - Mobile */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-black text-2xl font-bold shadow flex-shrink-0">
                                    <img className="w-full h-full rounded-full object-cover" src={currentUser.foto} alt="" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-gray-800">{currentUser.fullname}</p>
                                    <p className="text-gray-500 uppercase">{currentUser.role}</p>
                                </div>
                            </div>

                            <div className="space-y-2 text-gray-800">
                                <div>
                                    <p className="text-gray-500 text-sm">Username</p>
                                    <p className="font-medium">{currentUser.username}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Gmail</p>
                                    <p className="font-medium">{currentUser.gmail}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Tanggal Lahir</p>
                                    <p className="font-medium">{formatDate(currentUser.Birthday)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Bergabung Pada</p>
                                    <p className="font-medium">{formatDate(currentUser.created_at)}</p>
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <button className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition" onClick={handleBtnEdit}>
                                        Edit
                                    </button>
                                    <button className="w-full bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition">Logout</button>
                                </div>
                            </div>
                        </div>

                        {/* QR Code Card - Mobile & Tablet */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">QR Code</h2>
                            <div className="flex items-center justify-center">
                                <img
                                    src={currentUser.qr_token}
                                    alt="QR Code"
                                    className="w-40 h-40 md:w-48 md:h-48 border rounded-md"
                                />
                            </div>
                        </div>

                        {/* 2. Statistik Kehadiran */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Statistik Kehadiran</h2>
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-32 h-32 rounded-full border-4 border-blue-500 flex flex-col items-center justify-center">
                                    <p className="text-3xl font-bold text-blue-600">{persen}%</p>
                                    <p className="text-xs text-gray-500 -mt-1">Kehadiran</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <p className="text-gray-500">Total Hari Kerja</p>
                                    <p className="font-semibold">{lamaKerja}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-gray-500">Hadir</p>
                                    <p className="font-semibold">{totalHadir}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-gray-500">Terlambat</p>
                                    <p className="font-semibold text-yellow-600">{totalTelat}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-gray-500">Tidak Hadir</p>
                                    <p className="font-semibold text-red-600">{totalAlpa}</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. My Tasks */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Tasks</h2>
                            <div className="space-y-4">
                                {myTasks.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No tasks assigned</p>
                                ) : (
                                    myTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="relative p-4 rounded-xl border border-gray-200 bg-white shadow hover:shadow-lg transition duration-300 overflow-hidden"
                                        >
                                            <div
                                                className={`absolute bottom-0 right-0 w-20 h-20 opacity-40 pointer-events-none rounded-xl
                                                ${task.task.status === "done" && "bg-gradient-to-br from-green-300 to-green-500"}
                                                ${task.task.status === "todo" && "bg-gradient-to-br from-yellow-300 to-yellow-500"}
                                                ${task.task.status === "in progress" && "bg-gradient-to-br from-blue-300 to-blue-500"}`}
                                                style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
                                            ></div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-1 pr-12">{task.task.title}</h3>
                                            <p className="text-sm text-gray-500">Status: {task.task.status}</p>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <button
                                                    className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition"
                                                    onClick={() => handleBtnEditMyTask(task)}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* DESKTOP: Horizontal Layout (Original) */}
                <div className="hidden lg:flex flex-1 p-8 gap-6 h-full">
                    {/* LEFT: My Tasks */}
                    <div className="w-2/3 bg-white rounded-2xl shadow-lg p-6 border border-gray-200 overflow-y-auto h-full">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Tasks</h2>
                        <div className="space-y-4 h-full flex flex-col">
                            {myTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="relative p-4 rounded-xl border border-gray-200 bg-white shadow hover:shadow-lg transition duration-300 overflow-hidden"
                                >
                                    <div
                                        className={`absolute bottom-0 right-0 w-20 h-20 opacity-40 pointer-events-none rounded-xl
                                        ${task.task.status === "done" && "bg-gradient-to-br from-green-300 to-green-500"}
                                        ${task.task.status === "todo" && "bg-gradient-to-br from-yellow-300 to-yellow-500"}
                                        ${task.task.status === "in progress" && "bg-gradient-to-br from-blue-300 to-blue-500"}`}
                                        style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
                                    ></div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{task.task.title}</h3>
                                    <p className="text-sm text-gray-500">Status: {task.task.status}</p>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <button
                                            className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition"
                                            onClick={() => handleBtnEditMyTask(task)}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Profile + Statistik */}
                    <div className="w-1/3 flex flex-col gap-6 h-full">
                        <div className="flex-1 bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
                            <div className="bg-white w-full p-6 rounded-3xl shadow-lg border border-gray-200 flex flex-row gap-6">
                                {/* LEFT: BIODATA */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-black text-2xl font-bold shadow">
                                            <img className="w-full h-full rounded-full object-cover" src={currentUser.foto} alt="" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-gray-800">{currentUser.fullname}</p>
                                            <p className="text-gray-500 uppercase">{currentUser.role}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-gray-800">
                                        <div>
                                            <p className="text-gray-500 text-sm">Username</p>
                                            <p className="font-medium">{currentUser.username}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">Gmail</p>
                                            <p className="font-medium">{currentUser.gmail}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">Tanggal Lahir</p>
                                            <p className="font-medium">{formatDate(currentUser.Birthday)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">Bergabung Pada</p>
                                            <p className="font-medium">{formatDate(currentUser.created_at)}</p>
                                        </div>
                                        <div className="flex gap-3 mt-2 justify-between">
                                            <button className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition" onClick={handleBtnEdit}>
                                                Edit
                                            </button>
                                            <button className="w-full bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition">Logout</button>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: QR CODE */}
                                <div className="flex-none flex items-center justify-center">
                                    <img
                                        src={currentUser.qr_token}
                                        alt="QR Code"
                                        className="w-32 h-32 border rounded-md"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
                            <div className="bg-white w-full p-6 rounded-3xl shadow-lg border border-gray-200">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Statistik Kehadiran</h2>
                                <div className="flex items-center justify-center mb-6">
                                    <div className="w-32 h-32 rounded-full border-4 border-blue-500 flex flex-col items-center justify-center">
                                        <p className="text-3xl font-bold text-blue-600">{persen}%</p>
                                        <p className="text-xs text-gray-500 -mt-1">Kehadiran</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <p className="text-gray-500">Total Hari Kerja</p>
                                        <p className="font-semibold">{lamaKerja}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-gray-500">Hadir</p>
                                        <p className="font-semibold">{totalHadir}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-gray-500">Terlambat</p>
                                        <p className="font-semibold text-yellow-600">{totalTelat}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-gray-500">Tidak Hadir</p>
                                        <p className="font-semibold text-red-600">{totalAlpa}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL EDIT PROFILE */}
            <Modal isOpen={isModalEdit} onClose={() => setIsModalEdit(false)} title="Edit Profile">
                <form onSubmit={handleSubmitEdit} className="space-y-4 text-black">
                    <input
                        type="text"
                        value={formEdit.fullname}
                        onChange={(e) => setFormEdit({ ...formEdit, fullname: e.target.value })}
                        placeholder="Fullname"
                        className="w-full border rounded p-2"
                    />
                    <input
                        type="text"
                        value={formEdit.username}
                        onChange={(e) => setFormEdit({ ...formEdit, username: e.target.value })}
                        placeholder="Username"
                        className="w-full border rounded p-2"
                    />
                    <input
                        type="email"
                        value={formEdit.gmail}
                        onChange={(e) => setFormEdit({ ...formEdit, gmail: e.target.value })}
                        placeholder="Gmail"
                        className="w-full border rounded p-2"
                    />
                    <input
                        type="date"
                        value={formEdit.Birthday}
                        onChange={(e) => setFormEdit({ ...formEdit, Birthday: e.target.value })}
                        className="w-full border rounded p-2"
                    />
                    <input
                        type="password"
                        value={formEdit.password}
                        onChange={(e) => setFormEdit({ ...formEdit, password: e.target.value })}
                        placeholder="Password"
                        className="w-full border rounded p-2"
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsModalEdit(false)}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                        >
                            Batal
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL EDIT TASK */}
            <Modal isOpen={isModalEditMyTask} onClose={() => setIsModalEditMyTask(false)} title="Edit Task">
                <form onSubmit={handleSubmitEditMyTask} className="space-y-4 text-black">
                    <select
                        value={formEditMyTask.status}
                        onChange={(e) => setFormEditMyTask({ ...formEditMyTask, status: e.target.value })}
                        className="w-full border rounded p-2"
                    >
                        <option value="todo">TODO</option>
                        <option value="in progress">IN PROGRESS</option>
                        <option value="done">DONE</option>
                    </select>
                    <textarea
                        value={formEditMyTask.description}
                        onChange={(e) => setFormEditMyTask({ ...formEditMyTask, description: e.target.value })}
                        placeholder="Description"
                        className="w-full border rounded p-2"
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsModalEditMyTask(false)}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                        >
                            Batal
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default Profile;