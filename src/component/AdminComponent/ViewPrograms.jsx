import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Divider,
  List,
  Avatar,
  Tag,
  message,
  Skeleton,
  Image
} from "antd";
import {
  EditOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
  ReadOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ViewPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [doctors, setDoctors] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://health-and-sanitation-backend.vercel.app/programs");
        setPrograms(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching programs:", error);
        setLoading(false);
      }
    };

    const fetchParticipants = async () => {
      try {
        const [doctorsRes, teachersRes] = await Promise.all([
          axios.get("https://health-and-sanitation-backend.vercel.app/user-type?volunteer_type=Doctor"),
          axios.get("https://health-and-sanitation-backend.vercel.app/user-type?volunteer_type=Teacher")
        ]);
        setDoctors(doctorsRes.data);
        setTeachers(teachersRes.data);
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };

    fetchPrograms();
    fetchParticipants();
  }, []);

  const handleCardClick = async (program) => {
    try {
      setSelectedProgram(program);
      
      // Fetch registrations for this program
      const response = await axios.get(
        `https://health-and-sanitation-backend.vercel.app/program-registrations/${program._id}`
      );
      
      setSelectedProgram({
        ...program,
        registrations: response.data.data?.registrations || []
      });
      
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching program details:", error);
      message.error("Failed to load program details");
    }
  };

  const handleUpdate = (program) => {
    setSelectedProgram(program);
    form.setFieldsValue({
      ...program,
      doctorsList: program.doctorsList?.map(id => id.toString()),
      teachersList: program.teachersList?.map(id => id.toString())
    });
    setUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (values) => {
    try {
      setUpdating(true);
      
      // No need to convert to ObjectId - backend can handle string IDs
      const dataToSend = {
        ...values,
        doctorsList: values.doctorsList || [],
        teachersList: values.teachersList || []
      };

      await axios.put(
        `https://health-and-sanitation-backend.vercel.app/programs/${selectedProgram._id}`,
        dataToSend
      );

      message.success("Program updated successfully");
      setUpdateModalOpen(false);
      
      // Refresh programs list
      const response = await axios.get("https://health-and-sanitation-backend.vercel.app/programs");
      setPrograms(response.data);
    } catch (error) {
      console.error("Error updating program:", error);
      message.error(error.response?.data?.message || "Failed to update program");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      quick: { color: "green", text: "Quick" },
      upcoming: { color: "blue", text: "Upcoming" },
      ongoing: { color: "orange", text: "Ongoing" },
      closed: { color: "red", text: "closed" }
    };
    
    const statusInfo = statusMap[status] || { color: "default", text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const renderProgramDetails = () => {
    if (!selectedProgram) return null;

    const isHealthInitiative = selectedProgram.programName === "Health Initiative";
    const isSeminar = selectedProgram.programName === "Seminar";
    const isAnnouncement = selectedProgram.programName === "Announcement";

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Title level={3} className="text-[#0A3B1E]">
              {selectedProgram.title}
            </Title>
            <Text className="text-lg text-gray-600">{selectedProgram.subtitle}</Text>
          </div>
          {getStatusTag(selectedProgram.status)}
        </div>

        <Divider className="my-4" />

        {selectedProgram.bannerImage && (
          <div className="rounded-lg overflow-hidden mb-6">
            <Image
              src={selectedProgram.bannerImage}
              alt={selectedProgram.title}
              className="w-full h-auto object-cover"
              preview={false}
            />
          </div>
        )}

        {isAnnouncement ? (
          <Card className="mb-6">
            <Paragraph className="text-gray-700 text-lg leading-relaxed">
              {selectedProgram.announcementText}
            </Paragraph>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <Title level={4} className="text-[#0A3B1E] mb-4">
                Program Details
              </Title>
              <Paragraph className="text-gray-700 text-lg leading-relaxed">
                {selectedProgram.programDetails}
              </Paragraph>
            </Card>

            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} md={8}>
                <Card>
                  <div className="flex items-center mb-4">
                    <CalendarOutlined className="text-[#008e48] text-xl mr-3" />
                    <Text strong className="text-gray-700">
                      Date
                    </Text>
                  </div>
                  <Text className="text-gray-600">
                    {new Date(selectedProgram.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {selectedProgram.endDate && (
                      <>
                        {" - "}
                        {new Date(selectedProgram.endDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </>
                    )}
                  </Text>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card>
                  <div className="flex items-center mb-4">
                    <ClockCircleOutlined className="text-[#008e48] text-xl mr-3" />
                    <Text strong className="text-gray-700">
                      Time
                    </Text>
                  </div>
                  <Text className="text-gray-600">{selectedProgram.time}</Text>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card>
                  <div className="flex items-center mb-4">
                    <EnvironmentOutlined className="text-[#008e48] text-xl mr-3" />
                    <Text strong className="text-gray-700">
                      Location
                    </Text>
                  </div>
                  <Text className="text-gray-600">{selectedProgram.locations}</Text>
                </Card>
              </Col>
            </Row>

            {isHealthInitiative && selectedProgram.servicesOffered && (
              <Card className="mb-6">
                <Title level={4} className="text-[#0A3B1E] mb-4 flex items-center">
                  <TeamOutlined className="mr-2" /> Services Offered
                </Title>
                <List
                  dataSource={selectedProgram.servicesOffered.split("\n")}
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

            {isSeminar && selectedProgram.learnedAbout && (
              <Card className="mb-6">
                <Title level={4} className="text-[#0A3B1E] mb-4 flex items-center">
                  <ReadOutlined className="mr-2" /> What You'll Learn
                </Title>
                <List
                  dataSource={selectedProgram.learnedAbout.split("\n")}
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
          </>
        )}

        {selectedProgram.registrations?.length > 0 && (
          <Card>
            <Title level={4} className="text-[#0A3B1E] mb-4 flex items-center">
              <UserOutlined className="mr-2" /> Registered Participants ({selectedProgram.registrations.length})
            </Title>
            <List
              dataSource={selectedProgram.registrations}
              renderItem={(participant) => (
                <List.Item className="!px-0 !py-3">
                  <div className="flex items-center w-full">
                    <Avatar
                      src={participant.photoUrl}
                      alt={participant.name}
                      size="large"
                      className="mr-3"
                    />
                    <div>
                      <Text strong className="block text-gray-800">
                        {participant.name}
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        {participant.email}
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        {participant.phone}
                      </Text>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        )}
      </div>
    );
  };

  const renderUpdateForm = () => {
    if (!selectedProgram) return null;

    const isHealthInitiative = selectedProgram.programName === "Health Initiative";
    const isSeminar = selectedProgram.programName === "Seminar";
    const isAnnouncement = selectedProgram.programName === "Announcement";

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpdateSubmit}
        initialValues={{
          status: selectedProgram.status
        }}
      >
        {!isAnnouncement && (
          <>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item
              label="Subtitle"
              name="subtitle"
              rules={[{ required: true, message: "Please enter a subtitle" }]}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item
              label="Banner Image URL"
              name="bannerImage"
              rules={[{ required: true, message: "Please enter an image URL" }]}
            >
              <Input size="large" />
            </Form.Item>
          </>
        )}

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Please select a status" }]}
        >
          <Select size="large">
            <Option value="quick">Quick</Option>
            <Option value="upcoming">Upcoming</Option>
            <Option value="ongoing">Ongoing</Option>
            <Option value="closed">closed</Option>
          </Select>
        </Form.Item>

        {isAnnouncement ? (
          <Form.Item
            label="Announcement Text"
            name="announcementText"
            rules={[{ required: true, message: "Please enter announcement text" }]}
          >
            <TextArea rows={6} />
          </Form.Item>
        ) : (
          <>
            <Row gutter={16}>
              <Col span={isHealthInitiative ? 12 : 24}>
                <Form.Item
                  label="Start Date"
                  name="startDate"
                  rules={[{ required: true, message: "Please select a start date" }]}
                >
                  <Input type="date" size="large" />
                </Form.Item>
              </Col>

              {isHealthInitiative && (
                <Col span={12}>
                  <Form.Item
                    label="End Date"
                    name="endDate"
                    rules={[{ required: true, message: "Please select an end date" }]}
                  >
                    <Input type="date" size="large" />
                  </Form.Item>
                </Col>
              )}
            </Row>

            <Form.Item
              label="Time"
              name="time"
              rules={[{ required: true, message: "Please enter a time" }]}
            >
              <Input type="time" size="large" />
            </Form.Item>

            <Form.Item
              label="Location"
              name="locations"
              rules={[{ required: true, message: "Please enter a location" }]}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item
              label="Program Details"
              name="programDetails"
              rules={[{ required: true, message: "Please enter program details" }]}
            >
              <TextArea rows={6} />
            </Form.Item>

            {isHealthInitiative && (
              <>
                <Form.Item
                  label="Services Offered (one per line)"
                  name="servicesOffered"
                  rules={[{ required: true, message: "Please enter services offered" }]}
                >
                  <TextArea rows={6} />
                </Form.Item>

                <Form.Item
                  label="Participating Doctors"
                  name="doctorsList"
                  rules={[{ required: true, message: "Please select at least one doctor" }]}
                >
                  <Select
                    mode="multiple"
                    size="large"
                    placeholder="Select doctors"
                  >
                    {doctors.map(doctor => (
                      <Option key={doctor._id} value={doctor._id}>
                        {doctor.name} ({doctor.specialization || "General Physician"})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            )}

            {isSeminar && (
              <>
                <Form.Item
                  label="What You'll Learn (one per line)"
                  name="learnedAbout"
                  rules={[{ required: true, message: "Please enter learning points" }]}
                >
                  <TextArea rows={6} />
                </Form.Item>

                <Form.Item
                  label="Instructors"
                  name="teachersList"
                  rules={[{ required: true, message: "Please select at least one instructor" }]}
                >
                  <Select
                    mode="multiple"
                    size="large"
                    placeholder="Select instructors"
                  >
                    {teachers.map(teacher => (
                      <Option key={teacher._id} value={teacher._id}>
                        {teacher.name} ({teacher.qualification || "Instructor"})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            )}
          </>
        )}

        <Form.Item className="mt-8">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={updating}
            className="bg-[#008e48] hover:bg-[#0A3B1E] h-12 font-semibold w-full"
          >
            Update Program
          </Button>
        </Form.Item>
      </Form>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ marginInlineStart: '115px', marginInlineEnd: '115px' }}>
      <Title level={2} className="text-[#0A3B1E] mb-8">
        Programs Overview
      </Title>

      {loading ? (
        <Row gutter={[24, 24]}>
          {[1, 2, 3].map((item) => (
            <Col key={item} xs={24} sm={12} lg={8}>
              <Card>
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[24, 24]}>
          {programs.map((program) => (
            <Col key={program._id} xs={24} sm={12} lg={8}>
              <Card
                hoverable
                cover={
                  <div className="h-48 overflow-hidden">
                    <img
                      alt={program.title}
                      src={program.bannerImage || "https://placehold.co/400x200?text=Program+Image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                }
                actions={[
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdate(program);
                    }}
                    className="bg-[#008e48] hover:bg-[#0A3B1E]"
                  >
                    Update
                  </Button>
                ]}
                onClick={() => handleCardClick(program)}
              >
                <div className="flex justify-between items-start mb-2">
                  <Tag color="#008e48" className="text-xs font-semibold">
                    {program.programName.toUpperCase()}
                  </Tag>
                  {getStatusTag(program.status)}
                </div>

                <Title level={4} className="mb-2 text-[#0A3B1E]">
                  {program.title}
                </Title>
                <Text className="text-gray-600 line-clamp-2">
                  {program.subtitle || program.announcementText?.substring(0, 100)}
                </Text>

                <Divider className="my-3" />

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <UserOutlined className="text-[#008e48] mr-2" />
                    <Text className="text-gray-600">
                      {program.registeredCount || 0} registered
                    </Text>
                  </div>
                  <Text className="text-gray-500 text-sm">
                    {new Date(program.createdAt).toLocaleDateString()}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Program Details Modal */}
      <Modal
        title={selectedProgram?.title || "Program Details"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={800}
        centered
        className="max-h-screen overflow-y-auto"
      >
        {selectedProgram && renderProgramDetails()}
      </Modal>

      {/* Update Program Modal */}
      <Modal
        title={`Update ${selectedProgram?.programName}`}
        open={updateModalOpen}
        onCancel={() => setUpdateModalOpen(false)}
        footer={null}
        width={800}
        centered
        className="max-h-screen overflow-y-auto"
      >
        {selectedProgram && renderUpdateForm()}
      </Modal>
    </div>
  );
};

export default ViewPrograms;