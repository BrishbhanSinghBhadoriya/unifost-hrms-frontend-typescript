import Cookies from "js-cookie";
import api from "@/lib/api";

export const fetchEmployeesAttenedence = async () => {
    const token = Cookies.get('token');
    const response = await api.get('/hr/getAttendance', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
   return response.data.attendance;
  };