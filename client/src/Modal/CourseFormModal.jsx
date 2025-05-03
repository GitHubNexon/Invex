import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { showToast } from "../utils/toastNotifications";
import useBase from "../hooks/useBase";
import TextInput from "../components/TextInput";
import Dialog from "../components/Dialog";
import courseApi from "../api/courseApi";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

const CourseFormModal = ({
  open,
  close,
  onSuccess,
  initialData = null,
  mode = "add",
}) => {
  const { base } = useBase();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    courseName: "",
    acronym: "",
    courseDescription: "",
    createdBy:user._id,
    subjectInfo: [
      {
        subjectCode: "",
        subjectName: "",
      },
    ],
    status: {
      isDeleted: false,
      isArchived: false,
    },
  });
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData(initialData);
    }
  }, [initialData, mode]);

  const handleClose = () => {
    setShowCloseDialog(true);
  };

  const handleSubjectChange = (index, e) => {
    const { name, value } = e.target;
    const updatedSubjects = [...formData.subjectInfo];
    updatedSubjects[index][name] = value;
    setFormData((prev) => ({
      ...prev,
      subjectInfo: updatedSubjects,
    }));
  };

  const addSubject = () => {
    setFormData((prev) => ({
      ...prev,
      subjectInfo: [...prev.subjectInfo, { subjectCode: "", subjectName: "" }],
    }));
  };

  const removeSubject = (index) => {
    const updatedSubjects = formData.subjectInfo.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      subjectInfo: updatedSubjects,
    }));
  };

  const confirmClose = () => {
    setShowCloseDialog(false);
    close();
  };

  const handleReset = () => {
    setFormData({
      courseName: "",
      acronym: "",
      courseDescription: "",
      subjectInfo: [
        {
          subjectCode: "",
          subjectName: "",
        },
      ],
      status: {
        isDeleted: false,
        isArchived: false,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === "edit" && initialData) {
        const updateData = { ...formData };
        await courseApi.updateCourse(initialData._id, updateData);
        showToast("Course updated successfully", "success");
        console.log("Course updated successfully", updateData);
      } else {
        await courseApi.createCourse(formData);
        showToast("Course created successfully", "success");
        console.log("Course created successfully", formData);
      }
      onSuccess();
      close();
      handleReset();
    } catch (error) {
      showToast(
        `Failed to ${mode === "edit" ? "update" : "create"} course`,
        "error"
      );
    }
  };
  return (
    <>
      <Modal
        open={open}
        close={handleClose}
        title={mode === "edit" ? "Edit Course" : "Create Course"}
      >
        <form onSubmit={handleSubmit} className="p-6 ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              label="Course Name"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              required
            />
            <TextInput
              label="Acronym"
              name="acronym"
              value={formData.acronym}
              onChange={handleChange}
              required
            />
            <TextInput
              label="Course Description"
              name="courseDescription"
              value={formData.courseDescription}
              onChange={handleChange}
              required
              isArea={true}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-800">Subjects</h3>
            {formData.subjectInfo.map((subject, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end relative border p-4 rounded-md shadow-sm bg-gray-50"
              >
                <TextInput
                  label="Subject Code"
                  name="subjectCode"
                  value={subject.subjectCode}
                  onChange={(e) => handleSubjectChange(index, e)}
                  required
                />
                <TextInput
                  label="Subject Name"
                  name="subjectName"
                  value={subject.subjectName}
                  onChange={(e) => handleSubjectChange(index, e)}
                  required
                />
                <div className="flex items-center justify-start pt-2">
                  <button
                    type="button"
                    onClick={() => removeSubject(index)}
                    disabled={formData.subjectInfo.length === 1}
                    className={`flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition ${
                      formData.subjectInfo.length === 1
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <FiTrash2 className="w-5 h-5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addSubject}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            >
              {mode === "edit" ? "Update Course" : "Create Course"}
            </button>
          </div>
        </form>
        <Dialog
          isOpen={showCloseDialog}
          title="Are you sure?"
          description="Are you sure you want to close without saving?"
          isProceed="Yes, Close"
          isCanceled="Cancel"
          onConfirm={confirmClose}
          onCancel={() => setShowCloseDialog(false)}
        />
      </Modal>
    </>
  );
};

export default CourseFormModal;
