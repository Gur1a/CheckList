import React, { useState, useEffect } from 'react';
import { useTask } from '../../hooks/useTask';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import '../../styles/CalendarPage.css';

// 类型定义
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  extendedProps: {
    priority: string;
    status: string;
  };
}

const CalendarPage: React.FC = () => {
  const { tasks, loading } = useTask();
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
  const handleDateClick = (arg: any) => {
    console.log('点击日期:', arg.date);
  };

  // 处理事件点击
  const handleEventClick = (arg: any) => {
    console.log('点击事件:', arg.event);
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
      <div className="calendar-header">
        <h1>任务日历</h1>
      </div>
      
      <div className="calendar-content">
        <FullCalendar
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
          height="auto"
          aspectRatio={2}
        />
      </div>
    </div>
  );
};

export default CalendarPage;