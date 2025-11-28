import React, { useState, useEffect, useMemo } from 'react';
import '../assets/Calendar.css';

function truncate(text, length) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

function formatModalDate(dateString) {
  const date = new Date(dateString);
  if (dateString.length === 10) {
     date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  }
  return date.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatModalTime(dateString, timeString) {
  if (timeString) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const courseColors = [
  'blue', 'green', 'orange', 'purple', 'red', 'teal', 'pink', 'indigo',
  'yellow', 'brown', 'gray', 'cyan', 'mint'
];

function Calendar({ courses }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysInGrid, setDaysInGrid] = useState([]);
  
  const [dbEvents, setDbEvents] = useState([]); 
  
  const [selectedAssignment, setSelectedAssignment] = useState(null); 
  const [selectedDate, setSelectedDate] = useState(null); 
  const [showAddModal, setShowAddModal] = useState(false); 
  
  // --- NEW: Delete Confirmation State ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDeleteId, setEventToDeleteId] = useState(null);
  
  // Track if we are editing an existing event
  const [editingEventId, setEditingEventId] = useState(null);

  const [newEventData, setNewEventData] = useState({
    title: '',
    date: '', 
    time: '',
    description: '',
    color: 'blue'
  });

  useEffect(() => {
    loadDbEvents();
  }, []);

  const loadDbEvents = async () => {
    try {
      const events = await window.api.getEvents();
      setDbEvents(events);
    } catch (err) {
      console.error("Failed to load events", err);
    }
  };

  const allCalendarEvents = useMemo(() => {
    const events = {};
    
    if (Array.isArray(courses)) {
      courses.forEach((course, index) => {
        const courseColor = courseColors[index % courseColors.length];
        if (Array.isArray(course.assignments)) {
          course.assignments.forEach(assignment => {
            if (assignment.due_at) {
              const dueDate = new Date(assignment.due_at);
              const key = `${dueDate.getFullYear()}-${dueDate.getMonth()}-${dueDate.getDate()}`;
              
              if (!events[key]) events[key] = [];
              
              events[key].push({
                id: `canvas-${assignment.id}`,
                type: 'canvas',
                title: truncate(assignment.name, 12),
                color: courseColor,
                fullTitle: assignment.name,
                subtitle: course.name,
                dueAt: assignment.due_at, 
              });
            }
          });
        }
      });
    }

    dbEvents.forEach(dbEvent => {
      const [y, m, d] = dbEvent.date.split('-').map(Number);
      const key = `${y}-${m - 1}-${d}`;

      if (!events[key]) events[key] = [];

      events[key].push({
        id: `db-${dbEvent.id}`,
        dbId: dbEvent.id,
        type: 'custom',
        title: truncate(dbEvent.title, 12),
        color: dbEvent.color,
        fullTitle: dbEvent.title,
        subtitle: dbEvent.description || 'Custom Event',
        date: dbEvent.date,
        time: dbEvent.time,
        rawDescription: dbEvent.description 
      });
    });

    return events;
  }, [courses, dbEvents]);

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
      grid.push({ day: prevMonthDays - firstDayOfMonth + 1 + i, month: month - 1, year: year, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      grid.push({ day: i, month: month, year: year, isCurrentMonth: true, isToday: isToday });
    }
    const remainingCells = 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      grid.push({ day: i, month: month + 1, year: year, isCurrentMonth: false });
    }
    setDaysInGrid(grid);
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = (dayInfo, dayEvents) => {
    const monthStr = String(dayInfo.month + 1).padStart(2, '0');
    const dayStr = String(dayInfo.day).padStart(2, '0');
    const dateStr = `${dayInfo.year}-${monthStr}-${dayStr}`;

    setSelectedDate({
      dateObj: new Date(dayInfo.year, dayInfo.month, dayInfo.day),
      dateStr: dateStr, 
      events: dayEvents
    });
  };

  const openAddModal = () => {
    setEditingEventId(null); 
    setNewEventData({
      title: '',
      date: selectedDate?.dateStr || new Date().toISOString().split('T')[0],
      time: '12:00',
      description: '',
      color: 'blue'
    });
    setShowAddModal(true);
    setSelectedDate(null); 
  };

  const openEditModal = (event) => {
    setEditingEventId(event.dbId);
    setNewEventData({
      title: event.fullTitle,
      date: event.date,
      time: event.time,
      description: event.rawDescription || '',
      color: event.color
    });
    setShowAddModal(true);
    setSelectedDate(null);
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    if (!newEventData.title || !newEventData.date) return;

    try {
      let result;
      if (editingEventId) {
        result = await window.api.updateEvent({ ...newEventData, id: editingEventId });
      } else {
        result = await window.api.addEvent(newEventData);
      }

      if (result.success) {
        await loadDbEvents(); 
        setShowAddModal(false);
      } else {
        alert("Failed to save event: " + result.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- NEW: Trigger Modal ---
  const handleDeleteClick = (id) => {
    setEventToDeleteId(id);
    setShowDeleteModal(true);
  };

  // --- NEW: Confirm Delete ---
  const confirmDeleteEvent = async () => {
    if (!eventToDeleteId) return;
    try {
      const result = await window.api.deleteEvent(eventToDeleteId);
      if (result.success) {
        await loadDbEvents();
        setSelectedDate(null); // Close the day details to refresh
      }
    } catch (err) {
      console.error(err);
    }
    setShowDeleteModal(false);
    setEventToDeleteId(null);
  };

  // --- NEW: Cancel Delete ---
  const cancelDeleteEvent = () => {
    setShowDeleteModal(false);
    setEventToDeleteId(null);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
        <div className="calendar-nav">
          <button className="add-event-btn" onClick={() => openAddModal()}>+ Event</button>
          <button onClick={handlePrevMonth}>&lt;</button>
          <button onClick={handleToday}>Today</button>
          <button onClick={handleNextMonth}>&gt;</button>
        </div>
      </div>

      <div className="day-names">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="day-name">{d}</div>)}
      </div>

      <div className="calendar-grid">
        {daysInGrid.map((dayInfo, index) => {
          const eventKey = `${dayInfo.year}-${dayInfo.month}-${dayInfo.day}`;
          const dayEvents = allCalendarEvents[eventKey] || [];
          
          return (
            <div
              key={index}
              className={`calendar-day ${dayInfo.isCurrentMonth ? '' : 'other-month'}`}
              onClick={() => handleDayClick(dayInfo, dayEvents)}
            >
              <span className={`day-number ${dayInfo.isToday ? 'today' : ''}`}>
                {dayInfo.day}
              </span>
              <div className="events">
                {dayInfo.isCurrentMonth && dayEvents.map(event => (
                  <div 
                    key={event.id} 
                    className={`event-pill ${event.color}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAssignment(event);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="modal-overlay" onClick={() => setSelectedDate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h1>{formatModalDate(selectedDate.dateStr)}</h1>
              <button onClick={() => setSelectedDate(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <button className="create-file-small-btn mb-4" onClick={openAddModal}>
                + Add Event for this Day
              </button>
              
              {selectedDate.events.length > 0 ? (
                <ul className="date-modal-list">
                  {selectedDate.events.map(event => (
                    <li key={event.id} className="date-modal-item">
                      <span className={`dot ${event.color}`}></span>
                      <div className="event-details">
                        <span className="event-time">
                          {event.type === 'canvas' ? formatModalTime(event.dueAt) : formatModalTime(null, event.time)}
                        </span>
                        <strong className="event-title">{event.fullTitle}</strong>
                        <span className="event-course">{event.subtitle}</span>
                      </div>
                      
                      {event.type === 'custom' && (
                        <div style={{display: 'flex', gap: '5px'}}>
                          <button 
                            className="delete-icon-btn" 
                            title="Edit"
                            style={{color: '#d4d8dcff', opacity: 1}} 
                            onClick={() => openEditModal(event)}
                          >
                            ✎
                          </button>
                          <button 
                            className="delete-icon-btn" 
                            title="Delete"
                            style={{color: '#d4d8dcff', opacity: 1}} 
                            onClick={() => handleDeleteClick(event.dbId)}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-events-text">No events for this date.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEventId ? 'Edit Event' : 'Add New Event'}</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitEvent} className="event-form">
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    className="modal-input" 
                    value={newEventData.title}
                    onChange={(e) => setNewEventData({...newEventData, title: e.target.value})}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input 
                      type="date" 
                      className="modal-input" 
                      value={newEventData.date}
                      onChange={(e) => setNewEventData({...newEventData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input 
                      type="time" 
                      className="modal-input" 
                      value={newEventData.time}
                      onChange={(e) => setNewEventData({...newEventData, time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    className="modal-input" 
                    value={newEventData.description}
                    onChange={(e) => setNewEventData({...newEventData, description: e.target.value})}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <div className="color-options">
                    {courseColors.map(color => (
                      <div 
                        key={color} 
                        className={`color-circle ${color} ${newEventData.color === color ? 'selected' : ''}`}
                        onClick={() => setNewEventData({...newEventData, color})}
                      />
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn-confirm-create">
                    {editingEventId ? 'Update Event' : 'Save Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedAssignment && (
        <div className="modal-overlay" onClick={() => setSelectedAssignment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h1>{selectedAssignment.type === 'canvas' ? 'Assignment Details' : 'Event Details'}</h1>
              <button onClick={() => setSelectedAssignment(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <h2>{selectedAssignment.fullTitle}</h2>
              <p>
                <strong>{selectedAssignment.type === 'canvas' ? 'Course:' : 'Description:'}</strong>
                {selectedAssignment.subtitle}
              </p>
              <p>
                <strong>Due:</strong>
                {selectedAssignment.type === 'canvas' 
                  ? `${formatModalDate(selectedAssignment.dueAt)} at ${formatModalTime(selectedAssignment.dueAt)}`
                  : `${formatModalDate(selectedAssignment.date)} at ${selectedAssignment.time}`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- NEW: Delete Confirmation Modal --- */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDeleteEvent}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '350px'}}>
            <div className="modal-header">
              <h2>Delete Event</h2>
              <button className="close-btn" onClick={cancelDeleteEvent}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this event?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={cancelDeleteEvent}>Cancel</button>
              <button className="btn-confirm-delete" onClick={confirmDeleteEvent}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;