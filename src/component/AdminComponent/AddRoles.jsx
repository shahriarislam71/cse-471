import { useState, useEffect } from "react";
import {
  FiPlus,
  FiUsers,
  FiUserPlus,
  FiUserX,
  FiSearch,
  FiX,
  FiClock,
  FiMapPin,
} from "react-icons/fi";
import { FaUserMd } from "react-icons/fa";
import Swal from "sweetalert2";

const AddRoles = () => {
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [programForm, setProgramForm] = useState({
    image: "",
    title: "",
    location: "",
    status: "Ongoing",
  });

  const [volunteers, setVolunteers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [volunteerSearchTerm, setVolunteerSearchTerm] = useState("");
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");

  // Fetch all programs with participant counts
  const fetchProgramsWithCounts = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://health-and-sanitation-backend.vercel.app/calamities");
      const data = await response.json();
      setPrograms(data);
    } catch (err) {
      setError("Failed to fetch programs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramsWithCounts();
  }, []);

  // Fetch participants when a program is selected
  useEffect(() => {
    if (!selectedProgram) return;

    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://health-and-sanitation-backend.vercel.app/calamities/${selectedProgram._id}/participants`
        );
        const data = await response.json();

        setSelectedVolunteers(data.volunteers || []);
        setSelectedDoctors(data.doctors || []);
      } catch (err) {
        setError("Failed to fetch participants");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [selectedProgram]);

  // Fetch available volunteers and doctors
  const fetchAvailableUsers = async (role) => {
    try {
      setLoading(true);

      const endpoint = `https://health-and-sanitation-backend.vercel.app/specific-users?volunteer_type=${
        role === "volunteer" ? "General Volunteer" : "Doctor"
      }${selectedProgram ? `&exclude_program=${selectedProgram._id}` : ""}`;

      const response = await fetch(endpoint);
      const usersData = await response.json();

      if (role === "volunteer") {
        setVolunteers(
          usersData.map((v) => ({
            userId: v._id,
            name: v.name,
            email: v.email,
            specialty: v.specialty || "General Volunteer",
            status: "available",
          }))
        );
      } else {
        setDoctors(
          usersData.map((d) => ({
            userId: d._id,
            name: d.name,
            email: d.email,
            specialty: d.specialty || "Doctor",
            status: "available",
          }))
        );
      }
    } catch (err) {
      setError("Failed to fetch available users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showVolunteerForm) {
      fetchAvailableUsers("volunteer");
    } else if (showDoctorForm) {
      fetchAvailableUsers("doctor");
    }
  }, [showVolunteerForm, showDoctorForm]);

  const handleProgramSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("https://health-and-sanitation-backend.vercel.app/calamities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(programForm),
      });

      const newProgram = await response.json();
      setPrograms([...programs, newProgram]);
      setProgramForm({ image: "", title: "", location: "", status: "Ongoing" });
      setShowProgramForm(false);
    } catch (err) {
      setError("Failed to create program");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVolunteer = async (volunteer) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://health-and-sanitation-backend.vercel.app/calamities/${selectedProgram._id}/volunteers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: volunteer.userId }),
        }
      );

      if (response.ok) {
        const updatedVolunteer = {
          ...volunteer,
          status: "pending",
          expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        setSelectedVolunteers([...selectedVolunteers, updatedVolunteer]);
        setVolunteers(volunteers.filter((v) => v.userId !== volunteer.userId));
        // Refresh programs to update counts
        fetchProgramsWithCounts();
      }
    } catch (err) {
      setError("Failed to add volunteer");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (doctor) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://health-and-sanitation-backend.vercel.app/calamities/${selectedProgram._id}/doctors`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: doctor.userId }),
        }
      );

      if (response.ok) {
        const updatedDoctor = {
          ...doctor,
          status: "pending",
          expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        setSelectedDoctors([...selectedDoctors, updatedDoctor]);
        setDoctors(doctors.filter((d) => d.userId !== doctor.userId));
        // Refresh programs to update counts
        fetchProgramsWithCounts();
      }
    } catch (err) {
      setError("Failed to add doctor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVolunteer = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://health-and-sanitation-backend.vercel.app/calamities/${selectedProgram._id}/participants`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, role: "volunteer" }),
        }
      );

      if (response.ok) {
        const removedVolunteer = selectedVolunteers.find(
          (v) => v.userId === userId
        );
        setSelectedVolunteers(
          selectedVolunteers.filter((v) => v.userId !== userId)
        );

        if (removedVolunteer?.status === "pending") {
          setVolunteers([
            ...volunteers,
            {
              userId: removedVolunteer.userId,
              name: removedVolunteer.name,
              email: removedVolunteer.email,
              specialty: removedVolunteer.specialty || "General Volunteer",
              status: "available",
            },
          ]);
        }
        // Refresh programs to update counts
        fetchProgramsWithCounts();
      }
    } catch (err) {
      setError("Failed to remove volunteer");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDoctor = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://health-and-sanitation-backend.vercel.app/calamities/${selectedProgram._id}/participants`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, role: "doctor" }),
        }
      );

      if (response.ok) {
        const removedDoctor = selectedDoctors.find((d) => d.userId === userId);
        setSelectedDoctors(selectedDoctors.filter((d) => d.userId !== userId));

        if (removedDoctor?.status === "pending") {
          setDoctors([
            ...doctors,
            {
              userId: removedDoctor.userId,
              name: removedDoctor.name,
              email: removedDoctor.email,
              specialty: removedDoctor.specialty || "Doctor",
              status: "available",
            },
          ]);
        }
        // Refresh programs to update counts
        fetchProgramsWithCounts();
      }
    } catch (err) {
      setError("Failed to remove doctor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId, role, status) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://health-and-sanitation-backend.vercel.app/calamities/${selectedProgram._id}/participants/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, role, status }),
        }
      );

      if (response.ok) {
        if (role === "volunteer") {
          setSelectedVolunteers(
            selectedVolunteers.map((v) =>
              v.userId === userId ? { ...v, status } : v
            )
          );
        } else {
          setSelectedDoctors(
            selectedDoctors.map((d) =>
              d.userId === userId ? { ...d, status } : d
            )
          );
        }
      }
    } catch (err) {
      setError("Failed to update status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseProgram = async (program) => {
    try {
      const result = await Swal.fire({
        title: "Close Program?",
        text: `Are you sure you want to close "${program.title}" program?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0A3B1E", // Darker green
        cancelButtonColor: "#d33",
        confirmButtonText: '<span style="color: white">Yes, close it!</span>', // White text
        cancelButtonText: '<span style="color: white">Cancel</span>', // White text
        background: "#ffffff",
        backdrop: `
          rgba(10, 59, 30, 0.4)
          url("/images/nyan-cat.gif")
          left top
          no-repeat
        `,
        customClass: {
          popup: "border-2 border-[#0A3B1E]", // Green border
          title: "text-[#0A3B1E]", // Green title
          confirmButton: "bg-[#008e48] transition-colors", // Hover effect
          cancelButton: "bg-red-600 transition-colors", // Hover effect
        },
      });

      if (result.isConfirmed) {
        setLoading(true);
        const response = await fetch(
          `https://health-and-sanitation-backend.vercel.app/calamities/${program._id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "Closed" }),
          }
        );

        if (response.ok) {
          setPrograms(
            programs.map((p) =>
              p._id === program._id ? { ...p, status: "Closed" } : p
            )
          );
          Swal.fire({
            title: "Closed!",
            text: "The program has been closed.",
            icon: "success",
            confirmButtonColor: "#0A3B1E",
            confirmButtonText: '<span style="color: white">OK</span>',
            background: "#ffffff",
            customClass: {
              popup: "border-2 border-[#0A3B1E]",
              title: "text-[#0A3B1E]",
              confirmButton: "bg:[#008e48]"
            },
          });
        } else {
          throw new Error("Failed to close program");
        }
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Failed to close program.",
        icon: "error",
        confirmButtonColor: "#0A3B1E",
        confirmButtonText: '<span style="color: white">OK</span>',
        background: "#ffffff",
        customClass: {
          popup: "border-2 border-[#0A3B1E]",
          title: "text-[#0A3B1E]",
        },
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter(
    (v) =>
      v.status === "available" &&
      (v.name.toLowerCase().includes(volunteerSearchTerm.toLowerCase()) ||
        v.specialty.toLowerCase().includes(volunteerSearchTerm.toLowerCase()))
  );

  const filteredDoctors = doctors.filter(
    (d) =>
      d.status === "available" &&
      (d.name.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
        d.specialty.toLowerCase().includes(doctorSearchTerm.toLowerCase()))
  );

  const getTimeLeft = (expiration) => {
    const now = new Date();
    const expDate = new Date(expiration);
    const diff = expDate - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008e48] mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <FiX />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {!selectedProgram ? (
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Programs</h1>
            <button
              onClick={() => setShowProgramForm(true)}
              className="flex items-center gap-2 bg-[#008e48] hover:bg-[#0A3B1E] text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiPlus /> Create New Program
            </button>
          </div>

          {showProgramForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Create New Program
                  </h2>
                  <button
                    onClick={() => setShowProgramForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <form onSubmit={handleProgramSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Program Image URL
                    </label>
                    <input
                      type="text"
                      value={programForm.image}
                      onChange={(e) =>
                        setProgramForm({
                          ...programForm,
                          image: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008e48]"
                      placeholder="Enter image URL"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Program Title
                    </label>
                    <input
                      type="text"
                      value={programForm.title}
                      onChange={(e) =>
                        setProgramForm({
                          ...programForm,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008e48]"
                      placeholder="Enter program title"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={programForm.location}
                      onChange={(e) =>
                        setProgramForm({
                          ...programForm,
                          location: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008e48]"
                      placeholder="Enter program location"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Status</label>
                    <select
                      value={programForm.status}
                      onChange={(e) =>
                        setProgramForm({
                          ...programForm,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008e48]"
                    >
                      <option value="Ongoing">Ongoing</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#008e48] hover:bg-[#0A3B1E] text-white py-2 rounded-lg transition-colors"
                  >
                    Create Program
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow relative"
              >
                {program.status === "Ongoing" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseProgram(program);
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full z-10"
                    title="Close program"
                  >
                    <FiX />
                  </button>
                )}

                <div
                  onClick={() => setSelectedProgram(program)}
                  className="cursor-pointer h-full"
                >
                  {program.image && (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={program.image}
                        alt={program.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {program.title}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          program.status === "Ongoing"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {program.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FiMapPin className="mr-1" />
                      <span>{program.location}</span>
                    </div>
                    <div className="mt-4 flex justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <FiUsers className="mr-1" />
                        {program.volunteersCount || 0} Volunteers
                      </span>
                      <span className="flex items-center">
                        <FaUserMd className="mr-1" />
                        {program.doctorsCount || 0} Doctors
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {programs.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="mx-auto w-24 h-24 bg-[#008e48] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                  <FiPlus className="text-[#008e48] text-3xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No programs yet
                </h3>
                <p className="mt-1 text-gray-500">
                  Get started by creating a new program.
                </p>
                <button
                  onClick={() => setShowProgramForm(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#008e48] hover:bg-[#0A3B1E] focus:outline-none"
                >
                  Create Program
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setSelectedProgram(null)}
              className="mr-4 text-[#008e48] hover:text-[#0A3B1E]"
            >
              ← Back to Programs
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {selectedProgram.title}
            </h1>
            <span
              className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                selectedProgram.status === "Ongoing"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {selectedProgram.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FiUsers className="mr-2 text-[#008e48]" /> Volunteers
                </h2>
                <button
                  onClick={() => {
                    setShowVolunteerForm(true);
                    setShowDoctorForm(false);
                    setVolunteerSearchTerm("");
                  }}
                  className={`flex items-center gap-1 text-sm bg-[#008e48] hover:bg-[#0A3B1E] text-white px-3 py-1 rounded-lg transition-colors ${
                    selectedProgram.status === "Closed"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={selectedProgram.status === "Closed"}
                >
                  <FiUserPlus size={14} /> Add
                </button>
              </div>

              {selectedVolunteers.length > 0 ? (
                <div className="space-y-3">
                  {selectedVolunteers.map((volunteer) => (
                    <div
                      key={`vol-${volunteer.userId}`}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{volunteer.name}</p>
                        <p className="text-sm text-gray-500">
                          {volunteer.specialty || "General Volunteer"}
                        </p>
                        {volunteer.status === "pending" && (
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <FiClock className="mr-1" />
                            {getTimeLeft(volunteer.expiration)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {volunteer.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  volunteer.userId,
                                  "volunteer",
                                  "approved"
                                )
                              }
                              className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  volunteer.userId,
                                  "volunteer",
                                  "rejected"
                                )
                              }
                              className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            volunteer.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : volunteer.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {volunteer.status}
                        </span>
                        <button
                          onClick={() =>
                            handleRemoveVolunteer(volunteer.userId)
                          }
                          className="text-gray-400 hover:text-red-500"
                        >
                          <FiX />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FiUsers className="mx-auto text-2xl mb-2 text-gray-300" />
                  <p>No volunteers added yet</p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaUserMd className="mr-2 text-[#008e48]" /> Doctors
                </h2>
                <button
                  onClick={() => {
                    setShowDoctorForm(true);
                    setShowVolunteerForm(false);
                    setDoctorSearchTerm("");
                  }}
                  className={`flex items-center gap-1 text-sm bg-[#008e48] hover:bg-[#0A3B1E] text-white px-3 py-1 rounded-lg transition-colors ${
                    selectedProgram.status === "Closed"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={selectedProgram.status === "Closed"}
                >
                  <FiUserPlus size={14} /> Add
                </button>
              </div>

              {selectedDoctors.length > 0 ? (
                <div className="space-y-3">
                  {selectedDoctors.map((doctor) => (
                    <div
                      key={`doc-${doctor.userId}`}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-gray-500">
                          {doctor.specialty || "Doctor"}
                        </p>
                        {doctor.status === "pending" && (
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <FiClock className="mr-1" />
                            {getTimeLeft(doctor.expiration)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {doctor.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  doctor.userId,
                                  "doctor",
                                  "approved"
                                )
                              }
                              className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  doctor.userId,
                                  "doctor",
                                  "rejected"
                                )
                              }
                              className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            doctor.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : doctor.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {doctor.status}
                        </span>
                        <button
                          onClick={() => handleRemoveDoctor(doctor.userId)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <FiX />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FaUserMd className="mx-auto text-2xl mb-2 text-gray-300" />
                  <p>No doctors added yet</p>
                </div>
              )}
            </div>
          </div>

          {(showVolunteerForm || showDoctorForm) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {showVolunteerForm ? "Add Volunteers" : "Add Doctors"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowVolunteerForm(false);
                      setShowDoctorForm(false);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="mb-4 relative">
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={
                      showVolunteerForm ? volunteerSearchTerm : doctorSearchTerm
                    }
                    onChange={(e) =>
                      showVolunteerForm
                        ? setVolunteerSearchTerm(e.target.value)
                        : setDoctorSearchTerm(e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008e48]"
                    placeholder={`Search ${
                      showVolunteerForm ? "volunteers" : "doctors"
                    }...`}
                  />
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {showVolunteerForm ? (
                    filteredVolunteers.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {filteredVolunteers.map((volunteer) => (
                          <li
                            key={`avail-vol-${volunteer.userId}`}
                            className="py-3"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{volunteer.name}</p>
                                <p className="text-sm text-gray-500">
                                  {volunteer.specialty}
                                </p>
                              </div>
                              <button
                                onClick={() => handleAddVolunteer(volunteer)}
                                className="px-3 py-1 bg-[#008e48] hover:bg-[#0A3B1E] text-white rounded-lg text-sm"
                              >
                                Add
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <FiUserX className="mx-auto text-2xl mb-2 text-gray-300" />
                        <p>No available volunteers found</p>
                      </div>
                    )
                  ) : filteredDoctors.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {filteredDoctors.map((doctor) => (
                        <li key={`avail-doc-${doctor.userId}`} className="py-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{doctor.name}</p>
                              <p className="text-sm text-gray-500">
                                {doctor.specialty}
                              </p>
                            </div>
                            <button
                              onClick={() => handleAddDoctor(doctor)}
                              className="px-3 py-1 bg-[#008e48] hover:bg-[#0A3B1E] text-white rounded-lg text-sm"
                            >
                              Add
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <FiUserX className="mx-auto text-2xl mb-2 text-gray-300" />
                      <p>No available doctors found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddRoles;
