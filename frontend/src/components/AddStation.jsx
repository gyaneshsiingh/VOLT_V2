import React from "react";
import { useState } from "react";
import axios from 'axios';

const AddStation = () => {
    const [stationName,setStationName] = useState('');
    const [latitude,setLatitude] = useState('');
    const [longitude,setLongitude] = useState('');
    const [chargingRate,setChargingRate] = useState('');
    const [price,setPrice] = useState('');

    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            const body = {
                stationName,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                charger: {
                    chargingRate: parseFloat(chargingRate),
                    price: parseFloat(price)
                }
            };
            const res = await axios.post('http://localhost:3023/station', body);
            alert("station added: " + res.data.id);
        } catch (err) {
            console.error(err);
            alert('Error adding station');
        }
    };

    return (
       <form onSubmit={handleSubmit}>
        <input placeholder="Station Name" value={stationName} onChange={(e) => setStationName(e.target.value)} />
        <input type = "number" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
        <input type = "number" placeholder="Longitude" value={latitude} onChange={(e) => setLongitude(e.target.value)} />
        <input type = "number" placeholder="chargingRate" value={chargingRate} onChange={(e) => setChargingRate(e.target.value)} />
        <input type = "number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <button type="submit">Add Station</button>
       </form>
    )
}

export default AddStation;

