import React from "react";
import { Form, Input, Button, Card, Typography, message, Select } from "antd";
import { useAuth } from "../auth/AuthContext";
import { AuthUser, UserRole } from "../types/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    // TODO: call real auth REST endpoint
    // Simulate token + user retrieval
    const fakeToken = "fake-jwt-token";
    const user: AuthUser = {
      id: "u-" + Date.now(),
      role: values.role as UserRole,
      name: values.name,
      email: values.email,
    };
    login(fakeToken, user);
    message.success("登录成功");
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <Card title="登录" style={{ width: 400 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="role"
            label="角色"
            initialValue="guest"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "guest", label: "Guest" },
                { value: "employee", label: "Employee" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: "email", required: true, message: "请输入邮箱" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form>
        <Typography.Paragraph style={{ marginTop: 16 }}>
          没有账号？<a href="/register">注册</a>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
