import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import axios from "axios";
import API from "../../api/API";
import SearchBar from "../../components/searchbar";
import { PlusIcon, EditIcon, TrashIcon, MessageCircle } from "lucide-react";
import Modal from "../../components/modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FilterBar from "../../components/filterbar";
import Card from "../../components/card";
import { useNavigate } from "react-router-dom";

const Users = () => {
    const navigate = useNavigate();
    const [users, SetUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        id: null,
        username: "",
        fullname: "",
        gmail: "",
        Birthday: "",
        password: "",
        role: "",
        foto: "",
    });
    const [filtersdata, setFiltersData] = useState({
        role: "",
        rooms: "",
    });
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [isOpen3, setIsOpen3] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const usersPerPage = 8;

    const handlefilterchange = (e) => {
        setFiltersData({ ...filtersdata, [e.target.name]: e.target.value });
    };

    const resetfilters = () => {
        setFiltersData({
            role: "",
            rooms: "",
        });
    };

    const filtersConfig = [
        {
            name: "role",
            label: "Role",
            type: "select",
            value: filtersdata.role,
            options: [
                { value: "", label: "All" },
                { value: "admin", label: "admin" },
                { value: "anggota", label: "anggota" },
            ],
        },
        {
            name: "rooms",
            label: "Room",
            type: "select",
            value: filtersdata.rooms,
            options: [
                { value: "", label: "All" },
                { value: "room1", label: "Room 1" },
                { value: "room2", label: "Room 2" },
            ],
        },
    ];

    const fetchUsers = async () => {
        try {
            const res = await axios.get(API + "users", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            SetUsers(res.data);
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login", { replace: true });
            } else {
                console.log(error);
                toast.error("Gagal mengambil data user");
            }
        }
    };


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                foto: reader.result
            }));
        };
    };

    const handleBtnEdit = (user) => {
        setFormData({
            id: user.id,
            username: user.username,
            fullname: user.fullname,
            password: user.password,
            role: user.role,
            gmail: user.gmail,
            Birthday: user.Birthday,
            foto: user.foto
        });
        setIsOpen2(true);
    };

    const handleBtnDelete = (user) => {
        setFormData({ id: user.id });
        setIsOpen3(true);
    };

    // Handler untuk navigasi ke chat
    const handleChatWithUser = (userId) => {
        navigate(`/chat/personal/${userId}`);
    };

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            await axios.post(API + "users", formData);
            setIsOpen(false);
            setFormData({ username: "", fullname: "", password: "", role: "", gmail: "", Birthday: "" });
            fetchUsers();
            toast.success("User added successfully");
        } catch (error) {
            console.log(error);
            toast.error("Failed to add user");
        }
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(API + "users/" + formData.id, formData);
            setIsOpen2(false);
            fetchUsers();
            toast.success("User updated successfully");
        } catch (error) {
            console.log(error);
            toast.error("Failed to update user");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(API + "users/" + id);
            fetchUsers();
            toast.success("User deleted successfully");
            setIsOpen3(false);
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete user");
        }
    };

    const searchUser = users.filter((user) => {
        if (searchTerm === "") return true;
        return (
            user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = searchUser.slice(indexOfFirstUser, indexOfLastUser);

    const totalPages = Math.ceil(searchUser.length / usersPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <>
            <ToastContainer />
            <div className="flex h-screen overflow-hidden">
                <Sidebar />

                {/* Area Konten */}
                <div className="flex-1 flex flex-col max-h-screen overflow-y-auto p-8">
                    <h1 className="text-2xl font-bold mb-4">Users</h1>

                    <div className="flex mt-3 mb-3 gap-2 h-10">
                        <SearchBar
                            placeholder="Search"
                            onChange={(e) => setSearchTerm(e.target.value)}
                            value={searchTerm}
                        />
                        {/* <FilterBar
                            filters={filtersConfig}
                            onChange={handlefilterchange}
                            onReset={resetfilters}
                        /> */}
                        <button
                            className="bg-gray-800 hover:bg-gray-900 transition-colors duration-300 h-auto w-40 shadow-md flex items-center justify-center text-white rounded-lg"
                            onClick={() => setIsOpen(true)}
                        >
                            Add User <PlusIcon size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {currentUsers.length > 0 ? (
                            currentUsers.map((user) => (
                                <Card
                                    key={user.id}
                                    avatar={user.foto ? user.foto : "https://img.freepik.com/premium-photo/3d-character-avatar_113255-5300.jpg"}
                                    name={user.username}
                                    fullname={user.fullname}
                                    role={user.role}
                                    stats={[]}
                                >
                                    <div className="flex justify-end space-x-2">
                                        {/* Chat Button */}
                                        <button
                                            onClick={() => handleChatWithUser(user.id)}
                                            className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors duration-200 group"
                                            title="Chat"
                                        >
                                            <MessageCircle size={18} className="text-white" />
                                        </button>

                                        {/* Edit Button */}
                                        <button
                                            onClick={() => handleBtnEdit(user)}
                                            className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200"
                                            title="Edit"
                                        >
                                            <EditIcon size={18} className="text-white" />
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleBtnDelete(user)}
                                            className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
                                            title="Delete"
                                        >
                                            <TrashIcon size={18} className="text-white" />
                                        </button>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <p className="text-gray-500 col-span-full text-center">
                                Tidak ada hasil untuk "{searchTerm}"
                            </p>
                        )}
                    </div>

                    <div>
                        {/* Pagination Section */}
                        {totalPages > 1 && (
                            <div className="sticky bottom-0 left-0 w-full bg-white border-t border-gray-200 py-4 mt-10">
                                <div className="flex justify-center items-center space-x-4">
                                    <button
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${currentPage === 1
                                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                : "bg-gray-800 text-white hover:bg-gray-900"
                                            }`}
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <span className="font-semibold">
                                            {currentPage}
                                        </span>
                                        <span>/</span>
                                        <span>{totalPages}</span>
                                    </div>

                                    <button
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${currentPage === totalPages
                                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                : "bg-blue-600 text-white hover:bg-blue-700"
                                            }`}
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add User">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="" className="text-gray-500 text-sm">Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" />
                    </div>
                    <div className="flex flex-col gap-2 mt-3">
                        <label htmlFor="" className="text-gray-500 text-sm">Fullname</label>
                        <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" />
                    </div>
                    <div className="flex flex-col gap-2 mt-3">
                        <label htmlFor="foto" className="text-gray-500 text-sm">Foto</label>
                        <input
                            type="file"
                            name="foto"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="gmail" className="text-gray-500 text-sm">Gmail</label>
                        <input type="email" name="gmail" value={formData.gmail} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="" className="text-gray-500 text-sm">Birthday</label>
                        <input type="date" name="Birthday" value={formData.Birthday} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" />
                    </div>
                    <div className="flex flex-col gap-2 mt-3">
                        <label htmlFor="" className="text-gray-500 text-sm">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" />
                    </div>
                    <div className="flex flex-col gap-2 mt-3">
                        <label htmlFor="" className="text-gray-500 text-sm">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black">
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="leader">Leader</option>
                            <option value="anggota">Anggota</option>
                        </select>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition" type="submit">
                            Add User
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isOpen2} onClose={() => setIsOpen2(false)} title={"Edit User"}>
                <form onSubmit={handleSubmitEdit}>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="" className="text-gray-500 text-sm">Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="" className="text-gray-500 text-sm">Fullname</label>
                        <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="" className="text-gray-500 text-sm">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="" className="text-gray-500 text-sm">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black">
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="leader">Leader</option>
                            <option value="anggota">Anggota</option>
                        </select>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition" type="submit">
                            Update User
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isOpen3} onClose={() => setIsOpen3(false)} title={"Delete User"}>
                <div>
                    Apakah anda yakin menghapus user ini?
                </div>
                <div className="flex justify-end space-x-5 p-5">
                    <button onClick={() => setIsOpen3(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
                        Cancel
                    </button>
                    <button onClick={() => handleDelete(formData.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                        Delete
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default Users;