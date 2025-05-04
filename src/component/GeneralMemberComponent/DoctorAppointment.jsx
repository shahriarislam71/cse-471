import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  School,
  Work,
  LocationOn,
} from "@mui/icons-material";
import { AuthContext } from "../../context/Authcontext";

const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#008e48",
  color: "white",
  "&:hover": {
    backgroundColor: "#0A3B1E",
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#0A3B1E",
  color: "white",
  "&:hover": {
    backgroundColor: "#008e48",
  },
}));

const DoctorCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
  },
}));

const DoctorAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);
  const navigate = useNavigate();
  const {users} = useContext(AuthContext)

  useEffect(() => {
    const fetchDoctors = async () => {
        try {
          const response = await axios.get("https://health-and-sanitation-backend.vercel.app/volunteers/doctors");
          setDoctors(response.data.data);
          setFilteredDoctors(response.data.data);
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || "Failed to fetch doctors");
          setLoading(false);
        }
      };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const filtered = doctors.filter((doctor) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        doctor.name.toLowerCase().includes(searchLower) ||
        doctor.specialization.toLowerCase().includes(searchLower) ||
        doctor.education.toLowerCase().includes(searchLower)
      );
    });
    setFilteredDoctors(filtered);
  }, [searchTerm, doctors]);

  const handleOpenModal = (doctor) => {
    setSelectedDoctor(doctor);
    setOpenModal(true);
    setAppointmentSuccess(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDate("");
    setSelectedSlot("");
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot("");
  };

  const handleBookAppointment = async () => {
    try {
      const appointmentData = {
        doctorId: selectedDoctor._id,
        doctoremail: selectedDoctor.email,
        doctorName: selectedDoctor.name,
        doctorSpecialization: selectedDoctor.specialization,
        date: selectedDate,
        time: selectedSlot,
        patientEmail: users?.email,
        status: "booked",
        appointmentStatus: "pending"
      };
  
      const response = await axios.post("https://health-and-sanitation-backend.vercel.app/appointments", appointmentData);
      
      if (response.data.success) {
        setAppointmentSuccess(true);
        
        // Update local doctor data to reflect booked slot
        const updatedDoctors = doctors.map((doctor) => {
          if (doctor._id === selectedDoctor._id) {
            const updatedAvailability = doctor.availability.map((avail) => {
              if (avail.date === selectedDate) {
                const updatedSlots = avail.slots.filter(
                  (slot) => slot !== selectedSlot
                );
                return {
                  ...avail,
                  slots: updatedSlots,
                };
              }
              return avail;
            });
            return {
              ...doctor,
              availability: updatedAvailability,
            };
          }
          return doctor;
        });
  
        setDoctors(updatedDoctors);
        setFilteredDoctors(updatedDoctors);
      } else {
        setError(response.data.message || "Failed to book appointment");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment");
      // Refresh doctor data to get updated availability
      const response = await axios.get("https://health-and-sanitation-backend.vercel.app/volunteers/doctors");
      setDoctors(response.data.data);
      setFilteredDoctors(response.data.data);
    }
  };

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress sx={{ color: "#008e48" }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: "center", mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#0A3B1E", mb: 4 }}
      >
        Book Doctor Appointment
      </Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search doctors by name, specialization or education..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#008e48",
              },
              "&:hover fieldset": {
                borderColor: "#0A3B1E",
              },
            },
          }}
          InputProps={{
            style: { borderRadius: "8px" },
          }}
        />
      </Box>

      {filteredDoctors.length === 0 ? (
        <Typography
          variant="h6"
          textAlign="center"
          sx={{ mt: 4, color: "#666" }}
        >
          No doctors found matching your search.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredDoctors.map((doctor) => (
            <Grid item xs={12} sm={6} md={4} key={doctor._id}>
              <DoctorCard>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={doctor.image || "/default-doctor.png"}
                      alt={doctor.name}
                      sx={{ width: 80, height: 80, mr: 2 }}
                    />
                    <Box>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ fontWeight: "bold" }}
                      >
                        {doctor.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doctor.specialization}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <School fontSize="small" sx={{ color: "#008e48", mr: 1 }} />
                    <Typography variant="body2">{doctor.education}</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Work fontSize="small" sx={{ color: "#008e48", mr: 1 }} />
                    <Typography variant="body2">{doctor.occupation}</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <LocationOn
                      fontSize="small"
                      sx={{ color: "#008e48", mr: 1 }}
                    />
                    <Typography variant="body2">
                      {doctor.presentAddress}, {doctor.permanentAddress}
                    </Typography>
                  </Box>

                  <PrimaryButton
                    fullWidth
                    variant="contained"
                    onClick={() => handleOpenModal(doctor)}
                  >
                    Take Appointment
                  </PrimaryButton>
                </CardContent>
              </DoctorCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Appointment Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="appointment-modal-title"
        aria-describedby="appointment-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "80%", md: "60%" },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            outline: "none",
          }}
        >
          {appointmentSuccess ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h5"
                component="h2"
                sx={{ mb: 2, color: "#008e48" }}
              >
                Appointment Booked Successfully!
              </Typography>
              <Typography sx={{ mb: 3 }}>
                Your appointment with Dr. {selectedDoctor.name} on{" "}
                {selectedDate} at {selectedSlot} has been confirmed.
              </Typography>
              <SecondaryButton onClick={handleCloseModal}>
                Close
              </SecondaryButton>
            </Box>
          ) : (
            <>
              <Typography
                id="appointment-modal-title"
                variant="h6"
                component="h2"
                sx={{ mb: 2 }}
              >
                Book Appointment with Dr. {selectedDoctor?.name}
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 3, color: "#008e48" }}>
                {selectedDoctor?.specialization}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="date-select-label">Select Date</InputLabel>
                    <Select
                      labelId="date-select-label"
                      id="date-select"
                      value={selectedDate}
                      label="Select Date"
                      onChange={(e) => handleDateChange(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#008e48",
                          },
                        },
                      }}
                    >
                      {selectedDoctor?.availability?.map((avail) => (
                        <MenuItem key={avail.date} value={avail.date}>
                          {avail.day}, {avail.date}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="slot-select-label">
                      Select Time Slot
                    </InputLabel>
                    <Select
                      labelId="slot-select-label"
                      id="slot-select"
                      value={selectedSlot}
                      label="Select Time Slot"
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      disabled={!selectedDate}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#008e48",
                          },
                        },
                      }}
                    >
                      {selectedDate &&
                        selectedDoctor?.availability
                          ?.find((avail) => avail.date === selectedDate)
                          ?.slots?.map((slot) => (
                            <MenuItem key={slot} value={slot}>
                              {slot}
                            </MenuItem>
                          ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button onClick={handleCloseModal} sx={{ mr: 2 }}>
                  Cancel
                </Button>
                <PrimaryButton
                  onClick={handleBookAppointment}
                  disabled={!selectedDate || !selectedSlot}
                >
                  Confirm Appointment
                </PrimaryButton>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default DoctorAppointment;
