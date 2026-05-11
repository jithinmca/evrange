import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, Car, Settings, AlertTriangle, Navigation, Zap, MapPin } from 'lucide-react';

function App() {
  const [vehicle, setVehicle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Registration state
  const [nameInput, setNameInput] = useState('');
  const [capacityInput, setCapacityInput] = useState('');

  // Calculation state
  const [currentPct, setCurrentPct] = useState('');
  const [currentAec, setCurrentAec] = useState('');
  const [destinationKm, setDestinationKm] = useState('');

  useEffect(() => {
    const savedVehicle = localStorage.getItem('ev_vehicle');
    if (savedVehicle) {
      setVehicle(JSON.parse(savedVehicle));
    }
    setIsReady(true);
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!nameInput || !capacityInput) return;
    const newVehicle = {
      name: nameInput,
      capacity: parseFloat(capacityInput)
    };
    setVehicle(newVehicle);
    localStorage.setItem('ev_vehicle', JSON.stringify(newVehicle));
    setIsEditing(false);
  };

  const handleEdit = () => {
    setNameInput(vehicle.name);
    setCapacityInput(vehicle.capacity.toString());
    setIsEditing(true);
  };

  if (!isReady) return null;

  if (!vehicle || isEditing) {
    return (
      <div className="app-container">
        <div className="card">
          <div className="title-bar">
            <Car className="title-icon" size={32} />
            <h2>{isEditing ? 'Edit Vehicle' : 'Register Vehicle'}</h2>
          </div>
          <p style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--color-text-muted)' }}>
            Enter your EV details to get started.
          </p>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Vehicle Name</label>
              <input
                type="text"
                placeholder="e.g. Nexon EV, Tesla Model 3"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Battery Capacity (kWh)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 40.5"
                value={capacityInput}
                onChange={(e) => setCapacityInput(e.target.value)}
                required
              />
            </div>
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary">
                {isEditing ? 'Save Changes' : 'Register'}
              </button>
              {isEditing && (
                <button type="button" className="btn-text" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Calculations
  const c = vehicle.capacity;
  const p = parseFloat(currentPct);
  const a = parseFloat(currentAec);
  const d = parseFloat(destinationKm);

  let currentRange = 0;
  let kmPerPct = 0;
  let neededPct = 0;
  let neededWith20Buffer = 0;
  
  let plus5Needed = 0;
  let plus5With15Buffer = 0;
  
  let plus10Needed = 0;
  let plus10With15Buffer = 0;

  if (p > 0 && a > 0 && c > 0) {
    currentRange = (c * 1000 * (p / 100)) / a;
    kmPerPct = (10 * c) / a;
  }

  if (d > 0 && a > 0 && c > 0) {
    neededPct = (d * a) / (10 * c);
    neededWith20Buffer = neededPct + 20;

    plus5Needed = (d * (a + 5)) / (10 * c);
    plus5With15Buffer = plus5Needed + 15;

    plus10Needed = (d * (a + 10)) / (10 * c);
    plus10With15Buffer = plus10Needed + 15;
  }

  return (
    <div className="app-container">
      {/* Vehicle Header */}
      <div className="vehicle-card">
        <div className="vehicle-info">
          <h2>{vehicle.name}</h2>
          <p>{vehicle.capacity} kWh Battery</p>
        </div>
        <div className="vehicle-actions">
          <button className="btn-icon" onClick={handleEdit} aria-label="Edit Vehicle">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Inputs */}
      <div className="card glow">
        <h3 className="section-title"><BatteryCharging size={20} className="title-icon"/> Current Status</h3>
        <div className="grid-2">
          <div className="form-group">
            <label>Battery %</label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 80"
              value={currentPct}
              onChange={(e) => setCurrentPct(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>AEC (Wh/km)</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 120"
              value={currentAec}
              onChange={(e) => setCurrentAec(e.target.value)}
            />
          </div>
        </div>

        {p > 0 && a > 0 && (
          <div className="grid-2" style={{ marginTop: '16px' }}>
            <div className="stat-box">
              <span className="stat-value">{currentRange.toFixed(1)} <span style={{fontSize: '1rem'}}>km</span></span>
              <span className="stat-label">Est. Range</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{kmPerPct.toFixed(2)} <span style={{fontSize: '1rem'}}>km</span></span>
              <span className="stat-label">Per 1%</span>
            </div>
          </div>
        )}
      </div>

      {/* Trip Calculator */}
      <div className="card">
        <h3 className="section-title"><MapPin size={20} className="title-icon"/> Trip Calculator</h3>
        <div className="form-group">
          <label>Distance to Destination (km)</label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 150"
            value={destinationKm}
            onChange={(e) => setDestinationKm(e.target.value)}
          />
        </div>

        {d > 0 && a > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div className="grid-2">
              <div className="stat-box" style={{ borderColor: 'var(--color-primary)' }}>
                <span className="stat-value">{neededPct.toFixed(1)}%</span>
                <span className="stat-label">Needed</span>
              </div>
              <div className="stat-box" style={{ borderColor: 'var(--color-success)', backgroundColor: 'var(--color-success-light)' }}>
                <span className="stat-value" style={{color: 'var(--color-success)'}}>{neededWith20Buffer.toFixed(1)}%</span>
                <span className="stat-label">With 20% Buffer</span>
              </div>
            </div>

            {/* Warnings */}
            <div className="warning-card">
              <div className="warning-card-header">
                <AlertTriangle size={20} />
                <span>High Consumption Warnings</span>
              </div>
              <p className="helper-text" style={{marginBottom: '12px'}}>If AEC increases due to speed or terrain:</p>
              
              <div className="warning-item">
                <div className="warning-label">
                  AEC +5 ({a + 5} Wh/km)
                </div>
                <div style={{textAlign: 'right'}}>
                  <div className="warning-val danger-text">{plus5Needed.toFixed(1)}% needed</div>
                  <div className="buffer-text">With 15% buffer: {plus5With15Buffer.toFixed(1)}%</div>
                </div>
              </div>

              <div className="warning-item">
                <div className="warning-label">
                  AEC +10 ({a + 10} Wh/km)
                </div>
                <div style={{textAlign: 'right'}}>
                  <div className="warning-val danger-text">{plus10Needed.toFixed(1)}% needed</div>
                  <div className="buffer-text">With 15% buffer: {plus10With15Buffer.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
