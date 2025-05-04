import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Box
} from '@mui/material';
import { styled } from '@mui/system';
import { CalendarToday, AccessTime, MedicalServices } from '@mui/icons-material';
import { AuthContext } from '../../context/Authcontext';

// Styled components
const PrimaryChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#008e48',
  color: 'white',
  fontWeight: 'bold',
}));

const SecondaryChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#0A3B1E',
  color: 'white',
  fontWeight: 'bold',
}));

const PendingChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#FFA500',
  color: 'white',
  fontWeight: 'bold',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(0, 142, 72, 0.08)',
  },
}));

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {users} = useContext(AuthContext)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // In a real app, you would get the patientEmail from authenticated user
        
        
        // Fetch appointments for this patient
        const appointmentsResponse = await axios.get(`https://health-and-sanitation-backend.vercel.app/doctors-appointments?patientEmail=${users?.email}`);
        const appointmentsData = appointmentsResponse.data.data;
        // console.log(appointmentsData)
        
        // Fetch doctor info for each appointment
        const appointmentsWithDoctorInfo = await Promise.all(
          appointmentsData.map(async (appointment) => {
            const doctorResponse = await axios.get(`https://health-and-sanitation-backend.vercel.app/users/${appointment.doctoremail}`);
            return {
              ...appointment,
              doctor: doctorResponse.data
            };
          })
        );
        
        setAppointments(appointmentsWithDoctorInfo);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch appointment history');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: '#008e48' }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  const getStatusChip = (status) => {
    switch (status) {
      case 'booked':
        return <PrimaryChip label="Booked" />;
      case 'completed':
        return <SecondaryChip label="Completed" />;
      case 'pending':
        return <PendingChip label="Pending" />;
      default:
        return <Chip label={status} />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 'bold', 
        color: '#0A3B1E', 
        mb: 4,
        textAlign: 'center'
      }}>
        My Appointment History
      </Typography>

      {appointments.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          p: 4, 
          border: '2px dashed #008e48', 
          borderRadius: 2,
          backgroundColor: 'rgba(0, 142, 72, 0.05)'
        }}>
          <Typography variant="h6" sx={{ color: '#666' }}>
            You don't have any appointments yet.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Table sx={{ minWidth: 650 }} aria-label="appointment history table">
            <TableHead sx={{ backgroundColor: '#0A3B1E' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Doctor</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Specialization</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Time</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <StyledTableRow key={appointment._id}>
                  <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      src={appointment.doctor?.image || '/default-doctor.png'} 
                      alt={appointment.doctorName}
                      sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {appointment.doctorName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MedicalServices sx={{ color: '#008e48', mr: 1 }} />
                      {appointment.doctorSpecialization}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ color: '#008e48', mr: 1 }} />
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ color: '#008e48', mr: 1 }} />
                      {appointment.time}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(appointment.appointmentStatus)}
                    {appointment.appointmentStatus === 'pending' && (
                      <PendingChip label="Pending" sx={{ ml: 1 }} />
                    )}
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AppointmentHistory;