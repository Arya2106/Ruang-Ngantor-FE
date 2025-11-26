import react, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import Table from "../../components/table";
import axios from "axios";
import API from "../../api/API";
import Modal from "../../components/modal";
import { PlusIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";


const Tasks = () => {
    const [tasks,SetTask]=useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        title: "",
        status: "todo",
        description: "",
    });


    function fetchTasks() {
        try {
            axios.get(API + "tasks").then((response) => {
                SetTask(response.data);
            });
        } catch (error) {
            console.log(error);
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    }

    const handleBtnEdit = (task) => {
        setFormData({
            id: task.id,
            title: task.title,
            status: task.status,
            description: task.description,
        });
        setIsEditModalOpen(true);
    }

    const handleBtnDelete = (task) => {
        setFormData({
            id: task.id,
        });
        setIsDeleteModalOpen(true);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API + "task", formData);
            setIsModalOpen(false);
            setFormData({ title: "", status: "", description: "" });
            fetchTasks();
            toast.success("Task added successfully");
        } catch (error) {
            console.log(error);
            toast.error("Failed to add task");
        }
    }



    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(API + "task/" + formData.id, formData);
            setIsEditModalOpen(false);
            fetchTasks();
            toast.success("Task updated successfully");
        } catch (error) {
            console.log(error);
            toast.error("Failed to update task");
        }
    }

    const handleDelete = async (e) => {
        try {
            await axios.delete(API + "task/" + formData.id);
            setIsDeleteModalOpen(false);
            fetchTasks();
            toast.success("Task deleted successfully");
        }catch (error) {
            console.log(error);
            toast.error("Failed to delete task");
        }
    }

    


    useEffect(() => {
        fetchTasks();
    }, []);
    const columns = ["ID", "Title", "Status", "Description", "Action"];
    return (
        <>
        <ToastContainer />
            <div className="flex h-min-screen">
                <Sidebar />
                <div className="flex-1 p-8">
                    <h1 className="text-2xl font-bold mb-4">Tasks</h1>
                    <div className=" bg-white p-6 rounded-2xl shadow">
                        <div className="flex justify-between">
                            <h1 className="text-2xl font-bold mb-4">List Task</h1>
                            <button className="bg-gray-800 text-white px-5 py-1 rounded hover:bg-gray-900" onClick={() => setIsModalOpen(true)}>
                                Add Task <PlusIcon className="inline-block w-4 h-4 ml-2" />
                            </button>
                        </div>
                        
                        <Table
                            columns={columns}
                            data={tasks.map(task => ({
                                ID: task.id,
                                Title: task.title,
                                Status: (
                                    <span
                                        className={`
                    px-3 py-1 rounded-full text-white text-xs font-semibold
                    ${task.status === "todo"
                                                ? "bg-yellow-500"
                                                : task.status === "in progress"
                                                    ? "bg-blue-500"
                                                    : "bg-green-500"
                                            }
                `}
                                    >
                                        {task.status}
                                    </span>
                                ),
                                Description: task.description,
                                Action: (
                                    <div className="flex gap-2">
                                        <button
                                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                            onClick={() => handleBtnEdit(task)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                            onClick={() => handleBtnDelete(task)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ),
                            }))}
                        />

                    </div>
                </div>
               
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Task">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                            Title
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Title"
                        />
                    </div>
                    {/* <input type="hidden" name="status" value={formData.status = "todo"} /> */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="description"
                            placeholder="Description"
                            onChange={handleChange}
                            value={formData.description}
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
                            type="submit"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Task">
                <form onSubmit={handleEditSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                            Title
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Title"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                            status
                        </label>
                        <select
                            name="status"
                            id="status"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="" disabled>Select status</option>
                            <option value="todo">Todo</option>
                            <option value="in progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>

                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="description"
                            placeholder="Description"
                            onChange={handleChange}
                            value={formData.description}
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
                            type="submit"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => {}} title="Delete Task">
                <p>Are you sure you want to delete this task?</p>
                <div className="flex justify-end gap-4 mt-4">
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        type="button"
                        onClick={() => setIsDeleteModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        type="button"
                        onClick={() => handleDelete(formData.id)}
                    >
                        Delete
                    </button>
                </div>
            </Modal>
        </>
    ) 
};

export default Tasks;