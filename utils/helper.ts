// Converts seconds to a readable format
export const formatTimestamp = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds();
    if (hh) {
        return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    }
    return `${mm}:${String(ss).padStart(2, "0")}`;
}