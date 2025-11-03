import React from "react";
import { Form, Input, Button, Card, Typography, message, Select } from "antd";
import { registerEmployeeNew, registerGuest } from "../api/auth";

export default function RegisterPage() {
  const [form] = Form.useForm();

  const submit = async (values: any) => {
    const role = values.role;
    try {
      if (role === "employee") {
        if (!values.username || !values.password) {
          message.error("Username & password required");
          return;
        }
        await registerEmployeeNew(values.username, values.password);
      } else {
        if (!values.username) {
          message.error("Guest username required");
          return;
        }
        if (!values.email && !values.phone) {
          message.error("Email 或 Phone 至少一个");
          return;
        }
        await registerGuest({
          username: values.username,
          email: values.email,
          phone: values.phone,
        });
      }
      message.success("Registered successfully, please login");
      window.location.replace("/");
    } catch (err: any) {
      message.error(
        JSON.parse((err as Error).message).message || "Register failed"
      );
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <Card title="Register" style={{ width: 460 }}>
        <Form
          layout="vertical"
          form={form}
          onFinish={submit}
          initialValues={{ role: "guest" }}
        >
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            {" "}
            <Select
              options={[
                { value: "guest", label: "Guest" },
                { value: "employee", label: "Employee" },
              ]}
            />{" "}
          </Form.Item>
          <Form.Item shouldUpdate>
            {() => {
              const role = form.getFieldValue("role");
              return (
                <>
                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: "Username required" }]}
                  >
                    <Input autoComplete="username" />
                  </Form.Item>
                  {role === "employee" && (
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[
                        {
                          required: true,
                          min: 6,
                          message: "Password >= 6 chars",
                        },
                      ]}
                    >
                      {" "}
                      <Input.Password />{" "}
                    </Form.Item>
                  )}
                  {role === "guest" && (
                    <>
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ type: "email", message: "Invalid email" }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name="phone"
                        label="Phone"
                        rules={[
                          {
                            pattern:
                              /^(?:\+?86)?(?:1[3-9]\d{9}|0\d{2,3}-?\d{7,8})$/,
                            message: "手机号格式错误",
                          },
                        ]}
                      >
                        <Input placeholder="例如: 13812345678 或 010-12345678" />
                      </Form.Item>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#888",
                          marginTop: -4,
                          marginBottom: 12,
                        }}
                      >
                        Guest: Email 或 Phone 至少填写一个
                      </div>
                    </>
                  )}
                </>
              );
            }}
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
