import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Space, Typography, Spin } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  PlusCircleOutlined,
  ToolOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { MenuProps } from "antd";

const { Header, Sider, Content, Footer } = Layout;

export const AppLayout: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem("ui.sider.collapsed");
      return v === "true";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("ui.sider.collapsed", String(collapsed));
    } catch {}
  }, [collapsed]);
  const location = useLocation();
  const navigate = useNavigate();

  const items: MenuProps["items"] = [
    user &&
      user.role === "guest" && {
        key: "/reservations",
        icon: <HomeOutlined />,
        label: "Reservations",
      },
    user &&
      user.role === "guest" && {
        key: "/register",
        icon: <PlusCircleOutlined />,
        label: "Register",
      },
    user &&
      user.role === "employee" && {
        key: "/admin",
        icon: <ToolOutlined />,
        label: "Admin",
      },
    !user && { key: "/login", icon: <LoginOutlined />, label: "Login" },
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
      <>
        <Button
          size="small"
          shape="circle"
          type="default"
          onClick={() => setCollapsed((c) => !c)}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          style={{
            position: "fixed",
            top: "50%",
            left: (collapsed ? 64 : 200) - 24,
            transform: "translateY(-50%)",
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        />
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
              <Button
                size="small"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </Button>
            </Space>
          )}
        </Header>
      </>
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(c) => setCollapsed(c)}
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
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: 48,
                }}
              >
                <Spin size="large" />
              </div>
            ) : (
              <Outlet />
            )}
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
