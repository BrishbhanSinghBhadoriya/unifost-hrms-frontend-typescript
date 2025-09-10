// Simple authentication utility for direct backend calls
  import axios from 'axios';
  import Cookies from "js-cookie";


export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  department: string;
  phone?: string;
  gender?: string;
  designation?: string;
  profilePicture?: string;
  dateOfBirth?: string;
  // Extended fields from employee schema
  isAdmin?: boolean;
  isManager?: boolean;
  isHR?: boolean;
  isEmployee?: boolean;
  isActive?: boolean;
  employeeId?: string;
  bankAccountType?: string;
  country?: string;
  lastLogin?: string;
  achievements?: string[];
  certifications?: string[];
  skills?: string[];
  salary?: number;
  address?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export const authService = {
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
           dateOfBirth:userData.user.dob,
           isAdmin: userData.user.isAdmin,
           isManager: userData.user.isManager,
           isHR: userData.user.isHR,
           isEmployee: userData.user.isEmployee,
           isActive: userData.user.isActive,
           employeeId: userData.user.employeeId,
           bankAccountType: userData.user.bankAccountType,
           country: userData.user.country,
           lastLogin: userData.user.lastLogin,
           achievements: userData.user.achievements,
           certifications: userData.user.certifications,
           skills: userData.user.skills,
           salary: userData.user.salary,
           address: userData.user.address,
         };

      

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', userData.token);
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
      console.error('💥 Login API error:', error);
      console.error('💥 Error response:', error.response);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error occurred'
      };
    }
  },

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    try { Cookies.remove('token'); } catch {}
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
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
      console.error('💥 Employee update error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update employee'
      };
    }
  }
};