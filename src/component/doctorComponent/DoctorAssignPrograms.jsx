import { useState, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  AvatarGroup,
  Divider,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CalendarToday,
  Schedule,
  LocationOn,
  People,
  EventAvailable,
  Close,
  ExpandMore,
  Upcoming,
  HourglassTop,
  CheckCircle,
  MedicalServices
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { green, red, orange, blue, purple } from '@mui/material/colors';
import { AuthContext } from '../../context/Authcontext';

// Custom styled components
const StatusBadge = styled(Badge)(({ theme, status }) => ({
  '& .MuiBadge-badge': {
    right: -5,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    backgroundColor: 
      status === 'upcoming' ? orange[500] :
      status === 'ongoing' ? green[500] :
      status === 'quick' ? blue[500] :
      red[500],
    color: 'white',
    fontWeight: 'bold'
  },
}));

const StatusTab = styled(Tab)(({ status }) => ({
  textTransform: 'none',
  fontWeight: '600',
  minHeight: '48px',
  '&.Mui-selected': {
    color: 
      status === 'upcoming' ? orange[800] :
      status === 'ongoing' ? green[800] :
      status === 'completed' ? red[800] : purple[800],
  },
}));

const fetchDoctorPrograms = async (email) => {
  const response = await fetch(
    `https://health-and-sanitation-backend.vercel.app/doctor-programs?email=${email}`
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const DoctorAssignPrograms = () => {
  const { users } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const {
    data: programs = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['doctorPrograms', users?.email],
    queryFn: () => fetchDoctorPrograms(users?.email),
    enabled: !!users?.email
  });

  const filteredPrograms = {
    upcoming: programs.filter(program => program.status.toLowerCase() === 'upcoming'),
    ongoing: programs.filter(program => 
      ['ongoing', 'quick'].includes(program.status.toLowerCase())
    ),
    completed: programs.filter(program => program.status.toLowerCase() === 'closed')
  };

  const handleOpenDialog = (program) => {
    setSelectedProgram(program);
    setOpenDialog(true);
    setShowParticipants(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProgram(null);
    setShowParticipants(false);
  };

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleShowParticipants = () => {
    setShowParticipants(true);
  };

  const renderServicesList = (services) => {
    if (!services) return null;
    
    const serviceItems = services.split('\n').filter(item => item.trim() !== '');
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '600' }}>
          Services Offered:
        </Typography>
        <List dense sx={{ listStyleType: 'disc', pl: 2 }}>
          {serviceItems.map((service, index) => (
            <ListItem key={index} sx={{ display: 'list-item', pl: 1, py: 0 }}>
              <Typography variant="body2">{service.trim()}</Typography>
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        Error loading programs: {error.message}
      </Alert>
    );
  }

  if (programs.length === 0) {
    return (
      <Box textAlign="center" py={4} sx={{ mx: 10 }}>
        <EventAvailable sx={{ fontSize: 60, color: '#008e48', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          No Seminar Programs Assigned
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You haven't been assigned to any seminar programs yet. Check back later!
        </Typography>
      </Box>
    );
  }

  const renderStatusHeader = (status) => {
    const config = {
      upcoming: {
        icon: <Upcoming color="warning" sx={{ mr: 1 }} />,
        color: orange[500],
        text: 'Upcoming Programs'
      },
      ongoing: {
        icon: <HourglassTop color="success" sx={{ mr: 1 }} />,
        color: green[500],
        text: 'Ongoing & Quick Programs'
      },
      completed: {
        icon: <CheckCircle color="error" sx={{ mr: 1 }} />,
        color: red[500],
        text: 'Completed Programs'
      }
    };

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mb: 2,
        p: 2,
        backgroundColor: `${config[status].color}10`,
        borderRadius: 2,
        borderLeft: `4px solid ${config[status].color}`
      }}>
        {config[status].icon}
        <Typography variant="h6" sx={{ fontWeight: '600' }}>
          {config[status].text}
          <StatusBadge 
            badgeContent={filteredPrograms[status].length} 
            status={status}
            sx={{ ml: 1.5 }}
          />
        </Typography>
      </Box>
    );
  };

  const renderProgramItem = (program) => (
    <Accordion 
      key={program._id}
      elevation={0}
      sx={{ 
        mb: 2,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        '&:before': {
          display: 'none'
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          backgroundColor: '#f9f9f9',
          '& .MuiAccordionSummary-content': {
            alignItems: 'center'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>
              {program.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {program.subtitle}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <CalendarToday sx={{ fontSize: '1rem', mr: 1, color: '#666' }} />
            <Typography variant="body2">
              {new Date(program.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <People sx={{ fontSize: '1rem', mr: 1, color: '#666' }} />
            <Typography variant="body2">
              {program.registrations.length}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <CardMedia
              component="img"
              height="200"
              image={program.bannerImage || '/default-seminar.jpg'}
              alt={program.title}
              sx={{ 
                borderRadius: 2,
                objectFit: 'cover'
              }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex' }}>
                <Schedule sx={{ mr: 1.5, color: '#666', mt: 0.5 }} />
                <Typography variant="body2">
                  {program.time}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex' }}>
                <LocationOn sx={{ mr: 1.5, color: '#666', mt: 0.5 }} />
                <Typography variant="body2">
                  {program.locations}
                </Typography>
              </Box>
            </Stack>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              {program.programDetails.substring(0, 200)}...
            </Typography>
            
            {program.servicesOffered && renderServicesList(program.servicesOffered)}
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => handleOpenDialog(program)}
                sx={{ mr: 2 }}
              >
                View Details
              </Button>
              <Button 
                variant="contained" 
                size="small"
                onClick={() => {
                  setSelectedProgram(program);
                  setOpenDialog(true);
                  setShowParticipants(true);
                }}
                sx={{ backgroundColor: '#008e48' }}
              >
                View Participants
              </Button>
            </Box>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box sx={{ px: 15, py: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        color: '#0A3B1E', 
        fontWeight: '700', 
        mb: 3,
        fontSize: '2rem'
      }}>
        My Seminar Programs
      </Typography>
      
      <Tabs 
        value={activeTab}
        onChange={handleChangeTab}
        variant="fullWidth"
        sx={{ 
          mb: 3,
          '& .MuiTabs-indicator': {
            backgroundColor: 
              activeTab === 'upcoming' ? orange[500] :
              activeTab === 'ongoing' ? green[500] :
              red[500],
            height: 4
          }
        }}
      >
        <StatusTab 
          icon={<Upcoming />} 
          iconPosition="start" 
          label="Upcoming" 
          value="upcoming"
          status="upcoming"
        />
        <StatusTab 
          icon={<HourglassTop />} 
          iconPosition="start" 
          label="Ongoing" 
          value="ongoing"
          status="ongoing"
        />
        <StatusTab 
          icon={<CheckCircle />} 
          iconPosition="start" 
          label="Completed" 
          value="completed"
          status="completed"
        />
      </Tabs>

      <Box sx={{ mb: 4 }}>
        {renderStatusHeader(activeTab)}
        
        {filteredPrograms[activeTab].length > 0 ? (
          filteredPrograms[activeTab].map(renderProgramItem)
        ) : (
          <Box textAlign="center" py={6} sx={{ 
            backgroundColor: '#f9f9f9',
            borderRadius: 3,
            p: 4
          }}>
            <EventAvailable sx={{ 
              fontSize: 60, 
              color: '#008e48', 
              mb: 2 
            }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: '600' }}>
              No {activeTab} programs found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You don't have any {activeTab} programs at the moment.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Program Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          py: 2,
          px: 3
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: '600' }}>
              {selectedProgram?.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {selectedProgram?.subtitle}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: '#666' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {selectedProgram && (
            <>
              {!showParticipants ? (
                <>
                  <Box sx={{ 
                    backgroundColor: '#f5f5f5',
                    p: 3,
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <CardMedia
                          component="img"
                          height="300"
                          image={selectedProgram.bannerImage || '/default-seminar.jpg'}
                          alt={selectedProgram.title}
                          sx={{ 
                            borderRadius: 2,
                            objectFit: 'cover',
                            width: '100%'
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ 
                            fontWeight: '600',
                            color: '#333'
                          }}>
                            Date & Time
                          </Typography>
                          <Box sx={{ 
                            backgroundColor: 'white',
                            borderRadius: 2,
                            p: 2,
                            mb: 2
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CalendarToday sx={{ mr: 1.5, color: '#666' }} />
                              <Typography variant="body1">
                                {new Date(selectedProgram.startDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                                {selectedProgram.endDate && (
                                  <>
                                    {' - '}
                                    {new Date(selectedProgram.endDate).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </>
                                )}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Schedule sx={{ mr: 1.5, color: '#666' }} />
                              <Typography variant="body1">
                                {selectedProgram.time}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ 
                            fontWeight: '600',
                            color: '#333'
                          }}>
                            Location
                          </Typography>
                          <Box sx={{ 
                            backgroundColor: 'white',
                            borderRadius: 2,
                            p: 2
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationOn sx={{ mr: 1.5, color: '#666' }} />
                              <Typography variant="body1">
                                {selectedProgram.locations}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Program Details
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {selectedProgram.programDetails}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        What Participants Will Learn
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {selectedProgram.learnedAbout}
                      </Typography>
                    </Box>

                    {selectedProgram.servicesOffered && renderServicesList(selectedProgram.servicesOffered)}
                  </Box>
                </>
              ) : (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ 
                    fontWeight: '600',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <People sx={{ mr: 1.5 }} />
                    Registered Participants ({selectedProgram.registrations.length})
                  </Typography>
                  
                  {selectedProgram.registrations.length > 0 ? (
                    <>
                      <AvatarGroup max={6} sx={{ 
                        justifyContent: 'flex-start', 
                        mb: 3,
                        '& .MuiAvatar-root': {
                          width: 40,
                          height: 40,
                          border: '2px solid white'
                        }
                      }}>
                        {selectedProgram.registrations.map((reg) => (
                          <Avatar 
                            key={reg.email} 
                            alt={reg.name} 
                            src={reg.photoUrl}
                          />
                        ))}
                      </AvatarGroup>
                      
                      <Paper elevation={0} sx={{ 
                        maxHeight: 400, 
                        overflow: 'auto', 
                        p: 1,
                        borderRadius: 2,
                        border: '1px solid #e0e0e0'
                      }}>
                        <List>
                          {selectedProgram.registrations.map((reg) => (
                            <ListItem 
                              key={reg.email} 
                              sx={{ 
                                px: 2,
                                py: 1.5,
                                '&:hover': {
                                  backgroundColor: '#f5f5f5'
                                }
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar alt={reg.name} src={reg.photoUrl} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle1" sx={{ fontWeight: '500' }}>
                                    {reg.name}
                                  </Typography>
                                }
                                secondary={
                                  <>
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      color="text.primary"
                                      sx={{ display: 'block' }}
                                    >
                                      {reg.email}
                                    </Typography>
                                    {reg.phone && (
                                      <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {reg.phone}
                                      </Typography>
                                    )}
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </>
                  ) : (
                    <Box sx={{ 
                      backgroundColor: '#f9f9f9',
                      borderRadius: 2,
                      p: 4,
                      textAlign: 'center'
                    }}>
                      <EventAvailable sx={{ 
                        fontSize: 60, 
                        color: '#008e48', 
                        mb: 2 
                      }} />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: '600' }}>
                        No Participants Registered
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        There are no participants registered for this program yet.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 2,
          borderTop: '1px solid #e0e0e0'
        }}>
          {showParticipants ? (
            <Button 
              onClick={() => setShowParticipants(false)}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                backgroundColor: '#008e48',
                color: 'white',
                fontWeight: '600',
                '&:hover': {
                  backgroundColor: '#0A3B1E'
                }
              }}
            >
              Back to Program Details
            </Button>
          ) : (
            <Button 
              onClick={handleCloseDialog}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                backgroundColor: '#008e48',
                color: 'white',
                fontWeight: '600',
                '&:hover': {
                  backgroundColor: '#0A3B1E'
                }
              }}
            >
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorAssignPrograms;