import React, { useEffect, useRef, useState } from 'react';
import {TaskService} from '@/services/taskService';
import { Layout, Menu, MenuProps} from 'antd';
import { TagOutlined, MenuOutlined } from '@ant-design/icons';
import {CreateModal}  from '@/components/task/CreateModal';
import './TaskFilter.scss';
import useTask from '@/hooks/useTask';
import useAuth from '@/hooks/useAuth';
import { setPriority } from 'os';
type MenuItem = Required<MenuProps>['items'][number];

const { Sider } = Layout

export const TaskFilter: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('all');
  const [projectsItems, setProjectsItems] = useState<MenuProps['items']>([]);
  const [tagItems, setTagItems] = useState<MenuProps['items']>([]);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [createTagModalOpen, setCreateTagModalOpen] = useState(false);

  const {userProjects, userTags, setFilter, setProjects} = useTask();
  const {user} = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick :MenuProps['onClick'] = (e ) => {
  
    const keyPath = e.keyPath
    const parentKey = keyPath[1]
    if(parentKey === 'project'){
      setFilter({date: ''});
      setFilter({projectId: e.key})
    } else if(parentKey === 'tag'){
      setFilter({
        date: '',
        tagId: e.key})
    } else {
      if(e.key === 'default') {
        setFilter({
          projectId: user?.defaultProjectId
        })
      } else {
        setFilter({
          date: e.key
        })
      }
    }

    setSelectedKey(e.key)
  }

  const items = [
    {
      key: 'all',
      label: '所有'
    },
    {
      key: 'today',
      label: '今天'
    },
    {
      key: 'tomorrow',
      label: '明天'
    },
    {
      key: 'one-week',
      label: '最近7天'
    },
    {
      key: 'default',
      label: '收集箱'
    },
  ]
  const projectItem: MenuItem[] = [
    {
      key: 'project',
      label: (
        <div className="menu-header">
          <span>清单</span>
          <button
            className="add-button"
            onClick={(e) =>{
              e.stopPropagation()
              setCreateProjectModalOpen(true)
            }}
          >
            +
          </button>
        </div>
      ),
      children: userProjects?.map((project) => ({
        icon: <MenuOutlined />,
        key: project.id,
        label: project.name
      })) || []
    }
  ]
  const tagItem:MenuItem[] = [
    {
      key: 'tag',
      label: (
        <div className="menu-header">
          <span>标签</span>
          <button
            className="add-button"
            onClick={(e) => {
              e.stopPropagation()
              setCreateTagModalOpen(true)}}
          >
            +
          </button>
        </div>
      ),
      children: userTags?.map((tag) => ({
        icon: <TagOutlined />,
        key: tag.id,
        label: tag.name
      })) || []
    }
  ]
  

  // 菜单项目
  useEffect(() =>{
    setProjectsItems(userProjects?.map((project) => ({
      key: project.id,
      label: project.name
    })) || []);
  }, [userProjects, setProjects]);


  // 菜单标签
  useEffect(() =>{
    console.log("User Tags: ", userTags)
    setTagItems(userTags?.map((tag) => ({
      key: tag.id,
      label: tag.name
    })) || []);
  }, [userTags]);

  return (
    <>
      <div className="task-filter" ref={containerRef}>
        <Sider className='task-list-view-sider'  width={'220px'}>
          <Menu
            className='custom-menu'
            items={items}
            onClick={handleClick}
            selectedKeys={[selectedKey]}
          >
          </Menu>
          <Menu
            className='custom-submenu'
            items={projectItem}
            mode="inline"
            onClick={handleClick}
            selectedKeys={[selectedKey]}
          />
          <Menu
            className='custom-submenu'
            items={tagItem}
            mode="inline"
            onClick={handleClick}
            selectedKeys={[selectedKey]}
          />
        </Sider>
      </div>
      <CreateModal
        modalName="添加清单"
        open={createProjectModalOpen}
        onOk={() => setCreateProjectModalOpen(false)}
        onClose={() => setCreateProjectModalOpen(false)}
      />
      <CreateModal
        modalName='添加标签'
        open={createTagModalOpen}
        onOk={() => setCreateTagModalOpen(false)}
        onClose={() => setCreateTagModalOpen(false)}
      />
    </>
  );
};

export default TaskFilter;
