import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import TaskFilter from '@/components/task/TaskFilter';
import { Flex } from "antd";
import TaskService from "@/services/taskService";

const TasksPage: React.FC = () => {
  useEffect(()=> {
    TaskService
  }, [])

  return (
    <Flex style={{width: '100%', maxHeight: '100vh'}}>
      <TaskFilter/>
      <Outlet />
    </Flex>
  );
};

export default TasksPage;