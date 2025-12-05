import React, { useEffect, useState, useContext } from "react";
import Sidebar from "../../components/sidebar";
import axios from "axios";
import dayjs from "dayjs";
import { UserContext } from "../../components/UserContext";
import API from "../../api/API";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrAfter);

export default function MyAttendance() {
    const { currentUser } = useContext(UserContext);
    const token = localStorage.getItem("token");

    const [attendance, setAttendance] = useState([]);

    // modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [leaveType, setLeaveType] = useState("on_leave");
    const [reason, setReason] = useState("");

    // =====================
    // INIT MONTH FROM JOIN DATE
    // =====================
    const joinMonth = currentUser?.created_at
        ? dayjs(currentUser.created_at)
        : dayjs();

    const [currentMonth, setCurrentMonth] = useState(joinMonth);

    // month limit
    const minMonth = joinMonth.startOf("month");
    const maxMonth = dayjs().startOf("month");

    // =====================
    // FETCH ATTENDANCE
    // =====================
    const fetchAttendance = async () => {
        try {
            const res = await axios.get(API + "my_attendances", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setAttendance(res.data ?? []);
        } catch (err) {
            console.error("API ERROR:", err);
            setAttendance([]);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [token]);

    // =====================
    // MAP DATE -> STATUS
    // =====================
    const attendanceMap = new Map(
        attendance.map(item => [
            dayjs(item.check_in).format("YYYY-MM-DD"),
            item.status,
        ])
    );

    // =====================
    // DATE LOGIC
    // =====================
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");

    const daysInMonth = endOfMonth.date();
    const startDay = startOfMonth.day();

    const today = dayjs().format("YYYY-MM-DD");

    const calendarCells = [];

    for (let i = 0; i < startDay; i++) {
        calendarCells.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        calendarCells.push(
            startOfMonth.date(d).format("YYYY-MM-DD")
        );
    }

    // =====================
    // SUMMARY
    // =====================
    const totalPresent = attendance.filter(i => i.status === "present").length;
    const totalLate = attendance.filter(i => i.status === "late").length;
    const totalLeave = attendance.filter(i => i.status === "on_leave").length;
    const totalAbsent = attendance.filter(i => i.status === "absent").length;

    // =====================
    // CLICK DATE HANDLER
    // =====================
    const handleClickDate = (date, status) => {

        const today = dayjs().startOf('day');
        const targetDate = dayjs(date).startOf('day');

        // ✅ hanya future (besok ke atas)
        const isTodayOrFuture = targetDate.isSameOrAfter(today, 'day');

        // ❌ block: today, past, atau sudah ada status
        if (!isTodayOrFuture || status) return;

        setSelectedDate(date);
        setShowModal(true);
    };


    // =====================
    // SUBMIT IZIN
    // =====================
    const submitLeave = async () => {

        if (!reason.trim()) {
            alert("Alasan wajib diisi!");
            return;
        }

        try {
            await axios.post(API + "request-leave",
                {
                    date: selectedDate,
                    reason,
                    type: leaveType,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            alert("Pengajuan izin berhasil dikirim");

            setShowModal(false);
            setSelectedDate(null);
            setReason("");
            setLeaveType("on_leave");

            fetchAttendance();

        } catch (err) {
            console.error("SUBMIT ERROR:", err);
            alert("Gagal mengajukan izin");
        }
    };

    // =====================
    // STATUS STYLE
    // =====================
    const bgStatus = {
        present: "bg-green-100",
        late: "bg-yellow-100",
        on_leave: "bg-orange-100",
        absent: "bg-red-100",
    };

    const badgeStatus = {
        present: "bg-green-500",
        late: "bg-yellow-500",
        on_leave: "bg-orange-500",
        absent: "bg-red-500",
    };

    const labelStatus = {
        present: "Hadir",
        late: "Terlambat",
        on_leave: "Izin",
        absent: "Tidak Hadir",
    };


    // =====================
    // RENDER
    // =====================
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 p-8 overflow-auto bg-gray-100">

                <h1 className="text-2xl font-bold mb-4">My Attendance</h1>

                {/* ================= SUMMARY ================= */}
                <div className="mb-6 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-medium text-gray-700 mb-3">
                        Rekap Kehadiran
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <SummaryCard title="Hadir" count={totalPresent} color="green" />
                        <SummaryCard title="Terlambat" count={totalLate} color="yellow" />
                        <SummaryCard title="Izin" count={totalLeave} color="orange" />
                        <SummaryCard title="Tidak Hadir" count={totalAbsent} color="red" />
                    </div>
                </div>

                {/* ================= CALENDAR ================= */}
                <div className="bg-white p-6 rounded-xl shadow-lg">

                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            disabled={currentMonth.isSame(minMonth, "month")}
                            onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
                            className={`px-4 py-2 rounded-lg
                                ${currentMonth.isSame(minMonth, "month")
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }
                            `}
                        >
                            ← Prev
                        </button>

                        <h2 className="text-2xl font-bold">
                            {currentMonth.format("MMMM YYYY")}
                        </h2>

                        <button
                            disabled={currentMonth.isSame(maxMonth, "month")}
                            onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
                            className={`px-4 py-2 rounded-lg
                                ${currentMonth.isSame(maxMonth, "month")
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }
                            `}
                        >
                            Next →
                        </button>
                    </div>

                    {/* DAY HEADER */}
                    <div className="grid grid-cols-7 text-center border rounded-t-lg">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                            <div key={d} className="py-3 bg-gray-100 font-semibold border-r last:border-r-0">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* CALENDAR BODY */}
                    <div className="grid grid-cols-7 border-x border-b rounded-b-lg">
                        {calendarCells.map((date, idx) => {

                            if (!date) {
                                return <div key={idx} className="h-20 border-t border-r" />;
                            }

                            const day = dayjs(date).date();
                            const status = attendanceMap.get(date);
                            const isToday = today === date;

                            const isRequestable =
                                dayjs(date).startOf("day")
                                    .isSameOrAfter(dayjs().startOf("day")) &&
                                !status;


                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleClickDate(date, status)}
                                    className={`
                                        h-20 p-2 border-t border-r last:border-r-0 relative transition
                                        ${bgStatus[status] || ""}
                                        ${isToday ? "ring-2 ring-blue-500" : ""}
                                        ${isRequestable ? "cursor-pointer hover:bg-blue-100" : ""}
                                    `}
                                >
                                    <span className="absolute top-2 right-2 text-sm font-bold"> 
                                        {day}
                                    </span>

                                    {status && (
                                        <div className="mt-8 text-center">
                                            <span className={`px-2 py-1 text-xs text-white rounded ${badgeStatus[status]}`}>
                                                {labelStatus[status]}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                </div>

                {/* ================= MODAL ================= */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

                        <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">

                            <h2 className="text-xl font-bold mb-2">
                                Pengajuan Izin
                            </h2>

                            <p className="mb-4 text-gray-600">
                                Tanggal: <b>{dayjs(selectedDate).format("DD MMMM YYYY")}</b>
                            </p>

                            <div className="mb-3">
                                <label>Jenis Izin</label>
                                <select
                                    value={leaveType}
                                    onChange={e => setLeaveType(e.target.value)}
                                    className="w-full border p-2 rounded"
                                >
                                    <option value="on_leave">Izin</option>
                                    <option value="sick">Sakit</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label>Alasan</label>
                                <textarea
                                    rows={3}
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-300 rounded"
                                >
                                    Batal
                                </button>

                                <button
                                    onClick={submitLeave}
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    Kirim
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

/* ================= COMPONENTS ================= */

function SummaryCard({ title, count, color }) {
    const colors = {
        green: "bg-green-100 text-green-800",
        yellow: "bg-yellow-100 text-yellow-800",
        orange: "bg-orange-100 text-orange-800",
        red: "bg-red-100 text-red-800",
    };

    return (
        <div className={`p-4 rounded-lg ${colors[color]}`}>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-2xl font-bold">{count}</p>
        </div>
    );
}
