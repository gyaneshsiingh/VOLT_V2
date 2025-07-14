import React,{useState} from 'react';


const Car = () => {
  const [model,setModel] = useState('');
  const [batterySize, setBatterySize] = useState('');
  const [chargingRate,setChargingRate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();


    if (!model || !batterySize || !chargingRate) {
      alert('Please fill all field');
      return;
    }

    console.log("Car Submitted:", { model, batterySize, chargingRate });

    const cars = JSON.parse(localStorage.getItem('cars') || '[]');

    const newCar = {
      id: Date.now(),
      model,
      batterySize: Number(batterySize),
      chargingRate: Number(chargingRate)
    };

    cars.push(newCar);
    
    console.log("Before Saving:", localStorage.getItem('cars'));
    localStorage.setItem('cars',JSON.stringify(cars));
    console.log("After Saving:", localStorage.getItem('cars'));


    alert('car data saved locally');
    setModel('');
    setBatterySize('');
    setChargingRate('');
  };

  return (
    <form onSubmit={handleSubmit}>

      <input
      type= "text"
      placeholder= "Car Model"
      value={model}
      onChange={(e) => setModel(e.target.value)}
      />

      <input 
       type = "number"
       placeholder = "Battery Size"
       value={batterySize}
       onChange={(e) => setBatterySize(e.target.value)}
      />

      <input 
      type='number'
      placeholder='Charging Rate'
      value={chargingRate}
      onChange={(e) => {setChargingRate(e.target.value)}}
      />

      <button type = "submit">Save car Details</button>
    </form> 
  );
}

export default Car;