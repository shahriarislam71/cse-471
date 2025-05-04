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
  Box,
  Button
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

const ApprovedChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#008e48',
  color: 'white',
  fontWeight: 'bold',
}));

const RejectedChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#ff4444',
  color: 'white',
  fontWeight: 'bold',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(0, 142, 72, 0.08)',
  },
}));

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {users} = useContext(AuthContext);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointmentsResponse = await axios.get(`https://health-and-sanitation-backend.vercel.app/appointments?doctoremail=${users?.email}`);
        const appointmentsData = appointmentsResponse.data.data;
        
        const appointmentsWithDoctorInfo = await Promise.all(
          appointmentsData.map(async (appointment) => {
            const doctorResponse = await axios.get(`https://health-and-sanitation-backend.vercel.app/users/${appointment.patientEmail}`);
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
  }, [users?.email]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setUpdating(true);
    try {
      await axios.put(`https://health-and-sanitation-backend.vercel.app/appointments/${appointmentId}`, {
        appointmentStatus: newStatus
      });

      // Update local state
      setAppointments(prev => prev.map(app => 
        app._id === appointmentId 
          ? { ...app, appointmentStatus: newStatus } 
          : app
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment status');
    } finally {
      setUpdating(false);
    }
  };

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
      case 'approved':
        return <ApprovedChip label="Approved" />;
      case 'rejected':
        return <RejectedChip label="Rejected" />;
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
        My Appointments
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Patient</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Time</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <StyledTableRow key={appointment._id}>
                  <TableCell sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Avatar 
                      src={appointment.doctor?.data?.photoUrl || '/default-doctor.png'} 
                      alt={appointment?.doctor?.data?.name}
                      sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {appointment?.doctor?.data?.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CalendarToday sx={{ color: '#008e48', mr: 1 }} />
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AccessTime sx={{ color: '#008e48', mr: 1 }} />
                      {appointment.time}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {getStatusChip(appointment.appointmentStatus)}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {appointment.appointmentStatus === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          disabled={updating}
                          onClick={() => handleStatusUpdate(appointment._id, 'approved')}
                          sx={{ 
                            backgroundColor: '#008e48',
                            '&:hover': { backgroundColor: '#0A3B1E' }
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          disabled={updating}
                          onClick={() => handleStatusUpdate(appointment._id, 'rejected')}
                          sx={{ 
                            backgroundColor: '#ff4444',
                            '&:hover': { backgroundColor: '#cc0000' }
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
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

export default Appointments;