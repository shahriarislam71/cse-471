import { useState } from 'react';
import { Modal, Button, Form, Input, DatePicker, TimePicker, Select, message } from 'antd';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

const programTypes = [
  { value: 'health', label: 'Community Health Initiative' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'announcement', label: 'Create Announcement' },
];

const statusOptions = [
  { value: 'quick', label: 'Quick' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
];

const CreatePrograms = () => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [programType, setProgramType] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('https://health-and-sanitation-backend.vercel.app/user-type', {
        params: {
          volunteer_type: 'Doctor'
        }
      });
      setDoctors(response.data);
    } catch (error) {
      message.error('Failed to fetch doctors');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('https://health-and-sanitation-backend.vercel.app/user-type', {
        params: {
          volunteer_type: 'Teacher'
        }
      });
      setTeachers(response.data);
    } catch (error) {
      message.error('Failed to fetch teachers');
    }
  };

  const showModal = (type) => {
    setProgramType(type);
    if (type === 'health') {
      fetchDoctors();
    } else if (type === 'seminar') {
      fetchTeachers();
    }
    setVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formattedValues = {
        ...values,
        programName: programType === 'health' ? 'Health Initiative' : 
                    programType === 'seminar' ? 'Seminar' : 'Announcement',
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD'),
        time: values.time?.format('HH:mm'),
        status: values.status || 'quick'
      };
  
      const response = await axios.post('https://health-and-sanitation-backend.vercel.app/programCollections', formattedValues);
      
      if (response.data.error) {
        message.error(response.data.error);
        if (response.data.details) {
          console.error("Validation errors:", response.data.details);
        }
      } else {
        message.success('Program created successfully!');
        form.resetFields();
        setVisible(false);
      }
    } catch (error) {
      console.error("Error creating program:", error.response?.data || error.message);
      message.error(error.response?.data?.error || 'Failed to create program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 pb-6 px-28">
      <h1 className="text-3xl font-bold mb-8 text-[#0A3B1E]">Create Programs</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {programTypes.map((type) => (
          <div 
            key={type.value}
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
            onClick={() => showModal(type.value)}
          >
            <div className={`h-2 bg-[#008e48]`}></div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#0A3B1E] mb-2">{type.label}</h2>
              <p className="text-gray-600">
                {type.value === 'health' && 'Create community health programs with doctors and services'}
                {type.value === 'seminar' && 'Organize educational seminars with teachers'}
                {type.value === 'announcement' && 'Make important announcements to the community'}
              </p>
              <Button 
                type="primary" 
                className="mt-4 bg-[#008e48] hover:bg-[#0A3B1E]"
                onClick={() => showModal(type.value)}
              >
                Create {type.label}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        title={
          <span className="text-xl font-bold text-[#0A3B1E]">
            {programType === 'health' && 'Create Health Initiative'}
            {programType === 'seminar' && 'Create Seminar'}
            {programType === 'announcement' && 'Create Announcement'}
          </span>
        }
        visible={visible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status: 'quick' }}
        >
          {programType !== 'announcement' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="title"
                  label="Program Title"
                  rules={[{ required: true, message: 'Please input the title!' }]}
                >
                  <Input placeholder="Enter program title" />
                </Form.Item>

                <Form.Item
                  name="subtitle"
                  label="Subtitle"
                  rules={[{ required: true, message: 'Please input the subtitle!' }]}
                >
                  <Input placeholder="Enter program subtitle" />
                </Form.Item>
              </div>

              <Form.Item
                name="bannerImage"
                label="Program Banner Image URL"
                rules={[
                  { required: true, message: 'Please input the image URL!' },
                  { type: 'url', message: 'Please enter a valid URL' }
                ]}
              >
                <Input placeholder="Enter image URL" />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="startDate"
                  label="Start Date"
                  rules={[{ required: true, message: 'Please select start date!' }]}
                >
                  <DatePicker className="w-full" />
                </Form.Item>

                {programType === 'health' && (
                  <Form.Item
                    name="endDate"
                    label="End Date"
                    rules={[{ required: true, message: 'Please select end date!' }]}
                  >
                    <DatePicker className="w-full" />
                  </Form.Item>
                )}

                <Form.Item
                  name="time"
                  label="Time"
                  rules={[{ required: true, message: 'Please select time!' }]}
                >
                  <TimePicker className="w-full" format="HH:mm" />
                </Form.Item>
              </div>

              <Form.Item
                name="locations"
                label="Locations"
                rules={[{ required: true, message: 'Please input locations!' }]}
              >
                <Input placeholder="Enter program locations" />
              </Form.Item>

              <Form.Item
                name="programDetails"
                label="Program Details"
                rules={[{ required: true, message: 'Please input program details!' }]}
              >
                <TextArea rows={4} placeholder="Enter detailed program description" />
              </Form.Item>
            </>
          )}

          {programType === 'health' && (
            <>
              <Form.Item
                name="servicesOffered"
                label="Services Offered"
                rules={[{ required: true, message: 'Please input services offered!' }]}
              >
                <TextArea rows={3} placeholder="List the services offered in this program" />
              </Form.Item>

              <Form.Item
                name="doctorsList"
                label="Doctors List"
                rules={[{ required: true, message: 'Please select at least one doctor!' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select doctors for this program"
                  optionFilterProp="children"
                >
                  {doctors.map(doctor => (
                    <Option key={doctor._id} value={doctor._id}>
                      {doctor.name} ({doctor.volunteer_type || 'General'})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          {programType === 'seminar' && (
            <>
              <Form.Item
                name="teachersList"
                label="Teachers List"
                rules={[{ required: true, message: 'Please select at least one teacher!' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select teachers for this seminar"
                  optionFilterProp="children"
                >
                  {teachers.map(teacher => (
                    <Option key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="learnedAbout"
                label="What Will Be Learned"
                rules={[{ required: true, message: 'Please input what will be learned!' }]}
              >
                <TextArea rows={3} placeholder="Describe what participants will learn" />
              </Form.Item>
            </>
          )}

          {programType === 'announcement' && (
            <Form.Item
              name="announcementText"
              label="Announcement"
              rules={[{ required: true, message: 'Please input the announcement!' }]}
            >
              <TextArea rows={6} placeholder="Enter your announcement here..." />
            </Form.Item>
          )}

          <Form.Item
            name="status"
            label="Status"
          >
            <Select>
              {statusOptions.map(status => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="text-right">
            <Button onClick={handleCancel} className="mr-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} className="bg-[#008e48] hover:bg-[#0A3B1E]">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CreatePrograms;