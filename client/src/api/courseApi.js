import axios from "axios";
import { API_BASE_URL } from "./config.js";

const courseApi = {
  getAllCourses: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    status = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/course/get-all`, {
      params: { page, limit, keyword, sortBy, sortOrder, status },
      withCredentials: true,
    });
    return response.data;
  },

  createCourse: async (courseData) => {
    return axios.post(`${API_BASE_URL}/course/create`, courseData, {
      withCredentials: true,
    });
  },

  updateCourse: async (id, courseData) => {
    return axios.patch(`${API_BASE_URL}/course/update/${id}`, courseData, {
      withCredentials: true,
    });
  },

  deleteCourse: async (id) => {
    return axios.delete(`${API_BASE_URL}/course/delete/${id}`, {
      withCredentials: true,
    });
  },

  softDeleteCourse: async (id) => {
    return axios.post(
      `${API_BASE_URL}/course/soft-delete/${id}`,
      {},
      {
        withCredentials: true,
      }
    );
  },

  softArchiveCourse: async (id) => {
    return axios.post(
      `${API_BASE_URL}/course/soft-archive/${id}`,
      {},
      {
        withCredentials: true,
      }
    );
  },

  undoDeleteCourse: async (id) => {
    return axios.post(
      `${API_BASE_URL}/course/undo-delete/${id}`,
      {},
      {
        withCredentials: true,
      }
    );
  },

  undoArchiveCourse: async (id) => {
    return axios.post(
      `${API_BASE_URL}/course/undo-archive/${id}`,
      {},
      {
        withCredentials: true,
      }
    );
  },
};

export default courseApi;
