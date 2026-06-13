import React from 'react';

// Unified Master Hex Color Index Map for Clean Route IDs
const TRANSIT_COLORS = {
  // Red Line Family
  '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
  // Green Line Family
  '4': '#00933C', '5': '#00933C', '6': '#00933C',
  // Blue Line Family
  'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
  // Orange Line Family
  'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
  // Yellow Line Family
  'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
  // Light Green Line
  'G': '#6CBE45',
  // Gray Line
  'L': '#A7A9AC',
  // Brown Line Family
  'J': '#996633', 'Z': '#996633',
  // Staten Island Rail
  'SI': '#1c355e', 'SIR': '#1c355e',
  
  // NYC Ferry Service Variant Codes
  'ER': '#00a3e0',   // East River Baseline
  'ERA': '#00a3e0',  // East River Variant A
  'ERB': '#00a3e0',  // East River Variant B
  'RW': '#e94b8a',   // Rockaway Line
  'SB': '#f58220',   // South Brooklyn Line
  'AST': '#b9dc0c',  // Astoria Line
  'SG': '#f15a24',   // Soundview Line
  'GI': '#92278f'    // Governors Island Shuttle
};

function ArrivalCard({ arrival }) {
  const { route_id, terminal, time, source } = arrival;
  const minutesAway = Math.floor(time / 60);

  // FIX: Using .trim() instead of .strip() to clean string padding natively in JS
  const backgroundColor = TRANSIT_COLORS[String(route_id).toUpperCase().trim()] || '#333333';
  const textColor = '#ffffff';

  // Calculate clean minutes display text frame values
  const timeLabel = time < 120 ? `${Math.round(time)} sec` : `${Math.floor(time / 60)} min`;

  return (
    <div className="arrival-item" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      borderBottom: '1px solid #eee',
      backgroundColor: '#fff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* The Badge Circle */}
        <div className="route-badge" style={{
          backgroundColor: backgroundColor,
          color: textColor,
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          minWidth: '36px',
          minHeight: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          marginRight: '12px', // FIX: Corrected from margin_right to camelCase marginRight
          fontSize: '16px'
        }}>
          {route_id}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '500', color: '#2c3e50' }}>
            {terminal === 'Uptown' ? 'Up' : terminal === 'Downtown' ? 'Dn' : terminal}
          </span>
          {source === 'ferry' && (
            <span style={{ fontSize: '12px', color: '#95a5a6', textTransform: 'capitalize' }}>
              {source} Service
            </span>
          )}
        </div>
      </div>
      
      <div style={{ fontSize: '16px', fontWeight: 'bold', color: minutesAway <= 2 ? '#e74c3c' : '#2c3e50' }}>
        {timeLabel}
      </div>
    </div>
  );
}

export default ArrivalCard;
