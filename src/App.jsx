import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, } from 'react-leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import Leaflet from 'leaflet';
import './index.css';

delete Leaflet.Icon.Default.prototype._getIconUrl;
Leaflet.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 3);
  }, []);
  return null;
}

export default function MapWithLocation() {
  const [position, setPosition] = useState(null);

  const [devices, setDevices] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error('Error de GPS:', err.message);
        alert('No se puede acceder a tu ubicación.');
      }
    );

    //Simulate multiple devices
    const addingDevices = [0, 2, 6, 9];

    let tempArray = [];

    for (let index = 1; index <= addingDevices.length; index++) 
    {
      const posX = Math.random() * 20 + 10;
      const posY = Math.random() * -50 - 50;

      tempArray.push(
        {
          id: index, 
          name: 'Dispositivo ' + index, 
          coordinates: index === 1 ? [0, 0] : [posX, posY],
          path: index === 1 ? [[0, 0]] : [[posX, posY], [posX + (Math.random() - 0.5) * 4, posY + (Math.random() - 0.5) * 4]],
        });
    }
    
    //Simulate a Path     
    const interval = setInterval(() => {
      setDevices((items) =>
        items.map((item) => {
          const coords = getTrackerLocation(item.id);
          return {
            ...item,
            coords,
            path: item.coords ? [...item.path, coords] : item.path,
          };
        })
      );
    }, 5000);

    
    setDevices(tempArray);
    return () => clearInterval(interval);
  }, []);

  function getTrackerLocation(id) 
  {
    const moveX = (Math.random() - 0.1) * (Math.random() * 2);
    const moveY = (Math.random() - 0.3) * (Math.random() * 2);
        
    setDevices((selectedDevices) => 
      selectedDevices.map((device) =>
        device.id === id
          ? { ...device, path: [...device.path, [moveX, moveY]] }
          : device
      )
    );

    // Returns: [latitude, longitude] for a given tracker
    return [0, 0];
  }

  return (
    <div className="map-container">
      <h1>Ubicación</h1>
      {position && (
        <MapContainer center={position} zoom={3}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {devices.map((location) => (
            <>
              <Marker position={location.coordinates}>
                <Popup>
                  <div class="marker-popup">
                    <h4>{location.name}</h4>
                    <span>
                      {location.coordinates[0]}, {location.coordinates[1]}
                    </span>
                  </div>
                </Popup>
              </Marker>
              <Polyline positions={location.path} color="red" />
            </>
          ))}
          <Recenter position={position} />
        </MapContainer>
      )}
    </div>
  );
}
