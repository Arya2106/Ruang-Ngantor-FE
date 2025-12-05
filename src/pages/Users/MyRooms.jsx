import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import axios from "axios";
import API from "../../api/API";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronRightCircleIcon, EditIcon, MessageCircle, TrashIcon } from "lucide-react";
import { UserContext } from "../../components/UserContext";

const MyRooms = () => {
    const { currentUser } = React.useContext(UserContext);
    const [rooms, setRooms] = useState([]);
    const token = localStorage.getItem("token");

    console.log("Current user:", currentUser);
    console.log("Token:", token);

    const fetchRooms = async () => {
        try {
            const response = await axios.get(API + "my_room_membership", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Response data:", response.data);

            // Extract rooms dari memberships
            const roomsData = response.data.map(membership => ({
                ...membership.room, // id, name dari room
                membership_id: membership.id, // id membership
                role_in_room: membership.role_in_room // role user di room
            }));

            setRooms(roomsData);
        } catch (error) {
            console.error("Error fetching rooms:", error);
            if (error.response?.status === 401) {
                toast.error("Token expired atau tidak valid. Silakan login kembali.");
            } else {
                toast.error("Gagal mengambil data rooms");
            }
        }
    };


    useEffect(() => {
        if (token) {
            fetchRooms();
        } else {
            toast.error("User tidak terautentikasi");
        }
    }, []);

    return (
        <>
            <ToastContainer />
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 p-8">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold mb-4">My Rooms</h1>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {rooms.length > 0 ? (
                            rooms.map((room) => (
                                <div
                                    key={room.id}
                                    className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-all border border-gray-100"
                                >
                                    <div className="flex items-center">
                                        <div className="flex-1">
                                            <p className="text-gray-500 text-sm">Room</p>
                                            <h2 className="text-2xl font-bold text-gray-800">
                                                {room.name}
                                            </h2>
                                            {/* Tampilkan role user */}
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-2 inline-block">
                                                {room.role_in_room}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 ml-auto">
                                           <button>
                                                <MessageCircle className="w-5 h-5" />
                                           </button>
                                            <Link
                                                to={`/myroomdetail/${room.id}`}
                                                className="bg-white border border-gray-300 p-3 rounded-full cursor-pointer hover:bg-gray-100 transition inline-block"
                                                title="View Details"
                                            >
                                                <ChevronRightCircleIcon className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 col-span-full text-center py-8">
                                Tidak ada room tersedia
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MyRooms;