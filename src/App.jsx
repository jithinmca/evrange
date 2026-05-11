import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, Car, Settings, AlertTriangle, Navigation, Zap, MapPin, List, X } from 'lucide-react';

function App() {
  const [vehicle, setVehicle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showReference, setShowReference] = useState(false);

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
  let plus5With20Buffer = 0;
  
  let plus10Needed = 0;
  let plus10With20Buffer = 0;

  if (p > 0 && a > 0 && c > 0) {
    currentRange = (c * 1000 * (p / 100)) / a;
    kmPerPct = (10 * c) / a;
  }

  if (d > 0 && a > 0 && c > 0) {
    neededPct = (d * a) / (10 * c);
    neededWith20Buffer = neededPct + 20;

    plus5Needed = (d * (a + 5)) / (10 * c);
    plus5With20Buffer = plus5Needed + 20;

    plus10Needed = (d * (a + 10)) / (10 * c);
    plus10With20Buffer = plus10Needed + 20;
  }

  const isValidPct = p >= 1 && p <= 100;
  const isValidAec = a >= 50 && a <= 500;
  const isInputValid = isValidPct && isValidAec;

  const formatWithKwh = (pct) => {
    const kwh = (pct / 100) * c;
    return `${pct.toFixed(1)}% (${kwh.toFixed(1)} kWh)`;
  };

  const renderChargeStatus = (needed) => {
    const diff = needed - p;
    if (diff > 0) {
      const diffKwh = (diff / 100) * c;
      return (
        <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: '700', marginTop: '4px' }}>
          Charge {diff.toFixed(1)}% ({diffKwh.toFixed(1)} kWh)
        </div>
      );
    }
    const balance = p - needed;
    const balanceKwh = (balance / 100) * c;
    return (
      <div style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: '700', marginTop: '4px' }}>
        Balance {balance.toFixed(1)}% ({balanceKwh.toFixed(1)} kWh)
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Vehicle Header */}
      <div className="vehicle-card">
        <div className="vehicle-info">
          <h2>{vehicle.name}</h2>
          <p>{vehicle.capacity} kWh Battery</p>
        </div>
        <div className="vehicle-actions">
          <button className="btn-icon" onClick={() => setShowReference(true)} aria-label="Reference Table" style={{marginRight: '8px'}}>
            <List size={20} />
          </button>
          <button className="btn-icon" onClick={handleEdit} aria-label="Edit Vehicle">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Reference Table Modal */}
      {showReference && (
        <div className="modal-overlay" onClick={() => setShowReference(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>AEC Reference Table</h3>
              <button className="btn-icon" onClick={() => setShowReference(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p className="helper-text" style={{marginBottom: '16px'}}>Based on {vehicle.capacity} kWh battery</p>
              <div className="table-wrapper">
                <table className="ref-table">
                  <thead>
                    <tr>
                      <th>AEC (Wh/km)</th>
                      <th>Full Range</th>
                      <th>1% ≈ km</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 31 }, (_, i) => 100 + i * 5).map(aecVal => {
                      const range = (vehicle.capacity * 1000) / aecVal;
                      const kmPer1 = range / 100;
                      return (
                        <tr key={aecVal} className={parseFloat(currentAec) === aecVal ? 'highlight-row' : ''}>
                          <td><strong>{aecVal}</strong> <small>Wh/km</small></td>
                          <td style={{textAlign: 'center'}}>
                            <div className="range-badge">{range.toFixed(0)} km</div>
                          </td>
                          <td style={{textAlign: 'right'}}>
                            <div className="pct-info">1% = <strong>{kmPer1.toFixed(1)}</strong> km</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Inputs */}
      <div className="card glow">
        <h3 className="section-title"><BatteryCharging size={20} className="title-icon"/> Current Status</h3>
        <div className="grid-2">
          <div className="form-group">
            <label>Battery %</label>
            <input
              type="number"
              min="1"
              max="100"
              placeholder="e.g. 80"
              value={currentPct}
              onChange={(e) => {
                let val = e.target.value;
                if (val !== '' && parseFloat(val) > 100) val = '100';
                if (val !== '' && parseFloat(val) < 0) val = '0'; // Allow typing 0 temporarily
                setCurrentPct(val);
              }}
              onBlur={(e) => {
                if (e.target.value !== '' && parseFloat(e.target.value) < 1) setCurrentPct('1');
              }}
              required
            />
          </div>
          <div className="form-group">
            <label>AEC (Wh/km)</label>
            <input
              type="number"
              min="50"
              max="500"
              placeholder="e.g. 120"
              value={currentAec}
              onChange={(e) => {
                let val = e.target.value;
                if (val !== '' && parseFloat(val) > 500) val = '500';
                setCurrentAec(val);
              }}
              onBlur={(e) => {
                if (e.target.value !== '' && parseFloat(e.target.value) < 50) setCurrentAec('50');
              }}
              required
            />
          </div>
        </div>

        {!isValidPct && currentPct !== '' && (
          <div className="error-msg">Battery must be between 1% and 100%</div>
        )}
        {!isValidAec && currentAec !== '' && (
          <div className="error-msg">AEC must be between 50 and 500 Wh/km</div>
        )}

        {isInputValid && p > 0 && a > 0 && (
          <div className="grid-2" style={{ marginTop: '16px' }}>
            <div className="stat-box">
              <span className="stat-value">{currentRange.toFixed(1)} <span style={{fontSize: '0.9rem'}}>km</span></span>
              <span className="stat-label">Est. Range ({((p/100)*c).toFixed(1)} kWh)</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{kmPerPct.toFixed(2)} <span style={{fontSize: '0.9rem'}}>km</span></span>
              <span className="stat-label">Per 1% ({((1/100)*c).toFixed(2)} kWh)</span>
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
            required
          />
        </div>

        {isInputValid && d > 0 && a > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div className="grid-2">
              <div className="stat-box" style={{ borderColor: neededPct > p ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                <span className="stat-value" style={{fontSize: '1.2rem'}}>{formatWithKwh(neededPct)}</span>
                <span className="stat-label">Needed</span>
                {renderChargeStatus(neededPct)}
              </div>
              <div className="stat-box" style={{ 
                borderColor: neededWith20Buffer > p ? 'var(--color-danger)' : 'var(--color-success)', 
                backgroundColor: neededWith20Buffer > p ? 'var(--color-danger-light)' : 'var(--color-success-light)' 
              }}>
                <span className="stat-value" style={{color: neededWith20Buffer > p ? 'var(--color-danger)' : 'var(--color-success)', fontSize: '1.2rem'}}>{formatWithKwh(neededWith20Buffer)}</span>
                <span className="stat-label">With 20% Buffer</span>
                {renderChargeStatus(neededWith20Buffer)}
              </div>
            </div>

            {/* Warnings */}
            <div className="warning-section">
              <div className="section-header">
                <AlertTriangle size={20} />
                <span>High Consumption Warnings</span>
              </div>
              <p className="helper-text">If consumption increases due to speed/terrain:</p>
              
              <div className="warning-grid">
                <div className="warning-card-mini">
                  <div className="warning-title">AEC +5 <small>({a + 5} Wh/km)</small></div>
                  <div className="warning-content">
                    <div className="main-stat">{formatWithKwh(plus5Needed)} <small>needed</small></div>
                    <div className="sub-stat">
                      <strong>With 20% Buffer:</strong>
                      <span>{formatWithKwh(plus5With20Buffer)}</span>
                    </div>
                    {renderChargeStatus(plus5With20Buffer)}
                  </div>
                </div>

                <div className="warning-card-mini">
                  <div className="warning-title">AEC +10 <small>({a + 10} Wh/km)</small></div>
                  <div className="warning-content">
                    <div className="main-stat">{formatWithKwh(plus10Needed)} <small>needed</small></div>
                    <div className="sub-stat">
                      <strong>With 20% Buffer:</strong>
                      <span>{formatWithKwh(plus10With20Buffer)}</span>
                    </div>
                    {renderChargeStatus(plus10With20Buffer)}
                  </div>
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
