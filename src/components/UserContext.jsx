import React, { useEffect, useState, createContext } from "react";
import axios from "axios";
import API from "../api/API";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    // Ambil user dari backend jika token tersedia
    const fetchUser = async () => {
        if (!token) {
            setCurrentUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(API + "users/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCurrentUser(res.data);
        } catch (err) {
            console.error("Fetch user failed:", err);
            setCurrentUser(null);

            // token invalid → hapus
            localStorage.removeItem("token");
            setToken(null);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, [token]);

    const login = (userData, t) => {
        localStorage.setItem("token", t);
        setToken(t);
        setCurrentUser(userData);
    };

    const refreshUser = async () => {
        await fetchUser();
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setCurrentUser(null);
        window.location.href = "/";
    };

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <div className="animate-bounce text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <UserContext.Provider
            value={{ currentUser, token, login, logout, refreshUser }}
        >
            {children}
        </UserContext.Provider>
    );
};
