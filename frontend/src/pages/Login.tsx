import React from "react";
import { Form, Input, Button, Card, Typography, message, Select } from "antd";
import { useAuth } from "../auth/AuthContext";
import { AuthUser, UserRole } from "../types/auth";
import { loginAuth } from "../api/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const role = values.role as UserRole;
    try {
      let token = "";
      let user: AuthUser;
      if (role === "employee") {
        if (!values.username || !values.password) {
          message.error("Username and password required");
          return;
        }
        const resp = await loginAuth(values.username, values.password);
        token = resp.access_token || "";
        if (!token) {
          message.error("用户名或密码错误");
          return;
        }
        user = { id: "employee", role: "employee", name: values.username };
      } else {
        if (!values.email || !values.phone) {
          message.error("Email and phone required");
          return;
        }
        token = "guest-session-" + Date.now();
        user = {
          id: "guest-" + Date.now(),
          role: "guest",
          email: values.email,
          phone: values.phone,
        };
      }
      login(token, user);
      message.success("Login successful");
      window.location.replace(role === "employee" ? "/admin" : "/reservations");
    } catch (e: any) {
      message.error(e.message || "Login failed");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <Card title="Login" style={{ width: 360 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="role"
            label="Role"
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
          <Form.Item shouldUpdate>
            {() => {
              const role = form.getFieldValue("role");
              if (role === "employee") {
                return (
                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: "Username required" }]}
                  >
                    <Input />
                  </Form.Item>
                );
              }
              return (
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    {
                      type: "email",
                      required: true,
                      message: "Email required",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item shouldUpdate>
            {() => {
              const role = form.getFieldValue("role");
              return role === "employee" ? (
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: "Password required" }]}
                >
                  <Input.Password />
                </Form.Item>
              ) : (
                <Form.Item
                  name="phone"
                  label="Phone"
                  rules={[
                    { required: true, message: "Phone required" },
                    {
                      pattern: /^1[3-9]\d{9}$/,
                      message: "Invalid phone number",
                    },
                  ]}
                >
                  <Input maxLength={11} />
                </Form.Item>
              );
            }}
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form>
        <Typography.Paragraph style={{ marginTop: 16 }}>
          Employee? <a href="/register">Register</a>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
