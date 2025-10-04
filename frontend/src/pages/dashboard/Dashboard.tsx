import React, {useEffect, useState} from 'react';
import '../../styles/dashboard.css';
import useTask from '@/hooks/useTask';

const Dashboard: React.FC = () => {
  const [total, setTotal] = useState(0)
  const [todo, setTodo] = useState(0)
  const [inProgress, setInProgress] = useState(0)
  const [completed, setCompleted] = useState(0)

  const {tasks} = useTask()

  // 当tasks变化时更新统计数据
  useEffect(() => {
    calTasksState()
  }, [tasks])

  const TaskStatus = {
    Todo: 'Todo',
    InProgress: 'in_progress',
    Completed: 'done',
  }


  const calTasksState = () => {
    setTotal(tasks.length)
    setCompleted(tasks.filter(task => task.status === TaskStatus.Completed).length)
    setInProgress(tasks.filter(task => task.status === TaskStatus.InProgress).length)
    setTodo(tasks.filter(task => task.status === TaskStatus.Todo).length)
  }
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>仪表盘</h1>
        <p>欢迎来到 TodoList 系统</p>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>总任务数</h3>
            <div className="stat-number">{total}</div>
          </div>
          <div className="stat-card">
            <h3>待办任务</h3>
            <div className="stat-number">{todo}</div>
          </div>
          <div className="stat-card">
            <h3>进行中</h3>
            <div className="stat-number">{inProgress}</div>
          </div>
          <div className="stat-card">
            <h3>已完成</h3>
            <div className="stat-number">{completed}</div>

          </div>
        </div>
        
        <div className="recent-tasks">
          <h3>最近任务</h3>
          <p>暂无最近任务数据</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;