import React from "react";
import { Form, Input, Button, Card, Typography, message, Select } from "antd";
import { useAuth } from "../auth/AuthContext";
import { loginEmployee, loginGuest, introspectToken } from "../api/auth";
import { UserRole } from "../types/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [form] = Form.useForm();

  const submit = async (values: any) => {
    try {
      if (values.role === "employee") {
        const resp = await loginEmployee(values.username, values.password);
        const token = resp.access_token;
        const info = (await introspectToken(token)) as IntrospectInfo;
        if (!info.active) throw new Error("Token inactive");
        login(token, {
          id: info.sub || "",
          role: info.role!,
          name: info.username,
        });
        window.location.replace("/admin");
        return;
      }
      // guest
      const resp = await loginGuest(values.email, values.phone);
      const token = resp.access_token;
      const info = (await introspectToken(token)) as IntrospectInfo;
      if (!info.active) throw new Error("Token inactive");
      login(token, {
        id: info.sub || "",
        role: info.role!,
        name: info.username,
      });
      window.location.replace("/my");
    } catch (err: any) {
      message.error(err.message || "Login failed");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <Card title="Login" style={{ width: 420 }}>
        <Form
          layout="vertical"
          form={form}
          onFinish={submit}
          initialValues={{ role: "guest" }}
        >
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
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
                  <>
                    <Form.Item
                      name="username"
                      label="Username"
                      rules={[{ required: true, message: "Username required" }]}
                    >
                      <Input autoComplete="username" />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[{ required: true, message: "Password required" }]}
                    >
                      <Input.Password autoComplete="current-password" />
                    </Form.Item>
                  </>
                );
              }
              return (
                <>
                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: "Username required" }]}
                  >
                    <Input autoComplete="username" />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    label="Phone"
                    rules={[
                      {
                        required: true,
                        pattern: /^[0-9\-+]{6,20}$/,
                        message: "Invalid phone",
                      },
                    ]}
                  >
                    <Input autoComplete="tel" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ type: "email", message: "Invalid email" }]}
                  >
                    <Input autoComplete="email" />
                  </Form.Item>

                  <Form.Item shouldUpdate noStyle>
                    {() => {
                      // show helper only when both contact fields empty
                      const email = form.getFieldValue("email");
                      const phone = form.getFieldValue("phone");
                      return !email && !phone ? (
                        <div
                          style={{
                            color: "#faad14",
                            fontSize: 12,
                            marginBottom: 12,
                          }}
                        >
                          Provide Email 或 Phone 其一
                        </div>
                      ) : null;
                    }}
                  </Form.Item>
                </>
              );
            }}
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form>
        <Typography.Paragraph style={{ marginTop: 16 }}>
          No account? <a href="/register">Register</a>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}

interface IntrospectInfo {
  active: boolean;
  sub?: string;
  role?: UserRole;
  username?: string;
}
