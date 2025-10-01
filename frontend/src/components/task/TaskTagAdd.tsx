import React, { useEffect, useState } from 'react';
import {useTask} from "@/hooks/useTask";
import {Tag} from "../../../../shared/types"
import { TagService } from '@/services/tagService';
import searchIcon from "../../assets/icons/search.png";
import "./TaskTagAdd.scss";

interface Props {
    handleTagCreate: (tagName: string) => Promise<void>;
    onClose: () => void;
    style?: React.CSSProperties;
}

export const TaskTagAdd: React.FC<Props> = ({ handleTagCreate, onClose, style }) => {
    const { setUserTags, updateTaskTags, userTags, currentTask } = useTask()
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [filterTags, setFilterTags] = useState<Tag[]>([]);

    // 标签选择
    const handleTagToggle = (tagId: string) => {
        setSelectedTags(prev => 
            prev.includes(tagId) 
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    // 确定按钮点击事件
    const handleConfirm = async () => {
        try {
            await handleTagAdd();
            await handleTagDelete();
            
            if(currentTask) {
                const response = await TagService.getTagsForTask(currentTask.id);
                // 获取更新后的标签列表并直接更新任务标签
                if(response.data) {
                    updateTaskTags(currentTask.id, response.data); 
                }
                onClose();
            }
        } catch (error) {
            console.error("添加标签失败", error);
        }
    };

    // 处理标签删除
    const handleTagDelete = async () => {
        try {
            const unselectedTagIds = userTags.filter(tag => !selectedTags.includes(tag.id)).map(tag => tag.id);

            for(const tagId of unselectedTagIds) {
                if(currentTask) await TagService.removeTagFromTask(currentTask?.id, tagId);
            }
        } catch (error) {
            console.error("删除标签失败", error);
        }
    };

    // 添加标签
    const handleTagAdd = async () => {
        try { 
            if(currentTask) {
                const addedTags = selectedTags.filter(tagId => !currentTask?.tags.map(tag => tag.id)?.includes(tagId));
                // 处理添加操作
                for (const tagId of addedTags) {
                    await TagService.addTagToTask(currentTask?.id, tagId);
                }
            }
        } catch (error) {
            console.error("添加标签失败", error);
        }
    };

    // 处理搜索
    const handleSearch = async (search: string) => {
        let newFilterTags = userTags.filter(tag => tag.name.toLowerCase().includes(search.toLowerCase()));
        setFilterTags(newFilterTags);
    }


    useEffect(() => {
        if(userTags.length > 0) {
            setFilterTags(userTags);
        }
    }, [userTags]);

    useEffect(() => {
        if(currentTask) setSelectedTags(currentTask?.tags.map(tag => tag.id))
    }, [currentTask?.tags])
    
    
    return (
        <div className="task-tag-add" onClick={e => e.stopPropagation()}>
            <div className="tag-input-container">
                <img className="search-icon" src={searchIcon}></img>
                <input 
                    type="text" 
                    placeholder="输入标签" 
                    value={inputValue}
                    onChange={(e) => {
                            setInputValue(e.target.value)
                            handleSearch(e.target.value)
                        }
                    }
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleTagCreate(inputValue.trim());
                            setInputValue("");
                        }
                    }}
                    className="tag-input"
                />
            </div>
            
            <div className="tags-list">
                {filterTags.length > 0 ? filterTags.map((tag) => (
                    <div key={tag.id} className="tag-item">
                        <div 
                            className={`tag-checkbox ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                            onClick={() => handleTagToggle(tag.id)}
                        />
                        <div 
                            className={`tag-name ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                            onClick={() => handleTagToggle(tag.id)}
                        >
                            {tag.name}
                        </div>
                        {selectedTags.includes(tag.id) && (
                            <div className="check-mark">✓</div>
                        )}
                    </div>
                )): <div><p>创建标签"{inputValue}"</p></div>}
            </div>
            
            <div className="action-buttons">
                <button className="cancel-btn" onClick={onClose}>
                    取消
                </button>
                <button className="confirm-btn" onClick={handleConfirm} >
                    确定
                </button>
            </div>
        </div>
    );
};