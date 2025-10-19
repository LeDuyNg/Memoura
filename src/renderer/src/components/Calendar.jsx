import React, { useState, useEffect } from 'react';
import '../assets/Calendar.css';

// Event data remains the same.
// In a real app, you would filter events based on the currently displayed month.
const events = {
  // Key is "YYYY-M-D" for uniqueness across months/years
  "2025-9-2": [{ id: 1, title: 'Yom Kippur', color: 'purple' }],
  "2025-9-3": [{ id: 2, title: 'Group meeting', color: 'orange' }, { id: 3, title: '+3 more', color: 'more' }],
  "2025-9-6": [{ id: 4, title: 'Read paper', color: 'blue' }, { id: 5, title: '+3 more', color: 'more' }],
  "2025-9-10": [{ id: 6, title: 'Section 8...', color: 'orange' }, { id: 7, title: '+7 more', color: 'more' }],
  "2025-9-13": [{ id: 8, title: 'Columbus...', color: 'purple' }, { id: 9, title: 'Indigenou...', color: 'purple' }],
  "2025-9-21": [{ id: 11, title: 'Diwali', color: 'purple' }],
  "2025-9-31": [{ id: 12, title: 'Halloween', color: 'purple' }],
};

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date()); // Initialize to Oct 18, 2025
  const [daysInGrid, setDaysInGrid] = useState([]);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    // This function runs whenever 'currentDate' changes
    generateCalendarGrid();
  }, [currentDate]);

  const generateCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed (0 for Jan, 11 for Dec)

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 for Sun, 1 for Mon
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const today = new Date();
    const grid = [];

    // 1. Days from the previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      grid.push({
        day: prevMonthDays - firstDayOfMonth + 1 + i,
        month: month - 1,
        year: year,
        isCurrentMonth: false,
      });
    }

    // 2. Days from the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      grid.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true,
        isToday: isToday,
      });
    }
    
    // 3. Days from the next month
    const remainingCells = 42 - grid.length; // Ensure a 6-week grid for consistency
    for (let i = 1; i <= remainingCells; i++) {
        grid.push({
            day: i,
            month: month + 1,
            year: year,
            isCurrentMonth: false,
        });
    }

    setDaysInGrid(grid);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="calendar-container">
      {/* Calendar Header */}
      <div className="calendar-header">
        <h1>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
        <div className="calendar-nav">
          <button onClick={handlePrevMonth}>&lt;</button>
          <button onClick={handleToday}>Today</button>
          <button onClick={handleNextMonth}>&gt;</button>
        </div>
      </div>

      {/* Day of the Week Headers */}
      <div className="day-names">
        {dayNames.map(day => <div key={day} className="day-name">{day}</div>)}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {daysInGrid.map((dayInfo, index) => {
          const eventKey = `${dayInfo.year}-${dayInfo.month}-${dayInfo.day}`;
          const dayEvents = events[eventKey] || [];
          return (
            <div
              key={index}
              className={`calendar-day ${dayInfo.isCurrentMonth ? '' : 'other-month'}`}
            >
              <span className={`day-number ${dayInfo.isToday ? 'today' : ''}`}>
                {dayInfo.day}
              </span>
              <div className="events">
                {dayInfo.isCurrentMonth && dayEvents.map(event => (
                  <div key={event.id} className={`event-pill ${event.color}`}>
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;