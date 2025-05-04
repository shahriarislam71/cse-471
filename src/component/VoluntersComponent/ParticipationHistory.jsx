import { useState, useEffect, useContext } from 'react';
import { Card, Avatar, Typography, List, Tag, Divider, Spin, message } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../../context/Authcontext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ParticipationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { users } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParticipationHistory = async () => {
      try {
        setLoading(true);
        
        
        // First fetch all calamities where user might have participated
        const response = await axios.get('https://health-and-sanitation-backend.vercel.app/calamityVolunteersHistory');
        const allAssignments = response.data || [];
        
        // Filter assignments where current user is a volunteer with accepted status
        const userHistory = allAssignments
          .flatMap(assignment => {
            const volunteerInfo = assignment.volunteers?.find(
              v => v?.email === users.email && v?.status === 'accepted'
            );
            
            if (!volunteerInfo) return null;
            
            return {
              calamityId: assignment.calamityId,
              participationDate: volunteerInfo.addedAt,
              status: volunteerInfo.status
            };
          })
          .filter(Boolean);

        // Now fetch details for these calamities
        if (userHistory.length > 0) {
          const calamityIds = userHistory.map(item => item.calamityId);
          const calamitiesRes = await axios.get('https://health-and-sanitation-backend.vercel.app/calamity', {
            params: { ids: calamityIds.join(',') }
          });
          const calamities = calamitiesRes.data || [];

          // Combine the data
          const completeHistory = userHistory.map(item => {
            const calamity = calamities.find(c => c._id === item.calamityId);
            return calamity ? { ...calamity, ...item } : null;
          }).filter(Boolean);

          setHistory(completeHistory);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('Error fetching participation history:', err);
        message.error('Failed to load participation history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipationHistory();
  }, [users, navigate]);

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <Spin size="large" />
        <Text style={{ display: 'block', marginTop: '16px' }}>Loading your participation history...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2} style={{ color: '#0A3B1E', marginBottom: '24px' }}>
        My Participation History
      </Title>
      
      {history.length === 0 ? (
        <Card style={{ borderRadius: '12px', border: '1px dashed #008e48' }}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: '48px', color: '#008e48', marginBottom: '16px' }} />
            <Title level={4} style={{ color: '#0A3B1E' }}>
              No Participation History Found
            </Title>
            <Text type="secondary">You haven't participated in any calamity relief efforts yet.</Text>
          </div>
        </Card>
      ) : (
        <List
          itemLayout="vertical"
          size="large"
          dataSource={history}
          renderItem={(item) => (
            <Card 
              key={item._id}
              style={{ 
                marginBottom: '20px', 
                borderRadius: '12px',
                borderLeft: '4px solid #008e48',
                boxShadow: '0 4px 12px rgba(0, 142, 72, 0.1)'
              }}
            >
              <div style={{ display: 'flex', gap: '24px' }}>
                <Avatar 
                  src={item.image} 
                  shape="square" 
                  size={150}
                  style={{ borderRadius: '8px' }}
                />
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Title level={4} style={{ color: '#0A3B1E', margin: 0 }}>
                      {item.title}
                    </Title>
                    <Tag 
                      color="#008e48" 
                      style={{ 
                        borderRadius: '12px', 
                        fontWeight: '500',
                        padding: '0 12px',
                        height: '24px',
                        lineHeight: '22px'
                      }}
                    >
                      COMPLETED
                    </Tag>
                  </div>
                  
                  <div style={{ margin: '12px 0' }}>
                    <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <EnvironmentOutlined /> {item.location}
                    </Text>
                  </div>
                  
                  <Divider style={{ margin: '12px 0' }} />
                  
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div>
                      <Text strong style={{ color: '#0A3B1E' }}>Participation Date</Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <CalendarOutlined style={{ color: '#008e48' }} />
                        <Text>{item.participationDate ? new Date(item.participationDate).toLocaleDateString() : 'N/A'}</Text>
                      </div>
                    </div>
                    
                    <div>
                      <Text strong style={{ color: '#0A3B1E' }}>Calamity Date</Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <CalendarOutlined style={{ color: '#008e48' }} />
                        <Text>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        />
      )}
    </div>
  );
};

export default ParticipationHistory;