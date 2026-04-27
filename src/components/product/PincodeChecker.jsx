'use client';

import { useState, useEffect } from 'react';
import { Truck, MapPin } from 'lucide-react';
import { getEstimatedDeliveryDate } from '@/lib/utils';

export default function PincodeChecker() {
  const [pincode, setPincode] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Only generate the date strictly on the client after mount to prevent Server/Client Hydration Mismatches
    setEstimate(getEstimatedDeliveryDate());
  }, []);

  const handleCheck = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setEstimate(getEstimatedDeliveryDate(pincode));
      setChecked(true);
    }
  };

  // Do not render until client has safely generated the estimate to avoid flashing
  if (!estimate) return null;

  return (
    <div className="card card-bordered card-sm mb-5" style={{ backgroundColor: 'var(--surface-table-header)' }}>
      <div className="card-body" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <Truck size={20} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: 'var(--fs-14)', marginBottom: 6, color: 'var(--text-dark)' }}>
              Delivery Estimate
            </p>
            <form onSubmit={handleCheck} style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-3)' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <MapPin size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <label htmlFor="pincode-input" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: '0' }}>
                  Enter Area Pincode
                </label>
                <input 
                  id="pincode-input"
                  type="text" 
                  maxLength={6}
                  placeholder="Enter Area Pincode"
                  aria-label="Enter Area Pincode"
                  value={pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPincode(val);
                    if (val.length < 6) setChecked(false);
                  }}
                  style={{
                    width: '100%', 
                    padding: '8px 12px 8px 32px', 
                    fontSize: 'var(--fs-14)', 
                    borderRadius: 'var(--border-radius-sm)', 
                    border: '1.5px solid var(--border-light)',
                    outline: 'none',
                    color: 'var(--text-dark)'
                  }}
                />
              </div>
              <button 
                type="submit" 
                disabled={pincode.length !== 6}
                aria-label="Check delivery estimate"
                style={{
                  background: 'var(--text-dark)', 
                  color: 'white', 
                  padding: '0 16px',
                  borderRadius: 'var(--border-radius-sm)', 
                  fontSize: 'var(--fs-13)', 
                  fontWeight: 600,
                  cursor: pincode.length === 6 ? 'pointer' : 'not-allowed',
                  opacity: pincode.length === 6 ? 1 : 0.6,
                  transition: 'opacity 0.2s',
                  border: 'none'
                }}
              >
                Check
              </button>
            </form>
            
            <p style={{ 
              fontSize: 'var(--fs-13)', 
              color: checked ? 'var(--success)' : 'var(--text-medium)', 
              margin: 0, 
              fontWeight: checked ? 600 : 400 
            }}>
              {estimate.isMaxPredictive ? 
                `Maximum fulfillment span: Delivery by ${estimate.date}` 
                : 
                `Speed Delivery to ${pincode} by ${estimate.date}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
