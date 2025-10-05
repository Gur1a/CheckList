import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTask } from '../../hooks/useTask';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import '../../styles/CalendarPage.css';
import TaskService from '@/services/taskService';

// 类型定义
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  startStr?: string;
  endStr?: string;
  allDay: boolean;
  extendedProps: {
    priority: string;
    status: string;
  };
}

const CalendarPage: React.FC = () => {
  const { tasks, loading, setCurrentTask, updateTask, setTasks} = useTask();
  const {user} = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listYear'>('dayGridMonth');

  // 将任务转换为日历事件
  useEffect(() => {
    if (tasks) {
      const calendarEvents: CalendarEvent[] = tasks
        .filter(task => task.dueDate && task.startDate) // 只显示有截止日期的任务
        .map(task => ({
          id: task.id,
          title: task.title,
          allDay: task.startDate == null && task.dueDate == null ? true : false,
          start: new Date(task.startDate!),
          end: new Date(task.dueDate!),
          editable: true, //可拖拽
          startEditable: true,
          borderColor: task.color,
          backgroundColor: task.color,
          durationEditable: true,
          extendedProps: {
            priority: task.priority,
            status: task.status
          }
        }));
      setEvents(calendarEvents);
    }
  }, [tasks]);

  // 处理视图切换
  const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listYear') => {
    setCurrentView(view);
  };

  // 处理日期点击
  const handleDateClick = async (arg: any) => {
    
  };

  // 处理事件点击
  const handleEventClick = async (arg: any) => {
     try {
      const cur = (await TaskService.getById(arg.event.id)).data;
      if(cur) setCurrentTask(cur);
    } catch (error) {
      console.error('获取任务失败:', error);
    }
  };

  // 处理事件拖拽停止
  const handleEventDragStop = async (arg: any) => {
    console.log('任务拖拽停止:', arg.event);
    try {
      // 使用 updateTask 更新任务，这会同时更新 API 和全局状态
      await TaskService.update(arg.event.id, { 
        startDate: arg.event.start,
        dueDate: arg.event.end
      });
      
      
      if(user) {
        const data = await TaskService.getByUserId(user?.id);
        if(data.data) setTasks(data.data);
      }
    } catch (error) {
      console.error('更新任务失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="calendar-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <div className="calendar-content">
        <FullCalendar
          themeSystem='bootstrap5'
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={currentView}
          events={events}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listYear'
          }}
          locale="zh-cn"
          buttonText={{
            today: '今天',
            month: '月',
            week: '周',
            day: '日',
            list: '列表'
          }}
          views={{
            listYear: {
              type: 'list',
              duration: { year: 1 },
              buttonText: '年'
            }
          }}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDragStop}
          height="100%"
          aspectRatio={2}
        />
      </div>
    </div>
  );
};

export default CalendarPage;