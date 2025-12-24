import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import axios from "axios";
import API from "../../api/API";
import Table from "../../components/table";
import ExportExcelBtn from "../../components/ExportExcelBtn";
import Modal from "../../components/modal";
import { ToastContainer, toast } from "react-toastify";
import { Trash, UserCheck } from "lucide-react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


const Attendances = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDetailRequest, setSelectedDetailRequest] = useState(null);
  const [DetailModalRequest, setDetailModalRequest] = useState(false);
  const [attendances, setAttendances] = useState([]);
  const [roomMemberships, setRoomMemberships] = useState([]);
  const [formData, setFormData] = useState({
    user_id: "",
    id: null,
    status: "present",
    note: "",
    check_in: new Date().toISOString(),
    check_out: null,
    room_id: null,
  });
  const [roomStats, setRoomStats] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [attendanceRequest, setAttendanceRequest] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedMonthAttendance, setSelectedMonthAttendance] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const getFullname = (userId) =>
    users.find(u => u.id === userId)?.fullname || "Unknown User";



  
  // ========================= FETCH FUNCTIONS =========================
  const fetchAttendances = async () => {
    try {
      const res = await axios.get(API + "attendances");
      setAttendances(res.data);
      calculateAttendancePercentage(res.data, selectedMonth);
    } catch (error) {
      console.error("Error fetching attendances:", error);
    }
  };

  const fetchAttendanceRequests = async () => {
    try {
      const res = await axios.get(API + "attendance_requests");
      const pendingOnly = res.data.filter(request => request.status === "pending");
      console.log("Pending Requests:", pendingOnly); // Debug: cek data request
      setAttendanceRequest(pendingOnly);
    } catch (error) {
      console.error("Error fetching attendance requests:", error);
    }
  };

  const fetchRoomMemberships = async () => {
    try {
      const res = await axios.get(API + "room_membership");
      setRoomMemberships(res.data);
    } catch (err) {
      console.error(err);
    }
  };


  const fetchRooms = async () => {
    try {
      const res = await axios.get(API + "rooms");
      setRooms(res.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API + "users");
      setUsers(res.data);
      console.log("USERS DATA:", res.data); // Debug: cek struktur user
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // ========================= CALCULATE ROOM STATS =========================
  const calculateAttendancePercentage = (data, monthfilter) => {
    const stats = {};
    const [year, month] = monthfilter.split("-");

    const filteredData = data.filter((item) => {
      const checkinDate = new Date(item.check_in);
      return (
        checkinDate.getFullYear() === parseInt(year) &&
        checkinDate.getMonth() + 1 === parseInt(month)
      );
    });

    filteredData.forEach((item) => {
      const room = item.room?.name || "Room Tidak Tersedia";
      if (!stats[room]) stats[room] = { present: 0, total: 0 };
      stats[room].total += 1;
      if (item.status === "present") stats[room].present += 1;
    });

    const results = Object.entries(stats).map(([room, stat]) => ({
      room,
      percentage: ((stat.present / stat.total) * 100).toFixed(1),
    }));

    setRoomStats(results);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handeleBtnEdit = (attendance, user) => {

    const userId = attendance?.user?.id ?? user?.id;

    // Room SELALU dari membership, bukan dari attendance
    let roomId = null;

    // Prioritas 1: dari user.room_membership
    if (user?.room_membership?.room?.id) {
      roomId = user.room_membership.room.id;
    }
    // Prioritas 2: fallback dari attendance.room (jika ada)
    else if (attendance?.room?.id) {
      roomId = attendance.room.id;
    }
    // Prioritas 3: fallback dari attendance manapun user ini
    else {
      const userAnyAttendance = attendances.find(att => att.user?.id === userId);
      if (userAnyAttendance?.room?.id) {
        roomId = userAnyAttendance.room.id;
      }
    }

    console.log("Edit button clicked - User:", user.fullname, "Room ID:", roomId); // Debug

    // Pastikan status valid, tidak boleh 'no_details'
    let validStatus = attendance?.status ?? "present";
    if (validStatus === "no_details" || !validStatus) {
      validStatus = "present";
    }

    setFormData({
      id: attendance?.id ?? null,
      status: validStatus,
      note: attendance?.note ?? "",
      user_id: userId,
      room_id: roomId,
      check_in: attendance?.check_in ?? new Date().toISOString(),
      check_out: attendance?.check_out ?? null,
    });

    setIsModalOpen(true);
  };

  const handleBtnDelete = (attendanceId) => {
    setFormData({ ...formData, id: attendanceId });
    setIsDeleteModalOpen(true);
  };

  const handleBtnDetail = (request) => {
    setSelectedDetailRequest(request);
    setDetailModalRequest(true);
  }

  async function handleAproveRequest (e, requestId) {
    e.preventDefault();
    try {
      await axios.post(API + "attendance_requests/" + requestId + "/approve");
      toast.success("Request approved successfully");
      setDetailModalRequest(false);
      fetchAttendanceRequests();
      fetchAttendances();
    } catch (err) {
      console.log(err);
      toast.error("Failed to approve request");
    }
  }

  async function handleRejectRequest (e, requestId) {
    e.preventDefault();
    try {
      await axios.post(API + "attendance_requests/" + requestId + "/reject");
      toast.success("Request rejected successfully");
      setDetailModalRequest(false);
      fetchAttendanceRequests();
      fetchAttendances();
    } catch (err) {
      console.log(err);
      toast.error("Failed to reject request");
    }
  }
  // ========================= HANDLE EDIT SUBMIT =========================
  async function handleSubmitEdit(e) {
    e.preventDefault();

    try {
      if (formData.id) {
        // UPDATE
        await axios.put(API + "attendance/" + formData.id, {
          status: formData.status,
          note: formData.note,
          check_in: formData.check_in,
          check_out: formData.check_out
        });

        toast.success("Updated successfully");
      }

      else {
        // Validasi room_id sebelum submit
        if (!formData.room_id) {
          toast.error("Room ID tidak ditemukan. Pastikan user memiliki room membership.");
          return;
        }

        await axios.post(API + "attendance", {
          user_id: formData.user_id,
          room_id: formData.room_id,
          check_in: new Date().toISOString(),
          status: formData.status,
          note: formData.note
        });

        toast.success("Created successfully");
      }

      setIsModalOpen(false);
      fetchAttendances();
    } catch (err) {
      console.log(err);
      console.log({
        room_id: formData.room_id,
        status: formData.status,
      });

      console.log(JSON.stringify(err.response?.data, null, 2));

      toast.error("Failed to submit attendance");
    }
  }

  const handleDelete= async () => {
    try {
      await axios.delete(API + "attendance/" + formData.id);
      setIsDeleteModalOpen(false);
      fetchAttendances();
      toast.success("Deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete attendance");
    }
  };



  // ========================= HOOKS =========================
  useEffect(() => {
    fetchAttendanceRequests();
    fetchAttendances();
    fetchRooms();
    fetchUsers();
    fetchRoomMemberships();
  }, []);

  useEffect(() => {
    if (attendances.length > 0) {
      calculateAttendancePercentage(attendances, selectedMonth);
    }
  }, [selectedMonth]);

  // ========================= TABEL DATA =========================
  const columns = ["Nama Karyawan", "Ruang", "Tanggal", "Status", "Notes", "Action"];

  const tableData = users.map(user => {
    // Cari semua room membership untuk user ini
    const memberships = roomMemberships.filter(rm => rm.user.id === user.id);

    // Ambil room sesuai selectedRoom atau fallback ke yang pertama
    let membership = memberships.find(m => m.room.name === selectedRoom) || memberships[0];

    const userRooms = memberships
      .filter((m) => m.user?.id === user.id)
      .map((m) => m.room?.name);

    const roomName = userRooms.length > 0 ? userRooms.join(", ") : "-";


    // Cari attendance user untuk tanggal yang dipilih
    const userAttendances = attendances.filter(
      att => att.user?.id === user.id && att.attendance_date?.slice(0, 10) === selectedDate
    );

    let status = "no details";
    let displayNote = "-";
    let displayDate = "-";

    if (userAttendances.length > 0) {
      const att = userAttendances[0];
      status = att.status;
      displayNote = att.note || "-";
      if (userAttendances.length > 0) {
        const att = userAttendances[0];
        status = att.status;
        displayNote = att.note || "-";

        if (att.attendance_date) {
          const dateObj = new Date(att.attendance_date);
          displayDate = `${String(dateObj.getDate()).padStart(2, "0")}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${dateObj.getFullYear()}`;
        } else {
          displayDate = "-";
        }
      }

    }

    const statusColor =
      status === "present" ? "text-green-600 font-semibold" :
        status === "absent" ? "text-red-600 font-semibold" :
          status === "late" ? "text-yellow-600 font-semibold" :
            status === "on_leave" ? "text-blue-600 font-semibold" :
              "text-gray-500";
    
    

    return [
      user.fullname,
      roomName,
      displayDate,
      <span className={statusColor}>{status}</span>,
      displayNote,
      <div className="flex space-x-4">
        <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded mr-2"
          onClick={() => handeleBtnEdit(userAttendances[0], user)}>
          <UserCheck size={16} />
        </button>
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded mr-2"
          onClick={() => handleBtnDelete(userAttendances[0]?.id)}>
          <Trash size={16} />
        </button>
      </div>
    ];
  })
    .filter(row => !selectedRoom || row[1] === selectedRoom);




  // ========================= RENDER =========================
  return (
    <>
      <ToastContainer />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="p-7  flex-1 flex flex-col max-h-screen overflow-y-auto">
          {/* =================== SECTION 1: Persentase Kehadiran =================== */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h1 className="text-xl font-bold mb-4 border-b pb-2">Persentase Kehadiran Per Ruangan</h1>
            <div className="mb-4 flex items-center justify-end">
              <label className="font-medium mr-2">Pilih Bulan:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>

           

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roomStats.map((stat, index) => {
                // 1. Ambil jumlah karyawan unik per ruangan
                const uniqueUsersInRoom = new Set(
                  roomMemberships
                    .filter(rm => rm.room.name === stat.room)
                    .map(rm => rm.user.id)
                );
                const totalEmployees = uniqueUsersInRoom.size;

                // 2. Hitung jumlah yang hadir (present) per user unik
                const attendedUsers = new Set(
                  attendances
                    .filter(att =>
                      att.room?.name === stat.room &&
                      att.status === "present" &&
                      new Date(att.attendance_date).getMonth() + 1 === parseInt(selectedMonth.split("-")[1]) &&
                      new Date(att.attendance_date).getFullYear() === parseInt(selectedMonth.split("-")[0])
                    )
                    .map(att => att.user.id)
                );
                const presentEmployees = attendedUsers.size;

                return (
                  <div key={index} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                    {/* Teks kiri */}
                    <div className="flex flex-col col-span-2 ">
                      <div className="flex items-center space-x-2 mb-1">
                        <UserCheck size={20} className="text-green-600" />
                        <h2 className="text-lg font-semibold uppercase">{stat.room}</h2>
                      </div>
                      <p className="text-gray-700 font-medium">
                        Hadir {presentEmployees} dari {totalEmployees} karyawan
                      </p>
                    </div>

                    {/* Persentase kanan */}
                    <div style={{ width: 60, height: 60 }}>
                      <CircularProgressbar
                        value={parseFloat(stat.percentage)}
                        text={`${stat.percentage}%`}
                        styles={buildStyles({
                          textSize: '14px',
                          pathColor: `rgba(62, 152, 199, ${stat.percentage / 100})`,
                          textColor: '#1A202C',
                          trailColor: '#E2E8F0',
                        })}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-6 bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Request Tidak Hadir</h2>
              <div>
                
                {attendanceRequest.length === 0 ? (
                  <p className="text-gray-600">Tidak ada request tidak hadir.</p>
                ) : (
                  <ul className="flex gap-3  mt-3 ">
                    
                    {attendanceRequest.map((request) => (
                      <div key={request.id} className="mb-4 p-3 bg-gray-100 rounded flex flex-col items-center">
                       
                          <span className="text-gray-600">{getFullname(request.user_id)}</span> meminta tidak hadir pada tanggal{" "}
                          <span className="font-medium">
                          {new Date(request.request_date).toLocaleDateString("id-ID")}
                          </span>
                        <div>
                          <button className="px-3 py-1 bg-blue-500 text-white rounded mt-2  hover:bg-blue-700" onClick={() => handleBtnDetail(request)}>
                            <span >Detail</span>
                          </button>
                        </div>
                       
                      </div>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* =================== SECTION 2: Data Absensi Karyawan =================== */}
          <div className="bg-white p-6 mt-4 rounded-lg shadow-md">
            <h1 className="text-xl font-bold mb-4 border-b pb-2">Data Absensi Karyawan</h1>

            {/* Filter controls */}
            <div className="mb-4 flex space-x-4 justify-end">
              <div>
                <label className="font-medium mr-2">Pilih Tanggal:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div>
                <label className="font-medium mr-2">Pilih Room:</label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                >
                  <option value="">Semua</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.name}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
              <ExportExcelBtn data={tableData.map(row => (
                {
                  Nama_Karyawan: row[0],
                  Ruang: row[1],
                  Tanggal: row[2],
                  Status: row[3].props.children
                }
              ))}
                filename="Attendances.xlsx"
              />
            </div>

            {/* Table */}
            <Table columns={columns} data={tableData}

            />
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} title="Detail Absensi" onClose={() => { }}>
        <form onSubmit={handleSubmitEdit}>
          <div className="mb-4">
            <label className="block text-white font-bold mb-2">Status:</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2 text-black" value={formData.status} name="status" onChange={handleChange} required>
              <option value="present">Hadir</option>
              <option value="absent">Tidak Hadir</option>
              <option value="late">Terlambat</option>
              <option value="on_leave">Cuti</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-white font-bold mb-2">Catatan:</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              value={formData.note || ''}
              name="note"
              onChange={handleChange}
              rows="3"
              placeholder="Tambahkan catatan (opsional)"
            />
          </div>
          <input type="hidden" name="room_id" value={formData.room_id} />

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Simpan
            </button>
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </button>
          </div>
        </form>

      </Modal>

      <Modal isOpen={isDeleteModalOpen} title="Konfirmasi Hapus" onClose={() => { }}>
        <div className="mb-4">
          <p>Apakah Anda yakin ingin menghapus data absensi ini?</p>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
            onClick={handleDelete}
          >
            Hapus
          </button>
          <button
            type="button"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Batal
          </button>
        </div>
      </Modal>

      <Modal isOpen={DetailModalRequest} title="Detail Request Tidak Hadir" onClose={()=> setDetailModalRequest(false) }>
        {selectedDetailRequest && (
          <div className="mb-4">
            <div className="mb-4">
              <label className="block text-white font-bold mb-2">Dokumen:</label>
              <img src={selectedDetailRequest.file_proof} alt="" className="w-32 h-32 object-cover mb-4" />
            </div>
            <div className="mb-4">
              <label className="block text-white font-bold mb-2">Nama Karyawan:</label>
              <p>
                {getFullname(selectedDetailRequest.user_id)}

              </p>
            </div>
            <div className="mb-4">
              <label className="block text-white font-bold mb-2">Tanggal Izin:</label>
              <p>
                {new Date(selectedDetailRequest.request_date).toLocaleDateString("id-ID")}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-white font-bold mb-2">Tipe Izin:</label>
              <p>
                {selectedDetailRequest.request_type}
              </p>
            </div>
            <div className="mb-4">
              <div className="mt-4">
                <label className="block text-white font-bold mb-2">Keterangan:</label>
                <p>
                  {selectedDetailRequest.reason}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" onClick={() => setDetailModalRequest(false)}>
                Batal
              </button>
              <button type="button" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
                onClick={(e) => handleAproveRequest(e, selectedDetailRequest.id)}>
                Setujui
              </button>
              <button type="button" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2" onClick={(e) => handleRejectRequest(e,selectedDetailRequest.id)}>
                Tolak
              </button>
            </div>
          </div>
        )}
     
      </Modal>
    </>
  );
};

export default Attendances;