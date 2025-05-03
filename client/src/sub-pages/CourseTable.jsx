import React, { useState, useEffect } from "react";
import moment from "moment";
import {
  FaSort,
  FaTrash,
  FaArchive,
  FaUndo,
  FaLockOpen,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaEdit,
  FaSpinner,
} from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";
import courseApi from "../api/courseApi";
import { showToast } from "../utils/toastNotifications";
import {
  MdKeyboardDoubleArrowRight,
  MdKeyboardDoubleArrowLeft,
} from "react-icons/md";
import SkeletonTableLoader from "../helper/SkeletonTableLoader";
import Dialog from "../components/Dialog";
import {
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineStatusOnline,
} from "react-icons/hi";
import { FiHash, FiBookOpen } from "react-icons/fi";
import CourseFormModal from "../Modal/CourseFormModal";

const sortableColumns = {
  "#": false,
  courseName: true,
  acronym: true,
  createdAt: true,
  status: false,
  actions: false,
};

const CourseTable = () => {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });
  const [sortConfig, setSortConfig] = useState({
    sortBy: "createdAt",
    sortOrder: "asc",
  });
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [expandedRows, setExpandedRows] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    action: null,
    courseId: null,
    courseName: null,
    title: "",
    description: "",
  });

  const fetchData = async () => {
    try {
      const response = await courseApi.getAllCourses(
        pagination.currentPage,
        pagination.limit,
        keyword,
        sortConfig.sortBy || "createdAt",
        sortConfig.sortOrder,
        status
      );
      console.log("Response:", response);
      setCourses(response.data);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalItems: response.totalItems,
        limit: pagination.limit,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Error fetching data", "error");
    } finally {
      if (isInitialLoad) {
        setTimeout(() => {
          setLoading(false);
          setIsInitialLoad(false);
        }, 1000);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    setIsInitialLoad(true);
    fetchData();
  }, [pagination.currentPage, sortConfig, keyword, status]);

  const handleSort = (field) => {
    if (!sortableColumns[field]) return;
    setSortConfig((prev) => ({
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortIcon = (field) => {
    if (!sortableColumns[field]) {
      return null;
    }
    if (sortConfig.sortBy === field) {
      return (
        <FaSort
          className={sortConfig.sortOrder === "asc" ? "rotate-180" : ""}
        />
      );
    }
    return <FaSort className="text-gray-400" />;
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleAction = async (action, id, courseName) => {
    setDialogConfig({
      isOpen: true,
      action,
      courseId: id,
      courseName,
      title: `Confirm ${action}`,
      description: `Are you sure you want to ${action} this course? This action cannot be undone.`,
    });
  };

  const confirmAction = async () => {
    try {
      switch (dialogConfig.action) {
        case "delete":
          await courseApi.softDeleteCourse(dialogConfig.courseId);
          showToast("Course deleted successfully", "success");
          break;
        case "archive":
          await courseApi.softArchiveCourse(dialogConfig.courseId);
          showToast("Course archived successfully", "success");
          break;
        case "undoDelete":
          await courseApi.undoDeleteCourse(dialogConfig.courseId);
          showToast("Course restore from delete successful", "success");
          break;
        case "undoArchive":
          await courseApi.undoArchiveCourse(dialogConfig.courseId);
          showToast("Course restored from archive successfully", "success");
          break;
        default:
          break;
      }
      fetchData();
    } catch (error) {
      console.error(`Error performing ${dialogConfig.action}:`, error);
      showToast(`Failed to ${dialogConfig.action} course`, "error");
    } finally {
      setDialogConfig({ ...dialogConfig, isOpen: false });
    }
  };

  const cancelAction = () => {
    setDialogConfig({ ...dialogConfig, isOpen: false });
  };

  const toggleRow = (courseId) => {
    setExpandedRows((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const ExpandedRowContent = ({ course }) => (
    <tr className="bg-transparent">
      <td colSpan="7" className="px-6 py-4">
        <div className="rounded-2xl shadow-md bg-white p-6 space-y-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <span className="text-4xl">Course Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-sm">
            <div className="flex items-start space-x-2">
              <HiOutlineDocumentText className="mt-1 text-blue-500" />
              <span>
                <strong>Course Description:</strong> {course.courseDescription}
              </span>
            </div>

            <div className="flex items-start space-x-2">
              <FiHash className="mt-1 text-purple-500" />
              <span>
                <strong>Acronym:</strong> {course.acronym}
              </span>
            </div>

            <div className="flex items-start space-x-2 sm:col-span-2">
              <FiBookOpen className="mt-1 text-green-600" />
              <div>
                <strong>Subjects:</strong>
                <ul className="list-disc list-inside ml-5 mt-1 space-y-1">
                  {course.subjectInfo.map((subject) => (
                    <li key={subject._id}>
                      <span className="font-medium">{subject.subjectCode}</span>
                      : {subject.subjectName}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <HiOutlineClock className="mt-1 text-yellow-500" />
              <span>
                <strong>Created At:</strong>{" "}
                {moment(course.createdAt).format("MMMM D, YYYY h:mm A")}
              </span>
            </div>

            <div className="flex items-start space-x-2">
              <HiOutlineRefresh className="mt-1 text-orange-500" />
              <span>
                <strong>Updated At:</strong>{" "}
                {moment(course.updatedAt).format("MMMM D, YYYY h:mm A")}
              </span>
            </div>

            <div className="flex items-start space-x-2">
              <HiOutlineStatusOnline
                className={`mt-1 ${
                  course.status.isDeleted
                    ? "text-red-500"
                    : course.status.isArchived
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              />
              <span>
                <strong>Status:</strong>{" "}
                {course.status.isDeleted
                  ? "Deleted"
                  : course.status.isArchived
                  ? "Archived"
                  : "Active"}
              </span>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className=" mx-auto px-4 py-8 overflow-scroll m-2">
      <h2 className="text-2xl mb-2 font-bold">All Course</h2>

      <div className="flex items-center mb-4 space-x-2">
        <input
          type="text"
          placeholder="Search by keyword"
          className="px-4 py-2 border rounded-md"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded-r-md ml-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="isDeleted">Deleted</option>
          <option value="isArchived">Archived</option>
        </select>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
        >
          <FaPlus />
          <span className="max-md:hidden">Create Course</span>
        </button>
        <button
          onClick={() => fetchData()}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
        >
          <FiRefreshCcw />
          <span className="max-md:hidden">Fetch Latest</span>
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 text-[0.7rem]">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {[
                "Expand",
                "#",
                "courseName",
                "acronym",
                "created At",
                "status",
                "actions",
              ].map((header) => (
                <th key={header} className="px-6 py-4">
                  <div className="flex items-center gap-2 text-center">
                    {header.charAt(0).toUpperCase() + header.slice(1)}
                    <button
                      onClick={() => handleSort(header)}
                      disabled={!sortableColumns[header]}
                    >
                      {renderSortIcon(header)}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {loading ? (
            <SkeletonTableLoader rows={10} columns={7} duration={1.5} />
          ) : (
            <tbody>
              {Array.isArray(courses) &&
                courses.map((course, index) => (
                  <React.Fragment key={course._id}>
                    <tr className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 w-12">
                        <button
                          onClick={() => toggleRow(course._id)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          {expandedRows.includes(course._id) ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-4 text-center">{index + 1}</td>
                      <td className="responsive-td">{course.courseName}</td>
                      <td className="responsive-td">{`${course.acronym} `}</td>
                      <td className="responsive-td">
                        {moment(course.createdAt).format("MMM DD, YYYY")}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            course.status.isDeleted
                              ? "bg-red-100 text-red-800"
                              : course.status.isArchived
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {course.status.isDeleted
                            ? "Deleted"
                            : course.status.isArchived
                            ? "Archived"
                            : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <>
                          {!course.status.isDeleted &&
                            !course.status.isArchived && (
                              <button
                                onClick={() => setIsEditModalOpen(course)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                            )}
                          {!course.status.isDeleted &&
                            !course.status.isArchived && (
                              <>
                                <button
                                  onClick={() =>
                                    handleAction("delete", course._id)
                                  }
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                                <button
                                  onClick={() =>
                                    handleAction("archive", course._id)
                                  }
                                  className="text-yellow-600 hover:text-yellow-800"
                                  title="Archive"
                                >
                                  <FaArchive />
                                </button>
                              </>
                            )}
                          {(course.status.isDeleted ||
                            course.status.isArchived) && (
                            <button
                              onClick={() =>
                                handleAction(
                                  course.status.isDeleted
                                    ? "undoDelete"
                                    : "undoArchive",
                                  course._id
                                )
                              }
                              className="text-green-600 hover:text-green-800"
                              title="Undo"
                            >
                              <FaUndo />
                            </button>
                          )}
                        </>
                      </td>
                    </tr>
                    {expandedRows.includes(course._id) && (
                      <ExpandedRowContent course={course} />
                    )}
                  </React.Fragment>
                ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
          {Math.min(
            pagination.currentPage * pagination.limit,
            pagination.totalItems
          )}{" "}
          of {pagination.totalItems} entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <span className="px-4 py-2">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            <MdKeyboardDoubleArrowRight />
          </button>
        </div>
      </div>

      <CourseFormModal
        open={isCreateModalOpen}
        close={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
        mode="add"
      />
      <CourseFormModal
        open={!!isEditModalOpen}
        close={() => setIsEditModalOpen(null)}
        onSuccess={fetchData}
        initialData={isEditModalOpen}
        mode="edit"
      />

      <Dialog
        isOpen={dialogConfig.isOpen}
        title={dialogConfig.title}
        description={dialogConfig.description}
        onConfirm={confirmAction}
        onCancel={cancelAction}
      />
    </div>
  );
};

export default CourseTable;
