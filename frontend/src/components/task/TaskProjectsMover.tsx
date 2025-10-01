import React, { useState, useContext, useEffect } from 'react';
import { Project } from '../../../../shared/types';
import searchIcon from '@/assets/icons/search.png';
import { debounce } from 'lodash';
import { useTask } from '@/hooks/useTask';
import { UpdateTaskData } from '@/services/taskService';
import './TaskProjectMover.scss'
import useAuth from '@/hooks/useAuth';

interface TaskProjectMoverProps {
    projects: Project[];
    taskId: string;
    onClose: () => void;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    style?: React.CSSProperties;
}

export const TaskProjectMover: React.FC<TaskProjectMoverProps> = ({ projects, taskId, onClose, onClick, style }) => {
    const { user } = useAuth();
    const { updateTask } = useTask();
    const [inputValue, setInputValue] = useState('');
    const [filterProjects, setFilterProjects] = useState<Project[]>(projects);

    // 处理任务移动
    const handleProjectMove = async (taskId: string, projectId: string) => {
        try {
            console.log('移动任务到项目:', taskId, projectId);
            await updateTask(taskId, { project: projectId });
            onClose();
        } catch (error) {
            console.error('移动任务到项目失败:', error);
        }
    }

    const handleProjectSearch = debounce(async (search: string) => {
        try {
            // 如果用户未登录，不执行搜索
            if (!user?.id) {
                setFilterProjects([]);
                return;
            }

            // 如果搜索内容为空，显示所有项目
            if (!search.trim()) {
                setFilterProjects(projects);
                return;
            }
            

            // 根据搜索内容过滤项目
            let filteredProjects = projects.filter(project => 
                project.name.includes(search)
            );
            if(filteredProjects.length > 0) {console.log("filteredProjects", filteredProjects)}
            setFilterProjects(filteredProjects);
        } catch (error) {
            console.error('搜索项目失败:', error);
            setFilterProjects([]);
        }
    }, 200);

    return (
        <div className="task-project-mover" style={style} onClick={onClick}>
            <div className='search-section'>
                <img className="search-icon" src={searchIcon} alt="搜索" />
                <input 
                    type="text" 
                    placeholder="搜索项目..." 
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        handleProjectSearch(e.target.value.trim());
                    }}
                    className="tag-input"
                />
            </div>
            
            {filterProjects.length > 0 && (
                <div className="project-list">
                    {filterProjects.map(project => (
                        <div 
                            key={project.id} 
                            className="project-item"
                            style={{ borderLeft: `4px solid ${project.color}` }}
                            onClick = {async (e) => {
                                e.stopPropagation();
                                await handleProjectMove(taskId, project.id);
                                onClose();
                            }}
                        >
                            <div className="project-name">{project.name}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
