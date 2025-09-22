import { Employee } from "@/lib/types";
import Cookies from "js-cookie";
import api from "@/lib/api";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  department?: string;
  status?: string;
}

export interface PaginationResponse {
  success: boolean;
  data: Employee[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEmployees: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  message: string;
}

export const fetchEmployees = async (params: PaginationParams = {}): Promise<PaginationResponse> => {
    const token = Cookies.get('token');
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.search) queryParams.append('search', params.search);
    if (params.department) queryParams.append('department', params.department);
    if (params.status) queryParams.append('status', params.status);

    const response = await api.get(`/hr/getEmployees?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Allemployeedata:', response.data);
    console.log('Query Params:', queryParams.toString());
    
    return response.data as PaginationResponse;
  };

// Legacy function for backward compatibility
export const fetchAllEmployees = async (): Promise<Employee[]> => {
    const response = await fetchEmployees({ limit: 1000 }); // Get all employees
    return response.data;
  };

  export const deleteEmployee = async (userId: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    const token = Cookies.get('token');
    const response = await api.delete(`/hr/deleteEmployee/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  };