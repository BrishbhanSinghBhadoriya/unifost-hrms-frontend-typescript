// Simple authentication utility for direct backend calls
  import axios from 'axios';
  import Cookies from "js-cookie";
  import { toast } from 'sonner';
  import {User} from "@/lib/types"
  import type { AxiosError } from 'axios';




export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export const authService = {
  // Centralized session expiry handling
  handleSessionExpired(message?: string) {
    try {
      toast.error('Your session is expired. Please login again');
    } catch {}
    try { this.logout(); } catch {}
    try { window.location.href = '/login'; } catch {}
  },

  isTokenExpiredError(errOrBody: any): boolean {
    if (!errOrBody) return false;
    const msg: string | undefined = errOrBody?.response?.data?.message || errOrBody?.message || errOrBody?.error || errOrBody?.msg || errOrBody?.Message || errOrBody?.MessageText || errOrBody?.data?.message;
    const status = errOrBody?.response?.status || errOrBody?.status;
    if (status === 401) return true;
    if (typeof msg === 'string' && msg.toLowerCase().includes('token expired')) return true;
    if (typeof errOrBody?.message === 'string' && errOrBody.message.toLowerCase().includes('token expired')) return true;
    return false;
  },

  async login(username: string, password: string): Promise<LoginResponse> {
    
    try {
      console.log(' Making API call to:', `${BACKEND_URL}/users/login`);
      
        const response = await axios.post(`${BACKEND_URL}users/login`, {
        username,
        password,
      });
      


      if (response.status >= 200 && response.status < 300) {
        const userData = response.data;
        console.log('👤 User data received:', userData);
        console.log('📄 Documents data:', userData.user?.documents);

        console.log(userData)
        
          const user: User = {
          id: userData.user._id,
          username: userData.user.username,
          email: userData.user.email,
          name: userData.user.name,
          role: userData.user.role,
          department: userData.user.department,
          phone: userData.user.phone,
          gender: userData.user.gender,
          designation: userData.user.designation,
          profilePicture: userData.user.profilePicture,
          dob:userData.user.dob,
          fatherName: userData.user.fatherName,
          bloodGroup: userData.user.bloodGroup,
          professionalEmailId:userData.user.professionalEmailId,
          emergencyContactNo:userData.user.emergencyContactNo,
          isAdmin: userData.user.isAdmin,
          isManager: userData.user.isManager,
          isHR: userData.user.isHR,
          isEmployee: userData.user.isEmployee,
          isActive: userData.user.isActive,
          employeeId: userData.user.employeeId,
          workMode: userData.user.workMode,
          lastLogin: userData.user.lastLogin,
          jobType: userData.user.jobType,
          reportingTo: userData.user.reportingTo,
          joiningDate: userData.user.joiningDate,
          skills: userData.user.skills,
          salary: userData.user.salary,
          address: userData.user.address,
          documents: userData.user.documents,
          experience: userData.user.experience,
          education: userData.user.education,
          bankDetails: userData.user.bankDetails,
        };

     

        localStorage.setItem('user', JSON.stringify(user));
        try {
          Cookies.set('token', userData.token, { expires: 7, sameSite: 'Lax' });
        } catch {}
        
        return {
          success: true,
          user
        };
      } else {
        console.log('❌ Non-200 response:', response.status);
        return {
          success: false,
          message: 'Login failed'
        };
      }
    } catch (error: any) {
      // Do NOT treat login failures (401) as session-expired redirects; just return failure
      console.error('💥 Login API error:', error);
      console.error('💥 Error response:', error.response);
      const axiosErr = error as AxiosError<{ message?: string }>; 
      toast.error(axiosErr?.response?.data?.message || (error as any)?.message || 'Login failed');      return {
        success: false,
        message: error.response?.data?.message || 'Network error occurred'
      };
    }
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const logoutResult = await axios.post(`${BACKEND_URL}users/logout`);

      if (logoutResult.status >= 200 && logoutResult.status < 300) {
        // Local cleanup
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        try { Cookies.remove("token"); } catch {}

        return { success: true, message: "Logged out successfully" };
      } else {
        return { success: false, message: "Failed to logout" };
      }
    } catch (error: any) {
      const axiosErr = error as AxiosError<{ message?: string }>;
      return {
        success: false,
        message:
          axiosErr?.response?.data?.message ||
          (error as any)?.message ||
          "Logout failed",
      };
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return Cookies.get('token') || null;
  },

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  },

  async uploadProfilePicture(file: File): Promise<{ success: boolean; profilePicture?: string; message?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${BACKEND_URL}upload/profile-picture`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status >= 200 && response.status < 300) {
        // Accept multiple shapes
        const body: any = response.data ?? {};
        const data = body.data ?? body;
        let profilePicture: string | undefined =
          data?.user?.profilePicture ||
          data?.imageUrl ||
          body?.imageUrl ||
          body?.profilePicture ||
          body?.url;
         
        // Normalize to absolute URL if backend returns a relative path
        if (profilePicture && !/^https?:\/\//i.test(profilePicture)) {
          const trimmed = profilePicture.replace(/^\/+/, '');
          profilePicture = `${BACKEND_URL}/${trimmed}`;
        }
        
        if (!profilePicture) {
          return { success: false, message: 'No image URL returned' };
        }

        // Update the stored user data with new profile picture
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          if (profilePicture) {
            currentUser.profilePicture = profilePicture;
          }
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
        
        return { success: true, profilePicture };
      } else {
        return { success: false, message: 'Failed to upload profile picture' };
      }
    } catch (error: any) {
      if (this.isTokenExpiredError(error)) {
        this.handleSessionExpired(error?.response?.data?.message);
      }
      console.error('💥 Profile picture upload error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload profile picture'
      };
    }
  },

  async updateEmployeeProfile(userId: string, updates: Record<string, any>): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const response = await axios.put(`${BACKEND_URL}users/employee/${userId}`, updates, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status >= 200 && response.status < 300) {
        const body: any = response.data ?? {};
        const data = body.data ?? body.user ?? body;
        return { success: true, data };
      }

      return { success: false, message: 'Failed to update employee' };
    } catch (error: any) {
      if (this.isTokenExpiredError(error)) {
        this.handleSessionExpired(error?.response?.data?.message);
      }
      console.error('💥 Employee update error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update employee'
      };
    }
  },
  
  

  async uploadDocument(employeeId: string, documentType: string, file: File) {
    try {
      const formData = new FormData();
      formData.append(documentType, file);

      const response = await fetch(`${BACKEND_URL}upload/document/single/${employeeId}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (response.status === 401) {
        const body = await response.json().catch(() => ({ message: 'Unauthorized' }));
        this.handleSessionExpired(body?.message);
        return { success: false, message: 'Unauthorized' };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        message: 'Document uploaded successfully'
      };
    } catch (error: any) {
      if (this.isTokenExpiredError(error)) {
        this.handleSessionExpired(error?.response?.data?.message);
      }
      console.error('💥 Document upload error:', error);
      return {
        success: false,
        message: error.message || 'Failed to upload document'
      };
    }
  },

  async fetchUserData(userId: string): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const response = await axios.get(`${BACKEND_URL}users/employee/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        const userData = response.data;
        console.log('👤 Fresh user data received:', userData);
        console.log('📄 Documents data:', userData.user?.documents);

        // Get existing user data to preserve local changes
        const existingUser = this.getCurrentUser();
        const existingDocuments = existingUser?.documents || {};

        const user: User = {
          id: userData.user._id || userData.user.id,
          username: userData.user.username,
          email: userData.user.email,
          name: userData.user.name,
          role: userData.user.role,
          department: userData.user.department,
          phone: userData.user.phone,
          gender: userData.user.gender,
          designation: userData.user.designation,
          profilePicture: userData.user.profilePicture,
          dob: userData.user.dob,
          fatherName: userData.user.fatherName,
          bloodGroup: userData.user.bloodGroup,
          professionalEmailId: userData.user.professionalEmailId,
          emergencyContactNo: userData.user.emergencyContactNo,
          isAdmin: userData.user.isAdmin,
          isManager: userData.user.isManager,
          isHR: userData.user.isHR,
          isEmployee: userData.user.isEmployee,
          isActive: userData.user.isActive,
          employeeId: userData.user.employeeId,
          lastLogin: userData.user.lastLogin,
          skills: userData.user.skills,
          salary: userData.user.salary,
          address: userData.user.address,
          // Merge server documents with existing local documents to preserve numbers
          documents: {
            ...existingDocuments,
            ...(userData.user.documents || {}),
          },
        };

        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(user));
        
        return {
          success: true,
          user
        };
      }

      return { success: false, message: 'Failed to fetch user data' };
    } catch (error: any) {
      if (this.isTokenExpiredError(error)) {
        this.handleSessionExpired(error?.response?.data?.message);
      }
      console.error('💥 Fetch user data error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user data'
      };
    }
  }
  
};