// src/components/Modal.jsx
import React from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="fixed inset-0 flex justify-center items-center z-50">
                <div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 transform transition-all scale-100"
                    onClick={(e) => e.stopPropagation()} // agar klik modal tidak menutup
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                            {title}
                        </h2>
                        <button
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                            onClick={onClose}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="text-gray-600 dark:text-gray-200">{children}</div>

                    {/* Footer (opsional) */}
                 
                </div>
            </div>
        </>
    );
};

export default Modal;
