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
import { useLocation, useNavigate, Outlet } from "react-router-dom";
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

  // 构建不同角色的侧边菜单项，便于后续扩展
  const buildGuestItems = (): MenuProps["items"] => [
    {
      key: "/my",
      icon: <HomeOutlined />,
      label: "My Reservations",
    },
  ];
  // 目前员工仅一个 Admin 菜单，将来可在此处扩展
  const buildEmployeeItems = (): MenuProps["items"] => [
    {
      key: "/admin",
      icon: <ToolOutlined />,
      label: "Admin",
    },
  ];
  const buildAnonymousItems = (): MenuProps["items"] => [
    {
      key: "/login",
      icon: <LoginOutlined />,
      label: "Login",
    },
    {
      key: "/register",
      icon: <PlusCircleOutlined />,
      label: "Register",
    },
  ];

  const items: MenuProps["items"] = !user
    ? buildAnonymousItems()
    : user.role === "guest"
    ? buildGuestItems()
    : buildEmployeeItems();

  const onMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  const selectedKey = items?.some((i) => i && i.key === location.pathname)
    ? location.pathname
    : location.pathname.startsWith("/my/")
    ? "/my"
    : location.pathname;

  // Only hide chrome on explicit auth pages; allow anonymous to see chrome for navigation
  const hideChrome =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!hideChrome && (
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
      )}
      <Layout>
        {!hideChrome && (
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
        )}
        <Layout>
          <Content style={{ padding: hideChrome ? 0 : 24 }}>
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
          {!hideChrome && (
            <Footer style={{ textAlign: "center" }}>
              Hilton Reservation Demo ©2024
            </Footer>
          )}
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
