import React, { useEffect, useState } from "react";
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
  const [isEdit, setIsEdit] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [FilterTasks, setFilterTasks] = useState<Task[]>(tasks);

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

  // 处理更新任务（这里简单切换完成状态）
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

  // 错误状态
  if (error) {
    return <div className="task-list-error">加载任务失败: {error}</div>;
  }

  // 空状态
  if (!tasks || tasks.length === 0) {
    return <div className="task-list-empty">暂无任务</div>;
  }

  useEffect(() => {
    console.log("debug:", filter)
    let newFilterTasks: Task[] = [];
      if(filter.date){
        if(filter.date === 'all'){
          newFilterTasks = tasks;
        } else {
          newFilterTasks = handleDateFilter(filter.date, tasks);
        }
        setFilterTasks(newFilterTasks);
      } else if(filter.tagId){
        newFilterTasks = tasks.filter(task => {
          return task.tags && task.tags.some(tag => {
            return String(tag.id) === String(filter.tagId);
          });
        });
        
        setFilterTasks(newFilterTasks);
      } else if(filter.projectId){
        setFilterTasks(tasks.filter(task => String(task.project) === String(filter.projectId)));
      }
  }, [filter, tasks]);

  return (
    <div className="task-list">
      <ul className="task-list-container">
        {FilterTasks.map((task) => (
          <li
            key={task.id}
            className={`task-item ${currentTask?.id === task.id ? "selected" : ""
              }`}
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
                />
                <div className="task-details">
                  <h4
                    className={`task-title ${task.status === TaskStatus.DONE ? "completed" : ""
                      }`}
                  >
                    {task.title}
                  </h4>
                </div>
              </div>
              <div className="task-meta">
                {task.tags && task.tags.length > 0
                  ? task.tags.map((tag) => (
                    <span key={tag.id} className="task-tag">
                      {tag.name}
                    </span>
                  ))
                  : null
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
                {task.projectInfo.name &&(
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
                    // 先更新位置
                    setPosition({ left: e.clientX, top: e.clientY });
                    // 再打开编辑器
                    setIsEdit(true);
                  }}
                >
                  <img src={moreIcon} />
                </button>
              </div>
           
              {isEdit && task.id === currentTask?.id && (
                <TaskEditor
                  leftPos={position.left}
                  topPos={position.top}
                  isOpen={isEdit}
                  onClose={() => setIsEdit(false)}
                  handleDeleteTask={handleDeleteTask}
                  taskId={currentTask?.id || ""}
                  taskPriority={currentTask?.priority || ""}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
