import React, { Children } from "react";
import {
    FolderOutlined,
    UserOutlined,
    CalendarOutlined,
    DashboardOutlined,
    CheckSquareOutlined,
} from "@ant-design/icons";
import { Layout, Menu, MenuProps, theme } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import "./Layout.scss";

const { Header, Content, Footer, Sider } = Layout;

const MenuStyle = {
    height: "100%",
};

const items = [
    {
        key: "dashboard",
        icon: <DashboardOutlined />,
    },
    {
        key: "tasks",
        icon: <CheckSquareOutlined />,
    },
    {
        key: "calendar",
        icon: <CalendarOutlined />,
    },
    {
        key: "projects",
        icon: <FolderOutlined />,
    },
    {
        key: "profile",
        icon: <UserOutlined />,
    },
];

interface LayoutProps {
    children: React.ReactNode;
}

const TaskPageLayout: React.FC<LayoutProps> = ({ children }) => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleNavigation: MenuProps["onClick"] = (e) => {
        navigate("/" + e.key);
    };

    return (
        <Layout style={{ height: "100vh", width: "100%", display: "flex" }}>
            <Sider
                className="custom-sider"
                breakpoint="lg"
                collapsedWidth="0"
                width={"auto"}
            >
                <Menu
                    className="custom-menu"
                    style={MenuStyle}
                    theme="light"
                    mode="inline"
                    defaultSelectedKeys={["0"]}
                    items={items}
                    onClick={handleNavigation}
                />
            </Sider>
            <Content style={{ display: "flex", flexDirection: "column" }}>{children}</Content>
        </Layout>
    );
};

export default TaskPageLayout;
