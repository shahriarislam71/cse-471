import { useState, useEffect, useContext } from "react";
import {
  Card,
  Avatar,
  Typography,
  List,
  Tag,
  Button,
  Space,
  message,
  Divider,
  Modal,
  Input,
  Form,
} from "antd";
import {
  PhoneOutlined,
  EnvironmentOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { AuthContext } from "../../context/Authcontext";
import Swal from "sweetalert2";

const { Title, Text } = Typography;

const EmergencyCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [currentCase, setCurrentCase] = useState(null);
  const [form] = Form.useForm();
  const { users } = useContext(AuthContext);
  const currentUserEmail = users?.email;

  useEffect(() => {
    const fetchEmergencyCases = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://health-and-sanitation-backend.vercel.app/emergencyCases",
          {
            params: { email: currentUserEmail },
          }
        );
        setCases(response.data);
      } catch (error) {
        console.error("Error fetching emergency cases:", error);
        message.error("Failed to load emergency cases");
      } finally {
        setLoading(false);
      }
    };

    if (currentUserEmail) {
      fetchEmergencyCases();
    }
  }, [currentUserEmail]);

  const showVerifyModal = (caseItem) => {
    setCurrentCase(caseItem);
    setVerifyModalVisible(true);
  };

  const handleAction = async (id, action) => {
    try {
      await axios.patch(`https://health-and-sanitation-backend.vercel.app/emergencyCases/${id}`, {
        action,
      });

      setCases(
        cases.map((item) =>
          item._id === id
            ? {
                ...item,
                status: action === "Approved" ? "Approved" : item.status,
                isRescued: action === "Rescued" ? "Yes" : item.isRescued,
              }
            : item
        )
      );

      message.success(`Case marked as ${action}`);
    } catch (error) {
      console.error("Error updating case:", error);
      message.error(`Failed to update case`);
    }
  };

  const handleVerifyRescue = async () => {
    try {
      const values = await form.validateFields();
      console.log(values)
      console.log(currentCase)
      console.log(currentUserEmail)

      // Make sure currentCase and its _id exists
      if (!currentCase || !currentCase._id) {
        Swal.fire({
          title: "Error!",
          text: "No emergency case selected",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      const response = await axios.patch(
        "https://health-and-sanitation-backend.vercel.app/emergencyCasess/verify-rescue",
        {
          id: currentCase._id,
          userEmail: values.userEmail,
          volunteerEmail: currentUserEmail,
        }
      );
      console.log(response)

      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          text: "Case marked as rescued successfully",
          icon: "success",
          confirmButtonText: "OK",
        });

        // Update local state to remove the rescued case
        setCases(cases.filter((item) => item._id !== currentCase._id));
        setVerifyModalVisible(false);
        form.resetFields();
      } else {
        Swal.fire({
          title: "Error!",
          text: response.data.message || "Failed to verify rescue",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error verifying rescue:", error);
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          (error.response?.data?.error === "Server error"
            ? "Server error occurred"
            : "Failed to verify rescue"),
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleCancelVerify = () => {
    setVerifyModalVisible(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2} style={{ color: "#0A3B1E", marginBottom: "24px" }}>
        Emergency Cases Needing Help
      </Title>

      {cases.length === 0 && !loading ? (
        <Card
          style={{
            borderRadius: "12px",
            border: "1px dashed #008e48",
            textAlign: "center",
            padding: "40px 0",
          }}
        >
          <CheckCircleOutlined
            style={{
              fontSize: "48px",
              color: "#008e48",
              marginBottom: "16px",
            }}
          />
          <Title level={4} style={{ color: "#0A3B1E" }}>
            No Emergency Cases Found
          </Title>
          <Text type="secondary">
            There are currently no emergency cases requiring your assistance.
          </Text>
        </Card>
      ) : (
        <List
          itemLayout="vertical"
          size="large"
          dataSource={cases}
          loading={loading}
          renderItem={(item) => (
            <Card
              style={{
                marginBottom: "20px",
                borderRadius: "12px",
                borderLeft: "4px solid #008e48",
                boxShadow: "0 4px 12px rgba(0, 142, 72, 0.1)",
              }}
            >
              <div style={{ display: "flex", gap: "24px" }}>
                {item.calamityDetails?.image && (
                  <Avatar
                    src={item.calamityDetails.image}
                    shape="square"
                    size={150}
                    style={{ borderRadius: "8px" }}
                  />
                )}

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <Title level={4} style={{ color: "#0A3B1E", margin: 0 }}>
                        {item.calamityDetails?.title || "Unknown Crisis"}
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
                        <EnvironmentOutlined /> {item.location}
                      </Text>
                    </div>

                    <Space>
                      <Tag
                        color={
                          item.status === "Pending" ? "#faad14" : "#008e48"
                        }
                        style={{
                          borderRadius: "12px",
                          fontWeight: "500",
                          padding: "0 12px",
                          height: "24px",
                          lineHeight: "22px",
                        }}
                      >
                        {item.status.toUpperCase()}
                      </Tag>
                      <Tag
                        color={item.isRescued === "No" ? "#ff4d4f" : "#008e48"}
                        style={{
                          borderRadius: "12px",
                          fontWeight: "500",
                          padding: "0 12px",
                          height: "24px",
                          lineHeight: "22px",
                        }}
                      >
                        {item.isRescued === "No" ? "NEEDS HELP" : "RESCUED"}
                      </Tag>
                    </Space>
                  </div>

                  <Divider style={{ margin: "12px 0" }} />

                  <div style={{ marginBottom: "16px" }}>
                    <Text strong style={{ color: "#0A3B1E" }}>
                      Emergency Message:
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
                    }}
                  >
                    <div>
                      <Text strong style={{ color: "#0A3B1E" }}>
                        Contact Number
                      </Text>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "4px",
                        }}
                      >
                        <PhoneOutlined style={{ color: "#008e48" }} />
                        <Text>{item.phoneNumber}</Text>
                      </div>
                    </div>

                    <div>
                      <Text strong style={{ color: "#0A3B1E" }}>
                        Crisis Type
                      </Text>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "4px",
                        }}
                      >
                        <WarningOutlined style={{ color: "#008e48" }} />
                        <Text>{item.calamityDetails?.title || "Unknown"}</Text>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    {item.status === "Pending" && (
                      <Button
                        type="primary"
                        style={{
                          backgroundColor: "#008e48",
                          borderColor: "#008e48",
                          borderRadius: "6px",
                          fontWeight: "500",
                        }}
                        onClick={() => handleAction(item._id, "Approved")}
                      >
                        Approve Request
                      </Button>
                    )}

                    {item.isRescued === "No" && (
                      <Button
                        danger
                        style={{
                          borderRadius: "6px",
                          fontWeight: "500",
                        }}
                        onClick={() => showVerifyModal(item)}
                      >
                        Mark as Rescued
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        />
      )}

      {/* Verification Modal */}
      <Modal
        title="Verify Rescue"
        visible={verifyModalVisible}
        onOk={handleVerifyRescue}
        onCancel={handleCancelVerify}
        okText="Confirm Rescue"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="userEmail"
            label="Enter the victim's email for verification"
            rules={[
              { required: true, message: "Please input the email address" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="victim@example.com" />
          </Form.Item>
          <Text type="secondary">
            Please verify the email matches the emergency case before marking as
            rescued.
          </Text>
        </Form>
      </Modal>
    </div>
  );
};

export default EmergencyCases;
