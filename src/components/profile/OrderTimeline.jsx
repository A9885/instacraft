'use client';

import React, { useState } from 'react';
import { Truck, Check, XCircle, ExternalLink, Clock, Info, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function OrderTimeline({ order }) {
  const [expanded, setExpanded] = useState(false);
  const { logistics, payment, createdAt } = order;
  const status = logistics.status;
  const isCancelled = status === 'Cancelled';
  const isPaid = payment.status === 'Paid';
  const t = logistics.timestamps || {};

  const orderDate = new Date(t.placedAt || createdAt);
  
  // Calculate expected dates
  const expectedShipDate = new Date(orderDate);
  expectedShipDate.setDate(expectedShipDate.getDate() + 3);
  
  const expectedDelDate = new Date(orderDate);
  expectedDelDate.setDate(expectedDelDate.getDate() + 7);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' }) 
           + ' - ' 
           + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  }

  const formatShortDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  // Determine active states
  const states = ['Placed', 'Packed', 'Dispatched', 'In_Transit', 'Delivered'];
  const currentIndex = isCancelled ? -1 : states.indexOf(status);
  
  const isPlacedDone = !isCancelled || isCancelled; 
  const isShippedDone = !isCancelled && currentIndex >= states.indexOf('Dispatched');
  const isOutDone = !isCancelled && currentIndex >= states.indexOf('In_Transit');
  const isDeliveredDone = !isCancelled && currentIndex >= states.indexOf('Delivered');

  return (
    <>
      {!expanded ? (
        <div className="timeline-card">
          <h3 className="timeline-header-title">
             {isCancelled ? 'Order Cancelled' : (isDeliveredDone ? 'Delivered' : (isOutDone ? 'Out for Delivery' : (isShippedDone ? 'Shipped' : 'Order Confirmed')))}
          </h3>
          <p className="timeline-header-subtitle">
             {isCancelled ? 'This order has been cancelled.' : (isDeliveredDone ? 'Your order was successfully delivered.' : 'Your Order has been placed.')}
          </p>

          <div className="timeline-horiz-wrapper">
            <div className="timeline-horiz-nodes">
               <div className="timeline-node-wrapper">
                  <div className={`timeline-node ${isPlacedDone && !isCancelled ? 'success' : 'pending'}`}>
                     {isPlacedDone && !isCancelled && <Check size={14} strokeWidth={3} />}
                     {isCancelled && <XCircle size={14} fill="var(--error)" stroke="var(--surface)" />}
                  </div>
               </div>
               
               <div className={`timeline-line ${isShippedDone && !isCancelled ? 'success' : ''}`}></div>
               
               <div className="timeline-node-wrapper">
                  <div className={`timeline-node ${isShippedDone && !isCancelled ? 'success' : 'pending'}`}>
                     {isShippedDone && !isCancelled && <Check size={14} strokeWidth={3} />}
                  </div>
               </div>
               
               <div className={`timeline-line ${isDeliveredDone && !isCancelled ? 'success' : ''}`}></div>
               
               <div className="timeline-node-wrapper">
                  <div className={`timeline-node ${isDeliveredDone && !isCancelled ? 'success' : 'pending'}`}>
                     {isDeliveredDone && !isCancelled && <Check size={14} strokeWidth={3} />}
                  </div>
               </div>
            </div>
            
            <div className="timeline-horiz-labels">
               <div className="timeline-label-col left">
                  <span className="timeline-label-title">Order Confirmed</span>
                  <span className="timeline-label-date">{formatShortDate(orderDate)}</span>
               </div>
               <div className="timeline-label-col center">
                  <span className="timeline-label-title">Shipped</span>
                  <span className="timeline-label-date">{isShippedDone ? formatShortDate(t.dispatchedAt) : formatShortDate(expectedShipDate)}</span>
               </div>
               <div className="timeline-label-col right">
                  <span className="timeline-label-title">Delivery</span>
                  <span className="timeline-label-date">{isDeliveredDone ? formatShortDate(t.deliveredAt) : formatShortDate(expectedDelDate)}</span>
               </div>
            </div>
          </div>

          <div className="timeline-info-box">
             <Info size={18} color="var(--text-medium)" style={{ flexShrink: 0, marginTop: 2 }} />
             <p className="timeline-info-text">
                Delivery Executive details will be available once the order is out for delivery
             </p>
          </div>

          <div className="timeline-divider"></div>

          <div className="timeline-btn-container">
             <button onClick={() => setExpanded(true)} className="timeline-toggle-btn">
                See all updates
             </button>
          </div>
        </div>
      ) : (
        <div className="timeline-card-expanded">
          <div className="timeline-vert-header">
              <div className="timeline-vert-title">
                  <Truck size={18} color={isCancelled ? "var(--text-muted)" : "var(--primary)"} />
                  <span>Fulfillment & Tracking</span>
              </div>
              <button onClick={() => setExpanded(false)} className="timeline-vert-hide-btn">
                 Hide updates <ChevronUp size={16} />
              </button>
          </div>

          <div className="timeline-vert-container">
            <div className="timeline-vert-step">
               <div className="timeline-vert-node-col">
                  <div className="timeline-vert-node success"></div>
                  <div className={`timeline-vert-line ${isShippedDone ? 'success' : ''}`}></div>
               </div>
               <div className="timeline-vert-content">
                   <h4 className="timeline-vert-step-title">
                      Order Confirmed 
                      <span className="timeline-vert-step-date">{formatShortDate(orderDate)}</span>
                   </h4>
                   <p className="timeline-vert-step-desc">Your Order has been placed.</p>
                   <p className="timeline-vert-step-time">{formatDate(t.placedAt || createdAt)}</p>
                   
                   {status === 'Packed' && (
                     <p className="timeline-vert-step-extra">Your item has been packed and is ready to ship.</p>
                   )}
                   {status === 'Placed' && (
                     <p className="timeline-vert-step-extra">Seller is processing your order.</p>
                   )}
               </div>
            </div>

            <div className={`timeline-vert-step ${isCancelled ? 'dimmed' : ''}`}>
               <div className="timeline-vert-node-col">
                  <div className={`timeline-vert-node ${isShippedDone ? 'success' : ''}`}></div>
                  <div className={`timeline-vert-line ${isOutDone ? 'success' : ''}`}></div>
               </div>
               <div className="timeline-vert-content">
                   <h4 className={`timeline-vert-step-title ${!isShippedDone ? 'dimmed' : ''}`}>
                      Shipped 
                      {!isShippedDone && <span className="timeline-vert-step-date">Expected {formatShortDate(expectedShipDate)}</span>}
                   </h4>
                   {isShippedDone ? (
                     <>
                       <p className="timeline-vert-step-desc">Item has been shipped.</p>
                       <p className="timeline-vert-step-time">{formatDate(t.dispatchedAt)}</p>
                       {order.logistics.awbCode && (
                           <p className="timeline-vert-step-extra">
                             Tracking ID: <span style={{fontWeight: 600, color: 'var(--text-dark)'}}>{order.logistics.awbCode}</span>
                           </p>
                       )}
                     </>
                   ) : (
                     <p className="timeline-vert-step-desc dimmed">Item yet to be shipped.</p>
                   )}
               </div>
            </div>

            <div className={`timeline-vert-step ${isCancelled ? 'dimmed' : ''}`}>
               <div className="timeline-vert-node-col">
                  <div className={`timeline-vert-node ${isOutDone ? 'success' : ''}`}></div>
                  <div className={`timeline-vert-line ${isDeliveredDone ? 'success' : ''}`}></div>
               </div>
               <div className="timeline-vert-content">
                   <h4 className={`timeline-vert-step-title ${!isOutDone ? 'dimmed' : ''}`}>
                      Out For Delivery
                   </h4>
                   {isOutDone ? (
                     <>
                       <p className="timeline-vert-step-desc">Item is out for delivery.</p>
                       <p className="timeline-vert-step-time">{formatDate(t.inTransitAt)}</p>
                     </>
                   ) : (
                     <p className="timeline-vert-step-desc dimmed">Item yet to be delivered.</p>
                   )}
               </div>
            </div>

            <div className="timeline-vert-step" style={{ paddingBottom: 0 }}>
               <div className="timeline-vert-node-col">
                  {isCancelled ? (
                    <div className="timeline-vert-node error">
                       <XCircle size={10} color="#fff" />
                    </div>
                  ) : (
                    <div className={`timeline-vert-node ${isDeliveredDone ? 'success' : ''}`}></div>
                  )}
               </div>
               <div className="timeline-vert-content">
                   <h4 className={`timeline-vert-step-title ${isCancelled ? 'error' : (isDeliveredDone ? 'success' : 'dimmed')}`}>
                      {isCancelled ? 'Cancelled' : 'Delivery'} 
                      {!isDeliveredDone && !isCancelled && <span className="timeline-vert-step-date">Expected {formatShortDate(expectedDelDate)}</span>}
                   </h4>
                   {isCancelled ? (
                      <p className="timeline-vert-step-desc error">This order was cancelled.</p>
                   ) : isDeliveredDone ? (
                     <>
                       <p className="timeline-vert-step-desc">Item delivered successfully.</p>
                       <p className="timeline-vert-step-time">{formatDate(t.deliveredAt)}</p>
                     </>
                   ) : (
                     <p className="timeline-vert-step-desc dimmed">Expected by {formatShortDate(expectedDelDate)}</p>
                   )}
                   
                   {isPaid && !isCancelled && !isDeliveredDone && (
                      <div className="timeline-delay-msg">
                         <Clock size={12} color="var(--primary)" /> Updates might be slightly delayed
                      </div>
                   )}
               </div>
            </div>
          </div>
          
          {order.logistics.awbCode && !isCancelled && (
            <div className="timeline-awb-box">
              <div>
                <p className="timeline-awb-label">Carrier Tracking ID</p>
                <span className="timeline-awb-value">{order.logistics.awbCode}</span>
              </div>
              <Link href={`https://shiprocket.co/tracking/${order.logistics.awbCode}`} target="_blank" className="timeline-track-link">
                Track <ExternalLink size={14} />
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
