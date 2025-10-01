import React, { useEffect, useRef, useState } from 'react';
import { useTask } from '@/hooks/useTask';
import TaskList from '@/components/task/TaskList';
import TaskDetail from '@/components/task/TaskDetail';
import TaskOrganizer from '@/components/task/TaskOrganizer';
import { Layout, Menu, Splitter} from 'antd';
import './ListTaskView.scss';
import TaskFilter from '@/components/task/TaskFilter';

const ListTaskView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showIconMode, setShowIconMode] = useState<'auto' | boolean>(true);
  const { tasks, userProjects, userTags } = useTask();
  
  // 检查数据是否加载完成
  if (tasks.length === 0 || !userProjects || !userTags) {
    return <div>加载中...</div>;
  }


  return (
    <div className="task-view-container" ref={containerRef}>
      <Splitter>
        <Splitter.Panel
          collapsible={{ start: true, end: true, showCollapsibleIcon: showIconMode }}
          min="20%t"
        >
          <div className="task-list-section">
            <TaskOrganizer />
            <TaskList />
          </div>
        </Splitter.Panel>
      <Splitter.Panel collapsible={{ start: true, end: true, showCollapsibleIcon: showIconMode }}>
        <div className="task-detail-section">
          <TaskDetail />
        </div>
      </Splitter.Panel>
    </Splitter>
    </div>
  );
};

export default ListTaskView;