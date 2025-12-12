import React from 'react';
import '../styles/roomMap.css';

function RoomMap({ room, onBack, onLogout }) {
  // Placeholder for room map images
  // You'll need to add actual room map images to src/user/images/
  const mapImage = `/room-maps/${room.id}.png`;

  return (
    <div className="room-map-container">
      <div className="room-map-box">
        <div className="room-map-header">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <h2 className="room-map-title">Directions to {room.name}</h2>
        </div>
        
        <div className="map-content">
          <div className="map-image-wrapper">
            <img 
              src={mapImage} 
              alt={`Map to ${room.name}`}
              className="map-image"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NYXAgdG8gJyArIHJvb20ubmFtZSArICc8L3RleHQ+PC9zdmc+';
              }}
            />
          </div>
          
          <div className="directions-info">
            <h3>How to get there:</h3>
            <ol className="directions-list">
              <li>Follow the map displayed above</li>
              <li>Look for directional signs along the way</li>
              <li>If you need help, ask any staff member</li>
            </ol>
          </div>
        </div>

        <div className="room-map-actions">
          <button className="logout-btn" onClick={onLogout}>
            Logout / New User
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomMap;
