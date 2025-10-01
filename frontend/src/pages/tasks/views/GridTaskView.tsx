import React, { useEffect } from 'react';
import TaskOrganizer from '../../../components/task/TaskOrganizer';
import { useTask } from '../../../hooks/useTask';

const GridTaskView: React.FC = () => {
  const { setFilter } = useTask();

  // 初始化时设置为网格视图相关的过滤器
  useEffect(() => {
    setFilter({
      status: undefined,
      priority: undefined,
      search: undefined
    });
  }, [setFilter]);

  return (
    <div className="task-view">
    </div>
  );
};

export default GridTaskView;