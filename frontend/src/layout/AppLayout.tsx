import React from "react";
import { Layout, Menu, Button, Space, Typography } from "antd";
import { useLocation, useNavigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { MenuProps } from "antd";

const { Header, Sider, Content, Footer } = Layout;

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const items: MenuProps["items"] = [
    user &&
      user.role === "guest" && { key: "/reservations", label: "Reservations" },
    user && user.role === "guest" && { key: "/register", label: "Register" },
    user && user.role === "employee" && { key: "/admin", label: "Admin" },
    !user && { key: "/login", label: "Login" },
  ].filter(Boolean) as MenuProps["items"];

  const onMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  const selectedKey = items?.some((i) => i && i.key === location.pathname)
    ? location.pathname
    : location.pathname.startsWith("/reservations/")
    ? "/reservations"
    : location.pathname;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{ display: "flex", alignItems: "center", padding: "0 16px" }}
      >
        <div style={{ color: "#fff", fontWeight: 600, marginRight: 24 }}>
          Hilton Reservations Demo
        </div>
        <div style={{ flex: 1 }} />
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
      <Layout>
        <Sider
          breakpoint="lg"
          collapsedWidth={64}
          width={200}
          style={{ background: "#fff" }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={items}
            onClick={onMenuClick}
            style={{ height: "100%", borderRight: 0 }}
          />
        </Sider>
        <Layout>
          <Content style={{ padding: 24 }}>
            <Outlet />
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Hilton Reservation Demo ©2024
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
