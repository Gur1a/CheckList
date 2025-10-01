import { zhCN } from "date-fns/locale";
  import { format } from "date-fns";
  import { Task} from "../../../shared/types";
  import dayjs from 'dayjs'
  
  // 将时间转换为月日格式，如 05月01日
  export const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MM月dd日", { locale: zhCN });
    } catch {
      return "";
    }
  };


  // 将Date转化为DD:HH:MM的字符串
  export const formatTimeToString = (date : Date) => {
    return formatTime(new Date(date).toDateString())
  }

  export const handleDateFilter = (type: string, tasks: Task[]) => {
    let newFilterTasks: Task[] = [];
    if (type === 'today') {
      const today = format(new Date(), 'yyyy-MM-dd');
      newFilterTasks = tasks.filter(task => {
        if(task.dueDate){
          try {
            return format(new Date(task.dueDate), 'yyyy-MM-dd') === today;
          } catch {
            return false;
          }
        }
        return false;
      });
      return newFilterTasks;
    } else if(type === 'one-week'){
      const weekStart = format(new Date(), 'yyyy-MM-dd');
      const weekEnd = format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      newFilterTasks = tasks.filter(task => {
        if(task.dueDate){
          try {
            const taskDate = format(new Date(task.dueDate), 'yyyy-MM-dd');
            return taskDate >= weekStart && taskDate <= weekEnd;
          } catch {
            return false;
          }
        }
        return false;
      });
      return newFilterTasks;
    } else if(type === 'tomorrow'){
      const tomorrow = format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      newFilterTasks = tasks.filter(task => {
        if(task.dueDate){
          try {
            return format(new Date(task.dueDate), 'yyyy-MM-dd') === tomorrow;
          } catch {
            return false;
          }
        }
        return false;
      });
    }
    return newFilterTasks;
  }

  // 合并日期和时间点
  export const mergeDateAndTime = (date: Date | null, time: dayjs.Dayjs | null): Date | null => {
    if (!date || !time) return null;

    const dayjsDate = dayjs(date); // 把 Date 转为 dayjs
    const merged = dayjsDate.set('hour', time.hour())
                            .set('minute', time.minute())
                            .set('second', 0)
                            .set('millisecond', 0);

    return merged.toDate(); // 转回 Date
};