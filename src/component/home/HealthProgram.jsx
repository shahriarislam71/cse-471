import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Divider,
  Tag,
  Card,
  Row,
  Col,
  Image,
  Typography,
  Space,
  List,
  Skeleton,
  Modal,
  Form,
  Input,
  message
} from "antd";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
  ReadOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const HealthProgram = () => {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorsInfo, setDoctorsInfo] = useState([]);
  const [teachersInfo, setTeachersInfo] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [registrationModalVisible, setRegistrationModalVisible] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://health-and-sanitation-backend.vercel.app/program/${id}`);
        setProgram(response.data);
        
        if (response.data.programName === "Health Initiative" && response.data.doctorsList?.length > 0) {
          await fetchDoctorsInfo(response.data.doctorsList);
        } else if (response.data.programName === "Seminar" && response.data.teachersList?.length > 0) {
          await fetchTeachersInfo(response.data.teachersList);
        }
        
        // Fetch existing registrations
        await fetchRegistrations(id);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching program:", err);
        setError("Failed to load program details");
        setLoading(false);
      }
    };

    const fetchDoctorsInfo = async (doctorIds) => {
      try {
        setParticipantsLoading(true);
        const response = await axios.post('https://health-and-sanitation-backend.vercel.app/get-participants-info', {
          ids: doctorIds,
          type: 'doctor'
        });
        setDoctorsInfo(response.data);
      } catch (err) {
        console.error("Error fetching doctors info:", err);
      } finally {
        setParticipantsLoading(false);
      }
    };

    const fetchTeachersInfo = async (teacherIds) => {
      try {
        setParticipantsLoading(true);
        const response = await axios.post('https://health-and-sanitation-backend.vercel.app/get-participants-info', {
          ids: teacherIds,
          type: 'teacher'
        });
        setTeachersInfo(response.data);
      } catch (err) {
        console.error("Error fetching teachers info:", err);
      } finally {
        setParticipantsLoading(false);
      }
    };

    const fetchRegistrations = async (programId) => {
      try {
        const response = await axios.get(`https://health-and-sanitation-backend.vercel.app/program-registrations/${programId}`);
        setRegistrations(response.data.data?.registrations || []);
      } catch (err) {
        console.error("Error fetching registrations:", err);
      }
    };

    fetchProgram();
  }, [id]);

  const handleRegister = () => {
    setRegistrationModalVisible(true);
  };

  const handleRegistrationSubmit = async (values) => {
    try {
      setRegistrationLoading(true);
      
      const response = await axios.post('https://health-and-sanitation-backend.vercel.app/program-registration', {
        programId: id,
        name: values.name,
        email: values.email,
        phone: values.phone
      });
      
      if (response.data.success) {
        message.success('Registration successful!');
        setRegistrationModalVisible(false);
        form.resetFields();
        
        // Refresh registrations
        const registrationsResponse = await axios.get(`https://health-and-sanitation-backend.vercel.app/program-registrations/${id}`);
        setRegistrations(registrationsResponse.data.data?.registrations || []);
      } else {
        message.error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleCancelRegistration = () => {
    setRegistrationModalVisible(false);
    form.resetFields();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008e48]"></div>
          <p className="mt-4 text-lg text-gray-600">Loading program details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800">Error Loading Program</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[#008e48] text-white rounded-lg hover:bg-[#0A3B1E] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Program Not Found</h2>
          <p className="mt-2 text-gray-600">The requested program could not be found.</p>
          <a
            href="/"
            className="mt-4 inline-block px-6 py-2 bg-[#008e48] text-white rounded-lg hover:bg-[#0A3B1E] transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const isSeminar = program.programName === "Seminar";
  const isHealthInitiative = program.programName === "Health Initiative";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Improved Banner Section */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-64 md:h-80 lg:h-96 w-full bg-gray-200">
        <Image
          src={program.bannerImage}
          alt={program.title}
          className="w-full h-full object-cover"
          preview={false}
          style={{ 
            objectPosition: 'center center',
            width: '100%',
            height: '100%'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6 md:p-8 lg:p-12">
          <div className="max-w-3xl w-full">
            <Tag color="#008e48" className="mb-3 text-sm font-semibold">
              {program.programName.toUpperCase()}
            </Tag>
            <Title 
              level={1} 
              className="text-white mb-2 !text-3xl md:!text-4xl lg:!text-5xl"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            >
              {program.title}
            </Title>
            <Text 
              className="text-white text-lg md:text-xl opacity-90"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
              {program.subtitle}
            </Text>
          </div>
        </div>
      </div>

      <Row gutter={[32, 32]}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Card className="shadow-lg rounded-xl mb-6">
            <Title level={3} className="text-[#0A3B1E] mb-4">
              {isSeminar ? "Seminar Details" : "Program Details"}
            </Title>
            <Paragraph className="text-gray-700 text-lg leading-relaxed">
              {program.programDetails}
            </Paragraph>
          </Card>

          {isHealthInitiative && (
            <Card className="shadow-lg rounded-xl mb-6">
              <Title level={3} className="text-[#0A3B1E] mb-4">
                Services Offered
              </Title>
              <List
                dataSource={program.servicesOffered?.split("\n") || []}
                renderItem={(service) => (
                  <List.Item className="!pl-0 !py-2">
                    <div className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-[#008e48] rounded-full mt-3 mr-3 flex-shrink-0"></span>
                      <Text className="text-gray-700 text-lg">{service}</Text>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          )}

          {isSeminar && program.learnedAbout && (
            <Card className="shadow-lg rounded-xl mb-6">
              <Title level={3} className="text-[#0A3B1E] mb-4 flex items-center">
                <ReadOutlined className="mr-2" /> What You'll Learn
              </Title>
              <List
                dataSource={program.learnedAbout.split("\n")}
                renderItem={(item) => (
                  <List.Item className="!pl-0 !py-2">
                    <div className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-[#008e48] rounded-full mt-3 mr-3 flex-shrink-0"></span>
                      <Text className="text-gray-700 text-lg">{item}</Text>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Registered Participants Section */}
          {registrations.length > 0 && (
            <Card className="shadow-lg rounded-xl mb-6">
              <Title level={3} className="text-[#0A3B1E] mb-4">
                Registered Participants
              </Title>
              <List
                dataSource={registrations}
                renderItem={(participant) => (
                  <List.Item className="!px-0 !py-3">
                    <div className="flex items-center w-full">
                      <Image
                        src={participant.photoUrl}
                        alt={participant.name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                        preview={false}
                        fallback="https://via.placeholder.com/48"
                      />
                      <div className="ml-3">
                        <Text strong className="block text-gray-800">
                          {participant.name}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {participant.email}
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Card className="shadow-lg rounded-xl sticky top-6">
            <Title level={4} className="text-[#0A3B1E] mb-4">
              Event Information
            </Title>

            <Space direction="vertical" size="middle" className="w-full">
              <div className="flex items-start">
                <CalendarOutlined className="text-[#008e48] text-xl mr-3 mt-1" />
                <div>
                  <Text strong className="block text-gray-700">
                    Date
                  </Text>
                  <Text className="text-gray-600">
                    {new Date(program.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {program.endDate && (
                      <>
                        {" "}
                        -{" "}
                        {new Date(program.endDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </>
                    )}
                  </Text>
                </div>
              </div>

              <div className="flex items-start">
                <ClockCircleOutlined className="text-[#008e48] text-xl mr-3 mt-1" />
                <div>
                  <Text strong className="block text-gray-700">
                    Time
                  </Text>
                  <Text className="text-gray-600">{program.time}</Text>
                </div>
              </div>

              <div className="flex items-start">
                <EnvironmentOutlined className="text-[#008e48] text-xl mr-3 mt-1" />
                <div>
                  <Text strong className="block text-gray-700">
                    Location
                  </Text>
                  <Text className="text-gray-600">{program.locations}</Text>
                </div>
              </div>

              <Divider className="my-2" />

              <Button
                type="primary"
                size="large"
                block
                className="bg-[#008e48] hover:bg-[#0A3B1E] h-12 font-semibold"
                onClick={handleRegister}
              >
                Register for this {isSeminar ? "Seminar" : "Program"}
              </Button>
            </Space>
          </Card>

          {/* Participants Section */}
          {isHealthInitiative && doctorsInfo.length > 0 && (
            <Card className="shadow-lg rounded-xl mt-6">
              <Title level={4} className="text-[#0A3B1E] mb-4 flex items-center">
                <TeamOutlined className="mr-2" /> Participating Doctors
              </Title>
              {participantsLoading ? (
                <List
                  dataSource={[1, 2, 3]}
                  renderItem={() => (
                    <List.Item>
                      <Skeleton avatar active paragraph={{ rows: 1 }} />
                    </List.Item>
                  )}
                />
              ) : (
                <List
                  dataSource={doctorsInfo}
                  renderItem={(doctor) => (
                    <List.Item className="!px-0 !py-3">
                      <div className="flex items-center w-full">
                        <Image
                          src={doctor.photoUrl || "https://via.placeholder.com/48"}
                          alt={doctor.name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                          preview={false}
                          fallback="https://via.placeholder.com/48"
                        />
                        <div className="ml-3">
                          <Text strong className="block text-gray-800">
                            {doctor.name}
                          </Text>
                          <Text className="text-gray-600 text-sm">
                            {doctor.specialization || "General Physician"}
                          </Text>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          )}

          {isSeminar && teachersInfo.length > 0 && (
            <Card className="shadow-lg rounded-xl mt-6">
              <Title level={4} className="text-[#0A3B1E] mb-4 flex items-center">
                <UserOutlined className="mr-2" /> Seminar Instructors
              </Title>
              {participantsLoading ? (
                <List
                  dataSource={[1, 2, 3]}
                  renderItem={() => (
                    <List.Item>
                      <Skeleton avatar active paragraph={{ rows: 1 }} />
                    </List.Item>
                  )}
                />
              ) : (
                <List
                  dataSource={teachersInfo}
                  renderItem={(teacher) => (
                    <List.Item className="!px-0 !py-3">
                      <div className="flex items-center w-full">
                        <Image
                          src={teacher.photoUrl || "https://via.placeholder.com/48"}
                          alt={teacher.name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                          preview={false}
                          fallback="https://via.placeholder.com/48"
                        />
                        <div className="ml-3">
                          <Text strong className="block text-gray-800">
                            {teacher.name}
                          </Text>
                          <Text className="text-gray-600 text-sm">
                            {teacher.qualification || "Instructor"}
                          </Text>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          )}
        </Col>
      </Row>

      {/* Registration Modal */}
      <Modal
        title={`Register for ${program.title}`}
        visible={registrationModalVisible}
        onCancel={handleCancelRegistration}
        footer={null}
        centered
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegistrationSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Full Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter your full name' },
              { min: 2, message: 'Name must be at least 2 characters' }
            ]}
          >
            <Input size="large" placeholder="John Doe" />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input size="large" placeholder="example@email.com" />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              { required: true, message: 'Please enter your phone number' },
              { min: 10, message: 'Phone number must be at least 10 digits' },
              { pattern: /^[0-9]+$/, message: 'Phone number must contain only numbers' }
            ]}
          >
            <Input size="large" placeholder="01XXXXXXXXX" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={registrationLoading}
              className="bg-[#008e48] hover:bg-[#0A3B1E] h-12 font-semibold"
            >
              Submit Registration
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthProgram;