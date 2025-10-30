import React from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";

export default function RegisterPage() {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    // Demo guest registration (would call backend with role guest)
    message.success("Guest registered, please login");
    window.location.href = "/";
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <Card title="Guest Registration" style={{ width: 360 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            {" "}
            <Input />{" "}
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", required: true }]}
          >
            {" "}
            <Input />{" "}
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, min: 6 }]}
          >
            {" "}
            <Input.Password />{" "}
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Register
          </Button>
        </Form>
        <Typography.Paragraph style={{ marginTop: 16 }}>
          Already have an account? <a href="/">Login</a>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
