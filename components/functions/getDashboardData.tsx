import api from "@/lib/api";
import Cookies from "js-cookie";

const getDashboardData = async () => {
    const token = Cookies.get('token');
    const response = await api.get('hr/getHrDashboardWithAttendance', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

export default getDashboardData;