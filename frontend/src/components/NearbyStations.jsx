import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import tt from '@tomtom-international/web-sdk-maps';
import ttServices from '@tomtom-international/web-sdk-services';


const NearbyStation = () => {
    const [latitude,setLatitude] = useState('');
    const [longitude,setLongitude] = useState('');
    const [radiusKm,setRadiusKm] = useState('');
    const [stations,setStations] = useState([]);

    const mapRef = useRef(null);
    const map = useRef(null);
    const userMarker = useRef(null);
    const stationMarkers = useRef([]);

    const fetchNearby = async() => {

      if (!latitude || !longitude || !radiusKm) return;
        try {
            const body = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                radiusKm: parseFloat(radiusKm)
            };
            const res = await axios.post('http://localhost:3023/nearby-stations', body);
            setStations(res.data);
        } catch (err) {
            console.error(err);
            alert('Error fetching  station');
        }
    };

    useEffect(() => {
      if (map.current) return;

      map.current = tt.map({
        key: 'eWQxVqOHNxqizhNvAlAXPu7uXES9fSJ0',
        container: mapRef.current,
        center: [77.5946, 12.9716],
        zoom: 12
      });

      map.current.addControl(new tt.FullscreenControl());
      map.current.addControl(new tt.NavigationControl());
    }, []);

    useEffect(() => {

      if (!map.current || stations.length === 0) return;

       const userLng = parseFloat(longitude);
       const userLat = parseFloat(latitude);
       map.current.setCenter([userLng,userLat]);

      if (userMarker.current) userMarker.current.remove();

      userMarker.current = new tt.Marker({color:"blue"})
        .setLngLat([userLng,userLat])
        .addTo(map.current);


        stationMarkers.current.forEach(marker => marker.remove());
        stationMarkers.current = [];


        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }

        const bounds = new tt.LngLatBounds();
        bounds.extend([userLng,userLat]);

        stations.forEach((station) => {
            const stationLat = parseFloat(station.latitude);
            const stationLng = parseFloat(station.longitude);

          const marker = new tt.Marker({color:"green"})
            .setLngLat([stationLng,stationLat])
            .addTo(map.current)
            .setPopup(new tt.Popup().setText(station.stationName));

            marker.getElement().addEventListener('click', () => {
               drawRoute([userLng,userLat],[stationLng,stationLat])
        });

        stationMarkers.current.push(marker);
        bounds.extend([stationLng,stationLat]);
    });

    map.current.fitBounds(bounds, {padding: 100});
    },[stations, longitude, latitude]);

    const drawRoute = (start , end) => {
        ttServices.services.calculateRoute({
          key: 'eWQxVqOHNxqizhNvAlAXPu7uXES9fSJ0',
          locations: [start,end]
        }).then(response => {
          const geojson = response.toGeoJson();
          if (map.current.getSource('route')) {
            map.current.removeLayer('route');
            map.current.removeSource('route');
          }

          map.current.addLayer({
            id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geojson
        },
        paint: {
          'line-color': 'red',
          'line-width' : 4
          }
        });
    });
  };

    return (
    <div>
        <h3>Find Nearby Stations</h3>
      <input placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
      <input placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
      <input placeholder="Radius (km)" value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} />
      <button onClick={fetchNearby}>Search</button>

     <div ref = {mapRef} style={{height: "500px" , width: "100%", marginTop: "20px"}} />
    </div>
    )
}

export default NearbyStation;

