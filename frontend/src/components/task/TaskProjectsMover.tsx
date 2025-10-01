import React, { useState, useContext, useEffect } from 'react';
import { Project } from '../../../../shared/types';
import searchIcon from '@/assets/icons/search.png';
import { debounce } from 'lodash';
import { useTask } from '@/hooks/useTask';
import { UpdateTaskData } from '@/services/taskService';
import './TaskProjectMover.scss'
import useAuth from '@/hooks/useAuth';

interface TaskProjectMoverProps {
    taskId: string;
    onClose: () => void;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    style?: React.CSSProperties;
}

export const TaskProjectMover: React.FC<TaskProjectMoverProps> = ({taskId, onClose, onClick, style }) => {
    const { user } = useAuth();
    const { userProjects, updateTask } = useTask();
    const [inputValue, setInputValue] = useState('');
    const [filteredProjects, setFilteredProjects] = useState<Project[]>();

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

    // 处理搜索
    const handleProjectSearch = debounce((value: string) => {
        if (!userProjects) return;

        const newFilteredProjects = userProjects.filter(project =>
            project.name.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredProjects(newFilteredProjects);
    }, 200);


    useEffect(() => {
        setFilteredProjects(userProjects)
    }, [userProjects])

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
            
            {filteredProjects && filteredProjects.length > 0 && (
                <div className="project-list">
                    {filteredProjects.map(project => (
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
