import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { FaBook } from 'react-icons/fa';
import courseApi from '../../api/courseApi';

const CourseSelector = ({ onChange }) => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseApi.getAllCourses();
        setCourses(data?.data || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const options = courses.map((course) => ({
    value: course._id,
    label: course.courseName,
    course, // attach full course object
  }));

  const handleChange = (selected) => {
    const course = selected?.course || null;
    setSelectedCourse(course);
    onChange(course);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <label className="mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
        <FaBook className="text-blue-500" />
        Select Course
      </label>
      <Select
        options={options}
        value={selectedCourse ? options.find(opt => opt.value === selectedCourse._id) : null}
        onChange={handleChange}
        isLoading={isLoading}
        placeholder="Choose a course..."
        className="text-sm"
        classNames={{
          control: () => 'border border-gray-300 shadow-sm hover:border-gray-400',
        }}
      />
    </div>
  );
};

export default CourseSelector;
