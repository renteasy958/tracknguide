import React, { useState } from 'react';
import '../styles/roomSelection.css';

function RoomSelection({ onSelectRoom }) {
  const rooms = [
    { id: 'room101', name: 'Room 101' },
    { id: 'room102', name: 'Room 102' },
    { id: 'room201', name: 'Room 201' },
    { id: 'room202', name: 'Room 202' },
    { id: 'library', name: 'Library' },
    { id: 'office', name: 'Office' },
    { id: 'cafeteria', name: 'Cafeteria' },
    { id: 'gym', name: 'Gymnasium' }
  ];

  return (
    <div className="room-selection-container">
      <div className="room-selection-box">
        <h2 className="room-selection-title">Where would you like to go?</h2>
        <p className="room-selection-subtitle">Select a room to view directions</p>
        
        <div className="room-grid">
          {rooms.map(room => (
            <button
              key={room.id}
              className="room-card"
              onClick={() => onSelectRoom(room)}
            >
              <span className="room-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </span>
              <span className="room-name">{room.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RoomSelection;
