import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TagService } from '@/services/tagService';
import { Project } from '../../../../shared';
import { TaskPriority, Tag } from '../../../../shared';
import {TaskTagAdd} from './TaskTagAdd';
import { TaskProjectMover } from './TaskProjectsMover';
import './TaskEditor.scss';
import { useTask } from '../../hooks/useTask';
import { Dropdown } from 'antd';


// 导入图片
import todayIcon from '@/assets/icons/today.png';
import tomorrowIcon from '@/assets/icons/tomorrow.png';
import weekIcon from '@/assets/icons/week.png';
import calendarIcon from '@/assets/icons/calendar.png';
import highIcon from '@/assets/icons/high.png';
import mediumIcon from '@/assets/icons/medium.png';
import lowIcon from '@/assets/icons/low.png';
import noneIcon from '@/assets/icons/none.png';
import tagIcon from '@/assets/icons/tag.png';
import deleteIcon from '@/assets/icons/delete.png';
import moveIcon from '@/assets/icons/move.png';

interface TaskEditorProps {
    leftPos: number;
    topPos: number;
    isOpen: boolean;
    onClose: () => void;
    handleDeleteTask: (taskId: string) => Promise<void>;
    taskId: string;
    taskPriority: TaskPriority;
}

const TaskEditor: React.FC<TaskEditorProps> = ({ 
    leftPos,
    topPos,
    isOpen, 
    onClose, 
    handleDeleteTask,
    taskId,
    taskPriority,
}) => {
    const { updateTask, updateTaskTags, setUserTags } = useTask();
    const moveButtonRef = useRef<HTMLDivElement>(null);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedPriority, setSelectedPriority] = useState<TaskPriority>(taskPriority);
    const [showCustomDatePicker, setShowCustomDatePicker] = useState<boolean>(false);
    const [showTagAdder, setShowTagAdder] = useState<boolean>(false);
    const [showProjectMover, setShowProjectMover] = useState<boolean>(false)
    const [projects, setProjects] = useState<Project[]>([]);
    const [taskTags, setTaskTags] = useState<string[]>([]);
    const {userTags} = useTask();


    // 处理标签创建
    const handleTagCreate = useCallback(async (tagName: string) => {
        try {
            const response = await TagService.create({ name: tagName });
            if(response.data) {
                setUserTags([...userTags, response.data]);
            }
        } catch (error) {
            console.error('创建标签失败:', error);
        }
    }, [setUserTags]);

    if(!isOpen) {
        return null;
    }

    // 日期选择
    const handleDateSelect = useCallback((e : React.MouseEvent<HTMLElement>) => {
        const button = (e.target as HTMLElement).closest('button') as HTMLElement | null;
        if (!button) return; // 如果找不到按钮元素，直接返回
        const dateType = button.className.split('-')[2]
        const today = new Date();
        let updatedDate: Date | null = null;
        
        if(dateType === 'customize') {
            // 点击自定义按钮时，切换日历显示状态
            setShowCustomDatePicker(prev => !prev);
        } else if(dateType === 'today') {
            updatedDate = today;
            setSelectedDate(today);
        } else if(dateType === 'tomorrow') {
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            updatedDate = tomorrow;
            setSelectedDate(tomorrow);
        } else if(dateType === 'week') {
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            updatedDate = nextWeek;
            setSelectedDate(nextWeek);
        }
        
        // 使用临时变量传递最新日期值
        if (dateType !== 'customize' && updatedDate) {
            updateTask(taskId, {
                dueDate: updatedDate,
            });
        }
    }, [updateTask, taskId]);
    
    // 处理自定义日期选择 
    const handleCustomDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            let updatedDate = new Date(e.target.value);
            setSelectedDate(updatedDate);
            updateTask(taskId, {
                dueDate: updatedDate,
            });
        }
    }, [updateTask, taskId]);
    
    // 格式化日期为date输入所需的格式
    const formatDateForInput = (date: Date): string => {
        return date.toISOString().slice(0, 10); // 格式: YYYY-MM-DD
    }
    
    // 点击遮罩层关闭编辑器
    const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    // 防止事件冒泡到遮罩层 - 确认编辑器区域点击不关闭
    const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    }, []);

    // 优先级更新函数
    const handlePriorityUpdate = useCallback((priority: TaskPriority) => {
        setSelectedPriority(priority);
        updateTask(taskId, {
            priority: priority
        });
    }, [updateTask, taskId]);

    return (
        <Dropdown
            placement="bottom"
            trigger={["click"]}
        >
        <div className="task-editor-overlay" onClick={handleOverlayClick}>
            <div className="task-editor" onClick={handleEditorClick} style={{ left: leftPos, top: topPos }}>
                <h3 className='task-editor-title'>日期</h3>
                <div className='date-choose-buttons' onClick={handleDateSelect}>
                    <button className='date-choose-today'>
                        <img src={todayIcon} alt="今天" />
                    </button>
                    <button className='date-choose-tomorrow'>
                        <img src={tomorrowIcon} alt="明天" />
                    </button>
                    <button className='date-choose-week'>
                        <img src={weekIcon} alt="下周" />
                    </button>
                    <button className='date-choose-customize'>
                        <img src={calendarIcon} alt="自定义" />
                    </button>
                </div>
                
                {/* 当点击自定义按钮时显示日历选择器 */}
                {showCustomDatePicker && (
                    <div className='custom-date-picker'>
                        <input
                            type="date"
                            id="dueDate"
                            name="dueDate"
                            value={formatDateForInput(selectedDate || new Date())}
                            onChange={handleCustomDateChange}
                            className="task-modal-input"
                            autoFocus
                        />
                    </div>
                )}
                <h3 className='task-editor-title'>优先级</h3>
                <div className='priority-choose-buttons'>
                    <button 
                        className={`priority-choose-high ${selectedPriority === TaskPriority.HIGH ? 'selected' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePriorityUpdate(TaskPriority.HIGH);
                        }}
                    >
                        <img src={highIcon} alt="高优先级" />
                    </button>  
                    <button 
                        className={`priority-choose-medium ${selectedPriority === TaskPriority.MEDIUM ? 'selected' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePriorityUpdate(TaskPriority.MEDIUM);
                        }}
                    >
                        <img src={mediumIcon} alt="中优先级" />
                    </button>
                    <button 
                        className={`priority-choose-low ${selectedPriority === TaskPriority.LOW ? 'selected' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePriorityUpdate(TaskPriority.LOW);
                        }}
                    >
                        <img src={lowIcon} alt="低优先级" />
                    </button>
                    <button 
                        className={`priority-choose-none ${selectedPriority === TaskPriority.NONE ? 'selected' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePriorityUpdate(TaskPriority.NONE);
                        }}
                    >
                        <img src={noneIcon} alt="无优先级" />
                    </button>
                </div>
                <div className = "task-options">
                    <div className='task-option-row tag' onClick={() => setShowTagAdder(true)}>
                        <img src={tagIcon} alt="标签" className='task-choose-tag'/>
                        <span>标签</span>
                    </div>
                    <div className='task-option-row delete' onClick={() => handleDeleteTask(taskId)}>
                        <img src={deleteIcon} alt="删除" className='task-delete'/>
                        <span>删除</span>
                    </div>
                    <div 
                        ref={moveButtonRef}
                        className='task-option-row move' 
                        onMouseEnter={() => setShowProjectMover(true)} 
                    >
                        
                        <img src={moveIcon} alt="移动" className='task-move'/>
                        <span>移动</span>
                    </div>
                    { showTagAdder && (
                        <div className="task-tag-overlay" onClick={() => setShowTagAdder(false)}>
                            <TaskTagAdd
                                style={{
                                    left: leftPos,
                                    top: topPos,
                                }}
                                handleTagCreate={handleTagCreate}
                                onClose={() => setShowTagAdder(false)}
                            />
                        </div>
                    )}

                    { showProjectMover &&(
                        <div 
                            className='task-mover-overlay'
                            onClick={() => {
                                setShowProjectMover(false)
                            }}
                        > 
                            <TaskProjectMover
                                taskId={taskId}
                                onClick={(e) => e.stopPropagation()}
                                onClose={() => setShowProjectMover(false)}
                                style={{
                                    position: 'fixed',
                                    left: `${ (moveButtonRef.current?.getBoundingClientRect().right || 0)}px`,
                                    top: `${moveButtonRef.current?.getBoundingClientRect().top || 0}px`,
                                    zIndex: 1000
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>

        </Dropdown>
       
    )
}

export default TaskEditor;

