import React, { use, useContext, useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Table from "../components/table";
import { BarChart3, Users, ShoppingBag, Activity, Bell, Building, } from "lucide-react";
import axios from "axios";
import API from "../api/API";
import StatistikCard from "../components/statistikcard";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import Card from "../components/card";
import { UserContext } from "../components/UserContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HomePage = () => {
    const {currentUser} = useContext(UserContext);
    const [task_assignments,Settask_assignments]=useState([]);
    const [tasks,SetTask]=useState([]);
    const [users,SetUsers]=useState([]);
    const [rooms,SetRooms]=useState([]);
    const [attendances, SetAttendances] = useState([]);
   
    const fetchtask_assignments = async () => {
        try {
            axios.get(API + "task_assignments").then((response) => {
                Settask_assignments(response.data);
                
            });
        } catch (error) {
            console.log(error);
        }
    }

    const fetchTasks = async () => {
      try {
        axios.get(API + "tasks").then((response) =>{
          SetTask(response.data);
        });
      }catch (error) {
        console.log(error);
      }
    }

    const fetchAttendances = async () => {
      try {
          axios.get(API + "attendances").then((response) => {
              SetAttendances(response.data);
          });
      } catch (error) {
          console.log(error);
      }
  }

    const fetchUsers = async () => {
        try {
            axios.get(API + "users").then((response) => {
                SetUsers(response.data);
                
            });
        } catch (error) {
            console.log(error);
        }
    }

    const fetchRooms = async () => {
      try{
        axios.get(API + "rooms").then((response) => {
          SetRooms(response.data);
        })
      } catch (error) {
        console.log(error);
      }
    }

  const AttendanceLineChart = ({ attendances, rooms }) => {
    // Buat label bulan 1-12
    const labels = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("id-ID", { month: "short" })
    );

    // Persentase kehadiran per room per bulan
    const datasets = rooms.map((room) => {
      const data = labels.map((_, monthIndex) => {
        const roomData = attendances.filter((att) => {
          const date = new Date(att.check_in);
          return att.room?.name === room.name && date.getMonth() === monthIndex;
        });

        const total = roomData.length;
        const present = roomData.filter((att) => att.status === "present").length;

        return total > 0 ? (present / total) * 100 : 0;
      });

      return {
        label: room.name,
        data,
        fill: false,
        borderColor: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
        tension: 0.3,
      };
    });

    const data = { labels, datasets };

    const options = {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Persentase Kehadiran Per Ruangan (1 Tahun)" }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: (val) => val + "%" }
        }
      }
    };

    return <Line data={data} options={options} />;
  };



  const getTopUserAttendance = (attendances) => {
    if (!attendances || attendances.length === 0) return null;

    // Hitung frekuensi kehadiran per user
    const attendanceCount = {};
    attendances.forEach(att => {
      if (att.status === "present") {
        const fullname = att.user?.fullname || "Unknown";
        
        attendanceCount[fullname] = (attendanceCount[fullname] || 0) + 1;
      }
    });

    // Cari user dengan jumlah kehadiran tertinggi
    const topUser = Object.entries(attendanceCount).sort((a, b) => b[1] - a[1])[0];
    return topUser ? { fullname: topUser[0], count: topUser[1] } : null;
  };

  const TopUserAttendance = getTopUserAttendance(attendances);

  const getTopUserTask = (task_assignments) => {
    if (!task_assignments || task_assignments.length === 0) return null;

    // Hitung frekuensi kehadiran per user
    const taskCount = {};
    task_assignments.forEach(task => {

      if (task.task?.status === "done") {
        const fullname = task.user?.fullname || "Unknown";
        taskCount[fullname] = (taskCount[fullname] || 0) + 1;
      }
     
     
    });

    // Cari user dengan jumlah kehadiran tertinggi
    const topUser = Object.entries(taskCount).sort((a, b) => b[1] - a[1])[0];
    return topUser ? { fullname: topUser[0], count: topUser[1] } : null;
  };

  const TopUserTask = getTopUserTask(task_assignments);


    

    useEffect(() => {
        fetchRooms();
        fetchUsers();
        fetchtask_assignments();
        fetchAttendances();
        fetchTasks();
    }, []);

    const columns = ["ID", "Nama User", "Nama Task", "Deskripsi", "Status", "Ruang"];

  return (
    <div className="flex min-h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 h-screen overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
            <p className="text-gray-500 mt-1">Selamat datang kembali, {currentUser?.fullname} 👋</p>
          </div>

          <button className="relative bg-white p-2 rounded-full shadow hover:shadow-md transition">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              3
            </span>
          </button>
        </div>

        {/* Statistik Cards */}
        
        
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatistikCard title="Users" value={users.length} iconColor="text-blue-600" Icon={Users} />

          <StatistikCard title="Rooms" value={rooms.length} iconColor="text-blue-600" Icon={Building} />

          <StatistikCard title="Total Task" value={tasks.length} iconColor="text-yellow-600" Icon={Activity} />

          <StatistikCard title="Total Task Done" value= {tasks.filter(task => task.status === "done").length} iconColor="text-blue-600" Icon={BarChart3} />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Statistik</h3>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Grafik Kehadiran (besar) */}
            <div className="flex-1 bg-white p-6 rounded-2xl shadow border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Statistik Kehadiran Tahunan
              </h3>

              <div className="h-80">
                <AttendanceLineChart attendances={attendances} rooms={rooms} />
              </div>
            </div>

            {/* Card Samping */}
            <div className="w-full md:w-1/2 flex  gap-6">

              {/* Top Hadir */}
              <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Top 1 Karyawan Hadir
                </h3>

                {TopUserAttendance ? (
                  <Card
                    avatar="https://img.freepik.com/premium-photo/3d-character-avatar_113255-5300.jpg"
                    name={TopUserAttendance.fullname}
                    fullname={`Hadir ${TopUserAttendance.count} kali`}
                  />
                ) : (
                  <p className="text-gray-500 text-sm">Tidak ada data kehadiran.</p>
                )}
              </div>

              {/* Top Task */}
              <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Top 1 Karyawan Task
                </h3>

                {TopUserTask ? (
                  <Card
                    avatar="https://img.freepik.com/premium-photo/3d-character-avatar_113255-5300.jpg"
                    name={TopUserTask.fullname}
                    fullname={`Task ${TopUserTask.count} kali`}
                  />
                ) : (
                  <p className="text-gray-500 text-sm">Tidak ada data task.</p>
                )}
              </div>

            </div>
          </div>
        </div>


        {/* Recent Activity / Table */}
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h3>

                  <Table
                      columns={columns}
                      data={task_assignments.map(item => ({
                          id: item.id,
                          user_fullname: item.user?.fullname || "-",
                          nama_task: item.task?.title || "-",
                          deskripsi: item.task?.description || "-",
                          status: item.task?.status || "-",
                          ruang: item.room?.name || "-"
                      }))}
                  />

        </div>
      </div>
    </div>
  );
};

export default HomePage;
