export const formatDate = (date) => {
    if (!date) return "-"; // aman: tidak error ketika null/undefined

    const d = new Date(date);
    if (isNaN(d.getTime())) return "-"; // aman: antisipasi tanggal invalid

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    })
        .format(d)
        .replaceAll("/", "-");
};
