import axios from 'axios';
import { apiClient } from './api';

export interface ClassDTO {
  id?: number;
  className: string;
  department: string;
  year: number;
  semester: number;
  section: string;
  active?: boolean;
}

export const classService = {
  // Get all classes
  getAll: async () => {
    try {
      const response = await apiClient.get('/admin/classes');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  // Get class by ID
  getById: async (id: number) => {
    try {
      const response = await apiClient.get(`/admin/classes/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching class:', error);
      throw error;
    }
  },

  // Get classes by department
  getByDepartment: async (department: string) => {
    try {
      const response = await apiClient.get(`/admin/classes/department/${department}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching classes by department:', error);
      throw error;
    }
  },

  // Get classes by department and year
  getByDepartmentAndYear: async (department: string, year: number) => {
    try {
      const response = await apiClient.get(`/admin/classes/department/${department}/year/${year}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  // Create new class
  create: async (classData: ClassDTO) => {
    try {
      const response = await apiClient.post('/admin/classes', classData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  },

  // Update class
  update: async (id: number, classData: ClassDTO) => {
    try {
      const response = await apiClient.put(`/admin/classes/${id}`, classData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  },

  // Delete class
  delete: async (id: number) => {
    try {
      await apiClient.delete(`/admin/classes/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  },

  // Check if class exists
  checkExists: async (classData: ClassDTO) => {
    try {
      const response = await apiClient.post('/admin/classes/check-exists', classData);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking class:', error);
      throw error;
    }
  }
};
