import React from "react";
import { Layout, Menu, Button, Space, Typography } from "antd";
import { useLocation, useNavigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { MenuProps } from "antd";

const { Header, Content, Footer } = Layout;

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const items: MenuProps["items"] = [
    { key: "/", label: "Home" },
    user ? { key: "/my", label: "My Reservations" } : null,
    user?.role === "employee" ? { key: "/admin", label: "Admin" } : null,
    !user ? { key: "/login", label: "Login" } : null,
    !user ? { key: "/register", label: "Register" } : null,
  ].filter((i): i is Exclude<typeof i, null> => i !== null);

  const onMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <div style={{ color: "#fff", fontWeight: 600, marginRight: 32 }}>
          Hilton Reservations
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[
            location.pathname.startsWith("/reservations/")
              ? "/"
              : location.pathname,
          ]}
          items={items}
          onClick={onMenuClick}
          style={{ flex: 1 }}
        />
        {user && (
          <Space>
            <Typography.Text style={{ color: "#fff" }}>
              Hi, {user.name || user.role}
            </Typography.Text>
            <Button size="small" onClick={logout}>
              Logout
            </Button>
          </Space>
        )}
      </Header>
      <Content style={{ padding: 24 }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Hilton Reservation Demo ©2024
      </Footer>
    </Layout>
  );
};

export default AppLayout;
