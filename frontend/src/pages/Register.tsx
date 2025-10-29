import React from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";

export default function RegisterPage() {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    // TODO: call real register REST endpoint
    message.success("注册成功，请登录");
    window.location.href = "/login";
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <Card title="注册" style={{ width: 400 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            {" "}
            <Input />{" "}
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: "email", required: true }]}
          >
            {" "}
            <Input />{" "}
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, min: 6 }]}
          >
            {" "}
            <Input.Password />{" "}
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            注册
          </Button>
        </Form>
        <Typography.Paragraph style={{ marginTop: 16 }}>
          已有账号？<a href="/login">登录</a>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
