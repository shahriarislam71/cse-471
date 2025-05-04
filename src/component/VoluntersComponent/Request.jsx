import { useContext, useEffect, useState } from 'react';
import { Table, Tag, Button, Card, Avatar, Typography, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined, GlobalOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../../context/Authcontext';

const { Title, Text } = Typography;

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { users } = useContext(AuthContext);
  const currentUserEmail = users?.email;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data...');
        
        // First fetch ongoing calamities
        const calamitiesRes = await axios.get('https://health-and-sanitation-backend.vercel.app/calamity', {
          params: { status: 'Ongoing' }
        });
        console.log('Calamities response:', calamitiesRes.data);
        
        const ongoingCalamities = calamitiesRes.data;
        
        if (!ongoingCalamities || ongoingCalamities.length === 0) {
          console.log('No ongoing calamities found');
          setRequests([]);
          setLoading(false);
          return;
        }
    
        // Get volunteer data for these calamities
        const calamityIds = ongoingCalamities.map(c => c._id).join(',');
        console.log('Fetching volunteers for calamity IDs:', calamityIds);
        
        const volunteersRes = await axios.get('https://health-and-sanitation-backend.vercel.app/calamityVolunteers', {
          params: { calamityIds }
        });
        console.log('Volunteers response:', volunteersRes.data);
        
        // Filter requests where current user is a volunteer
        const userRequests = volunteersRes.data
          .filter(assignment => 
            assignment.volunteers?.some(v => v.email === currentUserEmail)
          )
          .map(assignment => {
            const calamity = ongoingCalamities.find(c => c._id === assignment.calamityId);
            const volunteerInfo = assignment.volunteers?.find(v => v.email === currentUserEmail);
            
            return {
              ...calamity,
              _id: assignment.calamityId,
              volunteerStatus: volunteerInfo?.status || 'pending',
              volunteerId: volunteerInfo?.userId,
              volunteerExpiration: volunteerInfo?.expiration,
              volunteerAddedAt: volunteerInfo?.addedAt
            };
          });
        
        console.log('Filtered user requests:', userRequests);
        setRequests(userRequests);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    if (currentUserEmail) {
      fetchData();
    } else {
      console.log('No current user email found'); // Debug log
      setLoading(false);
    }
  }, [currentUserEmail]);

  const handleResponse = async (id, action) => {
    try {
      console.log(`Responding to request ${id} with action ${action}`); // Debug log
      await axios.patch(`https://health-and-sanitation-backend.vercel.app/volunteers/${id}/respond`, { 
        action,
        email: currentUserEmail
      });
      
      setRequests(requests.map(req => 
        req._id === id ? { ...req, volunteerStatus: action } : req
      ));
      message.success(`Request ${action} successfully`);
    } catch (error) {
      console.error('Error responding to request:', error);
      message.error(`Failed to ${action} request`);
    }
  };

  const columns = [
    {
      title: 'Calamity',
      dataIndex: 'image',
      key: 'image',
      render: (image, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={image} 
            shape="square" 
            size={64}
            style={{ borderRadius: '8px' }}
          />
          <div style={{ marginLeft: '16px' }}>
            <Text strong style={{ color: '#0A3B1E' }}>{record.title}</Text>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
              <GlobalOutlined style={{ color: '#008e48', marginRight: '4px' }} />
              <Text type="secondary">{record.location}</Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'volunteerStatus',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'accepted' ? '#008e48' : status === 'rejected' ? '#ff4d4f' : '#faad14'}
          style={{ borderRadius: '12px', fontWeight: '500' }}
        >
          {status?.toUpperCase() || 'PENDING'}
        </Tag>
      ),
    },
    {
      title: 'Invited On',
      dataIndex: 'volunteerAddedAt',
      key: 'addedAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.volunteerStatus === 'pending' && (
            <>
              <Button 
                type="primary" 
                icon={<CheckOutlined />}
                style={{ 
                  backgroundColor: '#008e48',
                  borderColor: '#008e48',
                  borderRadius: '6px',
                  fontWeight: '500'
                }}
                onClick={() => handleResponse(record._id, 'accepted')}
              >
                Accept
              </Button>
              <Button 
                danger 
                icon={<CloseOutlined />}
                style={{ 
                  borderRadius: '6px',
                  fontWeight: '500'
                }}
                onClick={() => handleResponse(record._id, 'rejected')}
              >
                Reject
              </Button>
            </>
          )}
          {record.volunteerStatus !== 'pending' && (
            <Text type="secondary">Response recorded</Text>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Title level={3} style={{ color: '#0A3B1E', margin: 0 }}>
            Volunteer Requests
          </Title>
        }
        variant="borderless"
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 142, 72, 0.1)'
        }}
      >
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          style={{ borderRadius: '8px' }}
          locale={{
            emptyText: (
              <div style={{ padding: '24px' }}>
                <Title level={4} style={{ color: '#0A3B1E' }}>
                  No volunteer requests found
                </Title>
                <Text type="secondary">You don't have any pending volunteer requests at the moment.</Text>
              </div>
            )
          }}
        />
      </Card>
    </div>
  );
};

export default Requests;