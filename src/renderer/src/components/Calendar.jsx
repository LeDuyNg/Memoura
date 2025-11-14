import React, { useState, useEffect, useMemo } from 'react';
import '../assets/Calendar.css';

/**
 * Helper function to truncate text to a max length
 * @param {string} text The text to truncate
 * @param {number} length The max length
 * @returns {string} The truncated text with an ellipsis
 */
function truncate(text, length) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Formats a date string into "Weekday, Month Day, Year"
 * @param {string} dateString - ISO date string
 * @returns {string}
 */
function formatModalDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a date string into "HH:MM AM/PM"
 * @param {string} dateString - ISO date string
 * @returns {string}
 */
function formatModalTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

const courseColors = [
  'blue',
  'green',
  'orange',
  'purple',
  'red',
  'teal',
  'pink',
  'indigo',
];

function Calendar({ courses }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysInGrid, setDaysInGrid] = useState([]);
  // --- 1. Add state for the modal ---
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const assignmentEvents = useMemo(() => {
    const events = {};
    
    if (!Array.isArray(courses)) {
      return events;
    }

    courses.forEach((course, index) => {
      const courseColor = courseColors[index % courseColors.length];
      
      if (Array.isArray(course.assignments)) {
        course.assignments.forEach(assignment => {
          if (assignment.due_at) {
            const dueDate = new Date(assignment.due_at);
            const key = `${dueDate.getFullYear()}-${dueDate.getMonth()}-${dueDate.getDate()}`;
            
            const newEvent = {
              id: assignment.id,
              title: truncate(assignment.name, 10), 
              color: courseColor,
              // --- 2. Add full details for the modal ---
              fullTitle: assignment.name,
              courseName: course.name,
              dueAt: assignment.due_at,
            };
            
            if (!events[key]) {
              events[key] = [];
            }
            events[key].push(newEvent);
          }
        });
      }
    });

    return events;
  }, [courses]);

  useEffect(() => {
    generateCalendarGrid();
  }, [currentDate]);

  const generateCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const today = new Date();
    const grid = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      grid.push({
        day: prevMonthDays - firstDayOfMonth + 1 + i,
        month: month - 1,
        year: year,
        isCurrentMonth: false,
      });
    }

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
    
    const remainingCells = 42 - grid.length;
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
          const dayEvents = assignmentEvents[eventKey] || [];
          
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
                  // --- 3. Add onClick handler to the pill ---
                  <div 
                    key={event.id} 
                    className={`event-pill ${event.color}`}
                    onClick={() => setSelectedAssignment(event)}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- 4. Add the Modal JSX --- */}
      {selectedAssignment && (
        <div 
          className="modal-overlay" 
          // Close modal when clicking the dark background
          onClick={() => setSelectedAssignment(null)}
        >
          <div 
            className="modal-content"
            // Prevent clicks inside the modal from closing it
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h1>{selectedAssignment.courseName}</h1>
              <button onClick={() => setSelectedAssignment(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <h2>{selectedAssignment.fullTitle}</h2>
              <p>
                <strong>Due Date:</strong>
                {formatModalDate(selectedAssignment.dueAt)}
              </p>
              <p>
                <strong>Due Time:</strong>
                {formatModalTime(selectedAssignment.dueAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;