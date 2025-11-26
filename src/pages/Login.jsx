import axios from "axios";
import React, { useState, useContext } from "react";
import API from "../api/API";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Ambil login function dari UserContext
    const { login, refreshUser } = useContext(UserContext);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(API + "auth/login", {
                username,
                password
            });

            // Ambil token dari backend
            const { access_token } = response.data;

            // Simpan token ke context
            login(null, access_token);

            // Fetch profil user setelah login (penting!)
            await refreshUser();

            toast.success("Login Berhasil!");

            // Pindah ke dashboard
            navigate("/dashboard");

        } catch (error) {
            console.error("Login error:", error);
            toast.error("Username atau password salah");
        }
    };

    return (
        <>
            <ToastContainer />

            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-2xl shadow-lg w-96">

                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                        Login
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                        >
                            Login
                        </button>
                    </form>

                </div>
            </div>
        </>
    );
};

export default Login;
