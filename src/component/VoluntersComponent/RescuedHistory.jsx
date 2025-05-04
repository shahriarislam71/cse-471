import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/Authcontext";
import axios from "axios";
import {
  Card,
  Typography,
  List,
  Tag,
  Divider,
  Spin,
  Empty,
  Image
} from "antd";
import {
  PhoneOutlined,
  EnvironmentOutlined,
  WarningOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const RescuedHistory = () => {
  const { users } = useContext(AuthContext);
  const [rescuedCases, setRescuedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserEmail = users?.email;

  useEffect(() => {
    const fetchRescuedCases = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://health-and-sanitation-backend.vercel.app/rescued-cases", {
          params: { email: currentUserEmail }
        });
        setRescuedCases(response.data);
      } catch (error) {
        console.error("Error fetching rescued cases:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserEmail) {
      fetchRescuedCases();
    }
  }, [currentUserEmail]);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2} style={{ color: "#0A3B1E", marginBottom: "24px" }}>
        Your Rescue History
      </Title>
      <Text type="secondary" style={{ display: "block", marginBottom: "24px" }}>
        View all the emergency cases you've successfully rescued
      </Text>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      ) : rescuedCases.length === 0 ? (
        <Card
          style={{
            borderRadius: "12px",
            border: "1px dashed #008e48",
            textAlign: "center",
            padding: "40px 0",
          }}
        >
          <Empty
            description={
              <Text type="secondary">
                You haven't rescued any emergency cases yet
              </Text>
            }
          />
        </Card>
      ) : (
        <List
          itemLayout="vertical"
          size="large"
          dataSource={rescuedCases}
          renderItem={(item) => (
            <Card
              style={{
                marginBottom: "20px",
                borderRadius: "12px",
                borderLeft: "4px solid #008e48",
                boxShadow: "0 4px 12px rgba(0, 142, 72, 0.1)",
              }}
            >
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                {/* Image Section */}
                <div style={{ flex: "0 0 300px" }}>
                  {item.calamityDetails?.image ? (
                    <Image
                      src={item.calamityDetails.image}
                      alt={item.calamityDetails.title}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #f0f0f0"
                      }}
                      placeholder={
                        <div
                          style={{
                            width: "100%",
                            height: "200px",
                            backgroundColor: "#f5f5f5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px"
                          }}
                        >
                          <Spin size="large" />
                        </div>
                      }
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "200px",
                        backgroundColor: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                        color: "#008e48",
                        fontSize: "16px"
                      }}
                    >
                      <WarningOutlined style={{ marginRight: "8px" }} />
                      No Image Available
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div style={{ flex: 1, minWidth: "300px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <Title level={4} style={{ color: "#0A3B1E", margin: 0 }}>
                        {item.calamityDetails?.title || "Emergency Case"}
                      </Title>
                      <Text
                        type="secondary"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "4px",
                        }}
                      >
                        <CalendarOutlined /> 
                        Rescued on: {new Date(item.rescuedAt).toLocaleDateString()}
                      </Text>
                    </div>

                    <Tag
                      color="#008e48"
                      style={{
                        borderRadius: "12px",
                        fontWeight: "500",
                        padding: "0 12px",
                        height: "24px",
                        lineHeight: "22px",
                      }}
                    >
                      RESCUED
                    </Tag>
                  </div>

                  <Divider style={{ margin: "12px 0", backgroundColor: "#f0f0f0" }} />

                  <div style={{ marginBottom: "16px" }}>
                    <Text strong style={{ color: "#0A3B1E" }}>
                      Emergency Details:
                    </Text>
                    <Text style={{ display: "block", marginTop: "4px" }}>
                      {item.message}
                    </Text>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "24px",
                      marginBottom: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <Text strong style={{ color: "#0A3B1E" }}>
                        <PhoneOutlined style={{ color: "#008e48", marginRight: "8px" }} />
                        Contact Number
                      </Text>
                      <Text style={{ display: "block", marginTop: "4px" }}>
                        {item.phoneNumber}
                      </Text>
                    </div>

                    <div>
                      <Text strong style={{ color: "#0A3B1E" }}>
                        <EnvironmentOutlined style={{ color: "#008e48", marginRight: "8px" }} />
                        Location
                      </Text>
                      <Text style={{ display: "block", marginTop: "4px" }}>
                        {item.location}
                      </Text>
                    </div>

                    <div>
                      <Text strong style={{ color: "#0A3B1E" }}>
                        <WarningOutlined style={{ color: "#008e48", marginRight: "8px" }} />
                        Crisis Type
                      </Text>
                      <Text style={{ display: "block", marginTop: "4px" }}>
                        {item.calamityDetails?.title || "Unknown"}
                      </Text>
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

export default RescuedHistory;