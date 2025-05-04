import { useContext, useState } from "react";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Authcontext";

const AddSlots = () => {
  const [date, setDate] = useState("");
  const [day, setDay] = useState("");
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const { users } = useContext(AuthContext);
  const [email, setEmail] = useState(users.email);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);

    // Calculate day from date
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayIndex = new Date(selectedDate).getDay();
    setDay(days[dayIndex]);
  };

  const handleAddSlot = () => {
    if (newSlot.trim() && !slots.includes(newSlot)) {
      setSlots([...slots, newSlot]);
      setNewSlot("");
    }
  };

  const handleRemoveSlot = (index) => {
    const updatedSlots = [...slots];
    updatedSlots.splice(index, 1);
    setSlots(updatedSlots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "https://health-and-sanitation-backend.vercel.app/volunteers/add-slots", // Fixed URL
        {
          email,
          date,
          day,
          slots,
          status: "available",
        }
      );

      if (response.data.success) {
        toast.success("Slots added successfully!");
        setDate("");
        setDay("");
        setSlots([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add slots");
      console.error("Error adding slots:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#008E48]/10 to-[#0A3B1E]/10 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-[#008E48] text-white p-6 text-center">
          <h1 className="text-2xl font-bold">Add Available Slots</h1>
          <p className="mt-2">
            Select a date and add your available time slots
          </p>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                <FaCalendarAlt className="inline mr-2 text-[#008E48]" />
                Select Date
              </label>
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008E48] focus:border-[#008E48]"
                required
              />
              {day && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected day: <span className="font-medium">{day}</span>
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                <FaClock className="inline mr-2 text-[#008E48]" />
                Add Time Slots
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008E48] focus:border-[#008E48]"
                />
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="px-4 py-2 bg-[#008E48] text-white rounded-lg hover:bg-[#0A3B1E] transition flex items-center"
                >
                  <FaPlus className="mr-1" /> Add
                </button>
              </div>
            </div>

            {slots.length > 0 && (
              <div className="mb-6">
                <h3 className="text-gray-700 font-medium mb-2">Your Slots</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {slots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <span className="font-medium">{slot}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || slots.length === 0}
              className={`w-full py-3 bg-[#008E48] text-white font-medium rounded-lg hover:bg-[#0A3B1E] transition flex items-center justify-center ${
                loading || slots.length === 0
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Save Slots"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSlots;
