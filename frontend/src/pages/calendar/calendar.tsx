import React, {useState} from "react"
import useTask from "@/hooks/useTask"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"

const Calendar: React.FC = () => {
  // 视图状态
  const [currentView, setCurrentView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay">("dayGridMonth")
  const { tasks, loading } = useTask()


    return (
      <>
      <div className="calendar-pager">
        <div className="calendar-header">
          <h1>任务日历</h1>  
        </div>
        <div className="calendar-content">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={[
              {
                title: "Event 1",
                start: "2023-07-01",
                end: "2023-07-03",
              },
              {
                title: "Event 2",
                start: "2023-07-05",
              }
            ]}
          />
        </div>
      </div>
      </>
    )
}