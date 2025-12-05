import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import API from "../api/API";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Search, Users } from "lucide-react";

export default function Chats() {
    const [users, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const response = await fetch(API + "users");
            const data = await response.json();
            console.log(data);
            setUser(data);
        } catch (error) {
            console.log(error);
        }
    };

    const handleChatWithUser = (userId) => {
        navigate(`/chat/personal/${userId}`);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users based on search query
    const filteredUsers = users?.filter(user =>
        user.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.gmail?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="flex h-screen overflow-hidden ">
                <Sidebar />
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    {/* Header */}
                    <div className="bg-white border-b border-gray-100 px-8 py-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                                    <MessageCircle className="text-white" size={24} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {filteredUsers?.length || 0} conversations available
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        {!filteredUsers || filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Users size={64} className="mb-4 opacity-50" />
                                <p className="text-lg font-medium">
                                    {searchQuery ? "No users found" : "No users available"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 w-full mx-auto">
                                {filteredUsers.map((user) => {
                                    const initial = user.fullname ? user.fullname[0].toUpperCase() : "?";

                                    // Generate color for avatar
                                    const colors = [
                                        'bg-gradient-to-br from-pink-400 to-pink-600',
                                        'bg-gradient-to-br from-purple-400 to-purple-600',
                                        'bg-gradient-to-br from-blue-400 to-blue-600',
                                        'bg-gradient-to-br from-green-400 to-green-600',
                                        'bg-gradient-to-br from-yellow-400 to-yellow-600',
                                        'bg-gradient-to-br from-red-400 to-red-600',
                                        'bg-gradient-to-br from-indigo-400 to-indigo-600',
                                    ];
                                    const colorClass = colors[user.id % colors.length];

                                    return (
                                        <div
                                            key={user.id}
                                            className="group bg-white rounded-2xl w-full p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 cursor-pointer transform hover:-translate-y-1"
                                            onClick={() => handleChatWithUser(user.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Avatar */}
                                                <div className="relative">
                                                    {user.foto ? (
                                                        <img
                                                            className="w-14 h-14 rounded-full ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all object-cover"
                                                            src={user.foto}
                                                            alt={user.username}
                                                        />
                                                    ) : (
                                                        <div className={`w-14 h-14 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-xl shadow-md ring-2 ring-white`}>
                                                            {initial}
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                                                </div>

                                                {/* User Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h2 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                        {user.fullname}
                                                    </h2>
                                                    <p className="text-sm text-gray-500 truncate">{user.gmail}</p>
                                                </div>

                                                {/* Chat Button */}
                                                <button
                                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-110"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleChatWithUser(user.id);
                                                    }}
                                                >
                                                    <MessageCircle size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}