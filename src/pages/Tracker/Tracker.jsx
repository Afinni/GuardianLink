import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Navigation, Phone, ShieldAlert } from 'lucide-react';
import styles from './Tracker.module.css';

// Component for handling Routing Machine
function RoutingMachine({ caregiverLoc, userLoc }) {
  const map = useMap();

  useEffect(() => {
    if (!caregiverLoc || !userLoc) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(caregiverLoc[0], caregiverLoc[1]),
        L.latLng(userLoc[0], userLoc[1])
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: 'var(--b500)', weight: 4, opacity: 0.7, dashArray: '10, 10' }] // Dashed line for directions
      },
      createMarker: () => null
    }).addTo(map);

    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, caregiverLoc, userLoc]);

  return null;
}

const userIcon = L.divIcon({
  html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="var(--g500)" stroke="white" stroke-width="2"/>
    <circle cx="12" cy="12" r="4" fill="white"/>
  </svg>`,
  className: styles.customMarker,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const caregiverIcon = L.divIcon({
  html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="var(--b600)" stroke="white" stroke-width="2"/>
    <circle cx="12" cy="12" r="4" fill="white"/>
  </svg>`,
  className: styles.customMarker,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

export default function Tracker() {
  const { selectedUser, waypoints } = useApp();
  const navigate = useNavigate();
  const [caregiverLoc, setCaregiverLoc] = useState(null);

  useEffect(() => {
    // Get caregiver live location
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setCaregiverLoc([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const userWaypoints = selectedUser ? (waypoints[selectedUser.id] || []) : [];
  const userLoc = userWaypoints.length > 0 ? userWaypoints[userWaypoints.length - 1] : null;

  if (!selectedUser) {
    return (
      <div className={styles.loadingScreen}>
        <p>No user selected. Return to dashboard.</p>
        <button onClick={() => navigate('/dashboard')} className={styles.backBtnFallback}>Back</button>
      </div>
    );
  }

  // If no user location yet, default to caregiver or lagos
  const center = userLoc || caregiverLoc || [6.5244, 3.3792];

  return (
    <div className={styles.page}>
      {/* Back Button Overlay */}
      <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
        <ChevronLeft size={24} />
      </button>

      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User's Traveled Path (Solid Line) */}
        {userWaypoints.length > 1 && (
          <Polyline positions={userWaypoints} pathOptions={{ color: 'var(--g500)', weight: 5, opacity: 0.8 }} />
        )}

        {/* User Marker */}
        {userLoc && (
          <Marker position={userLoc} icon={userIcon}>
            <Popup>{selectedUser.firstName}'s Current Location</Popup>
          </Marker>
        )}

        {/* Caregiver Marker */}
        {caregiverLoc && (
          <Marker position={caregiverLoc} icon={caregiverIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* Routing Directions */}
        {caregiverLoc && userLoc && (
          <RoutingMachine caregiverLoc={caregiverLoc} userLoc={userLoc} />
        )}
      </MapContainer>

      {/* Uber-style Bottom Sheet */}
      <div className={styles.bottomSheet}>
        <div className={styles.sheetHeader}>
          <div className={styles.statusDot} /> Live Tracking
        </div>
        <div className={styles.sheetContent}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{selectedUser.firstName[0]}</div>
            <div>
              <h2 className={styles.userName}>{selectedUser.firstName} {selectedUser.lastName}</h2>
              <p className={styles.userSub}>{selectedUser.area || "GPS Active"}</p>
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.actionBtn}>
              <Phone size={18} />
            </button>
            <button className={styles.actionBtnAlert}>
              <ShieldAlert size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
