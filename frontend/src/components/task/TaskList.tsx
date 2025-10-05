import React, { useEffect, useState, useRef } from "react";
import { List } from 'react-virtualized';
import TaskEditor from "./TaskEditor";
import { Task, TaskStatus } from "../../../../shared/types";
import { useTask } from "../../hooks/useTask";
import { handleDateFilter } from "@/utils/generalFunction";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import "./taskList.scss";
import moreIcon from "@/assets/icons/more.png";

const TaskList: React.FC = () => {
  const {
    updateTask,
    deleteTask,
    filter,
    tasks,
    error,
    currentTask,
    setCurrentTask,
  } = useTask();
  
  // 添加调试日志
  useEffect(() => {
    console.log('TaskList - tasks updated:', tasks);
  }, [tasks]);
  
  const [isEdit, setIsEdit] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [filterTasks, setFilterTasks] = useState<Task[]>(tasks);

  // 处理任务选择
  const handleSelectTask = (task: Task) => {
    setCurrentTask(task);
  };

  // 处理删除任务
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("删除任务失败:", error);
    }
  };

  // 处理更新任务
  const handleToggleComplete = async (task: Task) => {
    try {
      await updateTask(task.id, {
        status:
          task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE,
      });
    } catch (error) {
      console.error("更新任务失败:", error);
    }
  };

  // 格式化时间显示
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MM月dd日", { locale: zhCN });
    } catch {
      return "";
    }
  };

  const rowRenderer = ({ index, key, style }: any) => { 
    const task = filterTasks[index];
    
    return (
      <div 
        key={key} 
        style={style} 
        className={`task-item ${currentTask?.id === task.id ? "selected" : ""}`}
        onClick={() => handleSelectTask(task)}
      >
        <div className="task-content">
          <div className="task-main">
            <input
              type="checkbox"
              className="task-checkbox"
              checked={task.status === TaskStatus.DONE}
              onChange={() => handleToggleComplete(task)}
              title={
                task.status === TaskStatus.DONE
                  ? "标记为未完成"
                  : "标记为完成"
              }
              onClick={(e) => e.stopPropagation()} // 防止触发任务选择
            />
            <div className="task-details">
              <h4 className={`task-title ${task.status === TaskStatus.DONE ? "completed" : ""}`}>
                {task.title}
              </h4>
            </div>
          </div>
          <div className="task-meta">
            {task.tags && task.tags.length > 0 &&
              task.tags.map((tag) => (
                <span key={tag.id} className="task-tag">
                  {tag.name}
                </span>
              ))
            }
            {task.priority && (
              <span className={`task-priority ${task.priority}`}>
                {task.priority === "high"
                  ? "高优先"
                  : task.priority === "medium"
                    ? "中优先"
                    : task.priority === "low"
                      ? "低优先"
                      : ""}
              </span>
            )}
            {task.projectInfo?.name && (
              <span className="task-project">
                {task.projectInfo.name}
              </span>
            )}
            {task.dueDate && (
              <span className="task-time">
                {formatTime(new Date(task.dueDate).toDateString())}
              </span>
            )}
          </div>
          <div className="task-more">
            <button
              className="btn-edit"
              title="编辑任务"
              onClick={(e) => {
                e.stopPropagation(); // 防止触发任务选择
                setPosition({ left: e.clientX, top: e.clientY });
                setCurrentTask(task); // 确保设置当前任务
                setIsEdit(true);
              }}
            >
              <img src={moreIcon} alt="更多操作" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    let newFilterTasks: Task[] = [];
    if (filter.date) {
      if (filter.date === 'all') {
        newFilterTasks = tasks;
      } else {
        newFilterTasks = handleDateFilter(filter.date, tasks);
      }
      setFilterTasks(newFilterTasks);
    } else if (filter.tagId) {
      newFilterTasks = tasks.filter(task => {
        return task.tags && task.tags.some(tag => {
          return String(tag.id) === String(filter.tagId);
        });
      });
      setFilterTasks(newFilterTasks);
    } else if (filter.projectId) {
      setFilterTasks(tasks.filter(task => String(task.project) === String(filter.projectId)));
    } else {
      setFilterTasks(tasks); // 默认显示所有任务
    }
  }, [filter, tasks]);

  // 错误状态
  if (error) {
    return <div className="task-list-error">加载任务失败: {error}</div>;
  }

  // 空状态
  if (!filterTasks || filterTasks.length === 0) {
    return <div className="task-list-empty">暂无任务</div>;
  }

  return (
    <div className="task-list-container">
      <List
        height={'1080'} // 固定容器高度，不是内容总高度
        width={'100'}  // 固定宽度或100%
        rowCount={filterTasks.length}
        rowHeight={50} // 根据你的内容调整行高
        rowRenderer={rowRenderer}
        style={{ outline: 'none' }} // 移除焦点边框
      />
      
      {/* TaskEditor移到外部 */}
      {isEdit && currentTask && (
        <TaskEditor
          leftPos={position.left}
          topPos={position.top}
          isOpen={isEdit}
          onClose={() => setIsEdit(false)}
          handleDeleteTask={handleDeleteTask}
          taskId={currentTask.id}
          taskPriority={currentTask.priority || ""}
        />
      )}
    </div>
  );
};

export default TaskList;