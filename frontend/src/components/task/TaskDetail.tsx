import React, { useEffect, useState, useRef }from "react";
import { usePopper } from "react-popper";
import { useTask } from '../../hooks/useTask';
import { TaskStatus } from '../../../../shared/types';
import { formatTimeToString } from '@/utils/generalFunction'
import { debounce, isArray } from 'lodash'; 
import { CalendarOutlined } from '@ant-design/icons';
import { TaskTimePicker } from '@/components/task/TaskTimerPicker';
import './taskDetail.scss';

const TaskDetail: React.FC = () => {
  const timePickerBtnRef = useRef<HTMLDivElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);
  const { currentTask, updateTask } = useTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isSettingTime, setIsSettingTime] = useState(false);

  const { styles, attributes } = usePopper(
  timePickerBtnRef.current,
  isSettingTime ? popperRef.current : null, // 只有打开时才传
  {
    placement: 'bottom-start',
    modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
  }
);

  useEffect(() => {
    if (currentTask) {
      setTitle(currentTask.title);
      setDescription(currentTask.description || '');
    }
  }, [currentTask]);

  // 防抖更新
  const debouncedUpdateTask = debounce(async (field: string, value: string) => {
    if (currentTask) {
      try {
        if (field === 'title' && value !== currentTask.title) {
          await updateTask(currentTask.id, { title: value });
        } else if (field === 'description' && value !== (currentTask.description || '')) {
          await updateTask(currentTask.id, { description: value });
        }
      } catch (error) {
        console.error(`更新任务${field}失败:`, error);
      }
    }
  }, 500);

  // 处理字段变化的通用函数
  const handleFieldChange = (field: 'title' | 'description', value: string) => {
    if (field === 'title') {
      setTitle(value);
    } else {
      setDescription(value);
    }
    debouncedUpdateTask(field, value);
  };

  // 如果没有选中任务，显示空状态
  if (!currentTask) {
    return (
      <div className="task-detail-container">
        <div className="task-detail-header">
          <div className="task-detail-title">
            <h2>任务详情</h2>
          </div>
        </div>
        <div className="task-detail-empty">
          <div className="empty-icon">📝</div>
          <p>选择一个任务查看详细信息</p>
        </div>
      </div>
    );
  }

  // 处理日期设置
  const handleSetDate = async (date: Date | [Date, Date] | null) => {
    if(isArray(date))
      await updateTask(currentTask.id, {startDate: date[0], dueDate: date[1]})
    else{
      if(date) {
        await updateTask(currentTask.id, {dueDate: date})
      }
    }
  }

  // 处理任务状态切换
  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (currentTask.status !== newStatus) {
      try {
        await updateTask(currentTask.id, { status: newStatus });
      } catch (error) {
        console.error('更新任务状态失败:', error);
      }
    }
  };

  // 获取优先级显示文本
  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case 'high':
        return '高优先级';
      case 'medium':
        return '中优先级';
      case 'low':
        return '低优先级';
      default:
        return '无优先级';
    }
  };

  return (
    <div className="task-detail-container">
      <div className="task-detail-header">
        <div className="time-picker-button" 
          ref = {timePickerBtnRef} 
          onClick={
            ()=> {
              setIsSettingTime(true)}
            }
        >
           <CalendarOutlined 
            className = {`calendar-icon ${currentTask.dueDate ? 'has-date' : ''}`}/>
          {
            currentTask.dueDate ? 
            <span className="dueDate">
              { formatTimeToString(currentTask.dueDate) }
            </span> 
            : <span className="default-text">
              设置日期
            </span>
          }
        </div>

        {
          isSettingTime && (
            <div
              ref = {popperRef} 
              style={styles.popper}
              {...attributes.popper}>
                  <TaskTimePicker
                  
                  onConfirm ={ handleSetDate }
                  onCancel = {()=>{setIsSettingTime(false)}}
                />
            </div>
           
          )
        }
      </div>
      
      <div className="task-detail-content">
        <div className="task-detail-title">
          {
            isEditingTitle ? ( 
              <input 
                type="text" 
                value={title} 
                onChange={(e) => handleFieldChange('title', e.target.value)} 
                onBlur={() => setIsEditingTitle(false)}
              />
            )
            :<h2 onDoubleClick={() => setIsEditingTitle(true)}>{title}</h2>
          }
          
        </div>
        {/* 任务描述 */}
        { (
          <div className="task-description-field" onDoubleClick={() => setIsEditingDescription(true)}>

            {
              isEditingDescription ? (
                <textarea
                  className="task-description-textarea"
                  value={description} 
                  onChange={(e) => handleFieldChange('description', e.target.value)} 
                  onBlur={() => setIsEditingDescription(false)}
                />
              )
              : (
                <p className="task-description-text">
                  {description}
                </p>
              )
            }
            
           
          </div>
        )}
        
        {/* 任务状态 */}
        <div className="task-detail-field">
          <h3>状态</h3>
          <div className="status-selector">
            <button 
              className={`status-btn ${currentTask.status === TaskStatus.TODO ? 'active' : ''}`}
              onClick={() => handleStatusChange(TaskStatus.TODO)}
            >
              待办
            </button>
            <button 
              className={`status-btn ${currentTask.status === TaskStatus.IN_PROGRESS ? 'active' : ''}`}
              onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
            >
              进行中
            </button>
            <button 
              className={`status-btn ${currentTask.status === TaskStatus.DONE ? 'active' : ''}`}
              onClick={() => handleStatusChange(TaskStatus.DONE)}
            >
              已完成
            </button>
          </div>
        </div>
        
        {/* 任务优先级 */}
        {currentTask.priority && (
          <div className="task-detail-field">
            <h3>优先级</h3>
            <span className={`priority-badge priority-${currentTask.priority}`}>
              {getPriorityText(currentTask.priority)}
            </span>
          </div>
        )}
        
        {/* 标签信息 */}
        {currentTask.tags && currentTask.tags.length > 0 && (
          <div className="task-detail-field">
            <h3>标签</h3>
            <div className="tags-container">
              {currentTask.tags.map((tag, index) => (
                <span key={index} className="tag-badge">
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;