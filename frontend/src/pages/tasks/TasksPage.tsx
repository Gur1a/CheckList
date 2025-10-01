import React from "react";
import { Outlet } from "react-router-dom";
import TaskFilter from '@/components/task/TaskFilter';
import { Flex } from "antd";

const TasksPage: React.FC = () => {

  return (
    <Flex style={{width: '100%', maxHeight: '100vh'}}>
      <TaskFilter/>
      <Outlet />
    </Flex>
  );
};

export default TasksPage;