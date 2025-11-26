import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import axios from "axios";
import API from "../../api/API"; // pastikan import API
import { Link } from "react-router-dom";
import Modal from "../../components/modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronRightCircleIcon, EditIcon, TrashIcon } from "lucide-react";

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [isOpen3, setIsOpen3] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: "",
    });


    const fetchRooms = async () => {
        try {
            const response = await axios.get(API + "rooms");
            setRooms(response.data);
        } catch (error) {
            console.log(error);
        }
    };



    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBtnEdit = (room) => {
        setFormData({id: room.id, name: room.name});
        setIsOpen2(true);
    };

    const handleBtnDelete = (room) => {
        setFormData({id: room.id});
        setIsOpen3(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API + "room" + formData.id,{name: formData.name});
            setIsOpen(false);
            fetchRooms();
            toast.success("Room added successfully");
        }catch (error) {
            console.log(error);
            toast.error("Failed to add room");
        }
    }

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(API + "room/" + formData.id,formData);
            setIsOpen2(false);
            fetchRooms();
            toast.success("Room updated successfully");
        } catch(error){
            console.log(error);
            toast.error("Failed to update room");
        }
    }

    const handleDelete = async (id) => {
        try {
            await axios.delete(API + "room/" + id);
            fetchRooms();
            toast.success("Room deleted successfully");
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete room");
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    return (
        <>
       <ToastContainer />
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 p-8">
                <div className="flex justify-between">
                        <h1 className="text-2xl font-bold mb-4">Rooms</h1>

                        <button
                            onClick={() => setIsOpen(true)}
                            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded h-10"
                        >
                            Add Room
                        </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {rooms.length > 0 ? (
                        rooms.map((room) => (
                            <div
                                key={rooms.id}
                                className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-all border border-gray-100"
                            >
                                <div className="flex items-center">
                                    <div>
                                        <p className="text-gray-500 text-sm">Room</p>
                                        <h2 className="text-2xl font-bold text-gray-800">{room.name}</h2>
                                    </div>
                                    <div className="flex gap-2 ml-auto justify-end">
                                        <Link
                                            key={room.id}
                                            to={`/roomdetail/${room.id}`}
                                            className="bg-white border border-gray-300 p-3 rounded-full cursor-pointer hover:bg-gray-100 transition inline-block"
                                        >
                                            <ChevronRightCircleIcon />
                                        </Link>
                                        <button onClick={() => handleBtnEdit(room)}>
                                            <EditIcon />
                                        </button>
                                        <button onClick={() => handleBtnDelete(room)}>
                                            <TrashIcon />
                                        </button>
                                    </div>
                                  
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-full text-center">
                            Tidak ada room tersedia
                        </p>
                    )}
                </div>
            </div>
        </div>

        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Room">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
                        Room Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                    /> 
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                        Save
                    </button>
                </div>
            </form>
        </Modal>

        <Modal isOpen={isOpen2} onClose={() => setIsOpen2(false)} title="Edit Room">
            <form onSubmit={handleSubmitEdit}>
                <div className="mb-4">
                    <label htmlFor="name" className="bloc text-gray-700 font-bold mb-2">
                        Room Name
                    </label>
                    <input
                     type="text"
                     id="name"
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-white text-black"
                     />
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                        Save
                    </button>
                </div>
            </form>
           </Modal>

           <Modal isOpen={isOpen3} onClose={() => setIsOpen3(false)} title="Delete Room">
               <div className="mb-4 text-gray-200">
                    Apakah Anda Yakin ingin menghapus ini <span className="text-white">{formData.name} </span>? 
               </div>
               <div>
                <div className="flex justify-end space-x-5 p-5">
                    <button>
                        Batal
                    </button>
                        <button onClick={() => {
                            handleDelete(formData.id);
                            setIsOpen3(false);
                        }}
                        type="submit"
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                        Delete
                    </button>
                </div>
               </div>
           </Modal>
        </>
    );
};

export default Rooms;
