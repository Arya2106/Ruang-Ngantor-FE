import React, { useState } from 'react';
import { Home, Building, BarChart, Settings, Users, X, ChevronRight, Calendar, LogOut, MessageCircle,} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom'; // <-- pakai ini
import { UserContext } from './UserContext';


export default function Sidebar() {

    const {currentUser} = React.useContext(UserContext);
    const [isOpen, setIsOpen] = useState(true);
    const [activeItem, setActiveItem] = useState();
    const { logout } = React.useContext(UserContext);

    const location = useLocation();

    const role = currentUser?.role || '';
   
   

   
    const menuItems = [
        { id: 'dashboard', icon: Home, label: 'Dashboard', link: '/dashboard', roles: ['admin'] },

        { id: 'users', icon: Users, label: 'Users', link: '/users', roles: ['admin', 'leader'] },

        { id: 'rooms', icon: Building, label: 'Ruang', link: '/rooms', roles: ['admin', 'leader', ] },

        { id: 'settings', icon: Settings, label: 'Task', link: '/tasks', roles: ['admin', 'leader'] },

        { id: 'attendances', icon: Calendar, label: 'Attendances', link: '/attendances', roles: ['admin', 'leader'] },

        { id: 'my_rooms', icon: Building, label: 'Ruang', link: '/myrooms', roles: ['leader','anggota'] },

        { id: 'my_attendance', icon: Calendar, label: 'My Attendance', link: '/myattendance', roles: ['leader', 'anggota'] },
        { id: 'attendance', icon: Calendar, label: 'Attendance', link: '/attendance', roles: ['leader', 'anggota'] },

        { id: 'chats', icon: MessageCircle, label: 'Chats', link: '/chats', roles: ['admin', 'leader', 'anggota'] },

        { id: 'profile', icon: Users, label: 'Profile', link: '/profile', roles: ['admin', 'leader', 'anggota'] },
    ];

    const filteredMenu = menuItems.filter(item =>
        item.roles.includes('all') || item.roles.includes(role)
    );

    return (
        <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
                style={{ width: '280px' }}
            >
                <div className="h-full bg-gray-100 flex flex-col">
                    {/* Header */}

                    {/* Header */}
                    <div className="p-6 border-b border-slate-700/50">
                        <div className="flex items-center justify-between">

                            {/* === LOADING STATE === */}
                            {!currentUser ? (
                                <div className="flex items-center space-x-3">
                                    {/* Avatar Loading */}
                                    <div className="w-10 h-10 bg-gray-300 rounded-xl animate-bounce"></div>

                                    <div className="flex flex-col gap-2">
                                        <div className="w-24 h-4 bg-gray-300 rounded animate-bounce"></div>
                                        <div className="w-16 h-3 bg-gray-300 rounded animate-bounce"></div>
                                    </div>
                                </div>
                            ) : (
                                /* === DATA USER NORMAL === */
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-xl">
                                            {currentUser.username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-gray-700 font-semibold text-lg">
                                            {currentUser.username}
                                        </h4>
                                        <p className="text-slate-400 text-xs uppercase">{currentUser.role}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setIsOpen(false)}
                                className="lg:hidden text-slate-400 hover:text-white transition-colors duration-200"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto">
                        <ul className="space-y-2">
                            {filteredMenu.map((item, index) => {
                                const Icon = item.icon;
                                const isActive = location.pathname.toLowerCase() === item.link.toLowerCase();

                                return (
                                    <li
                                        key={item.id}
                                        style={{
                                            animation: `slideIn 0.3s ease-out ${index * 0.1}s backwards`
                                        }}
                                    >
                                        <Link
                                            to={item.link}
                                            onClick={() => {
                                                setActiveItem(item.id);
                                            }}
                                            className={`group relative flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 ${isActive
                                                    ? 'bg-gray-800 text-white shadow-lg shadow-blue-500/30'
                                                    : 'text-black-300 hover:bg-slate-700/50 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Icon
                                                    size={20}
                                                    className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'
                                                        }`}
                                                />
                                                <span className="font-medium">{item.label}</span>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                {item.badge && (
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isActive
                                                            ? 'bg-white text-blue-600'
                                                            : 'bg-slate-700 text-slate-300'
                                                        }`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                                {isActive && (
                                                    <ChevronRight
                                                        size={16}
                                                        className="animate-pulse"
                                                    />
                                                )}
                                            </div>

                                            {/* Active indicator */}
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-700/50">
                        <div className="bg-gray-800 rounded-xl p-4 border border-blue-500/30">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-black font-semibold text-sm"><LogOut size={20} /> </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                   <button className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full' onClick={logout}>
                                        Logout
                                   </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}


            <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
        </div>
    );
}

