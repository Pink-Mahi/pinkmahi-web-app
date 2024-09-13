import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database'; // Firebase import
import { rtdb } from '../../../firebaseConfig';
import { firestore } from '../../../firebaseConfig';
import { Line } from 'react-chartjs-2'; // Import Chart.js
import { TextField, Typography, MenuItem } from '@mui/material'; // MUI components
import { useLocation } from 'react-router-dom'; // Import useLocation to access passed state

const DeviceChart = () => {
  const [deviceID, setDeviceID] = useState(''); // Manual input of deviceID
  const [deviceData, setDeviceData] = useState([]);
  const [timeframe, setTimeframe] = useState('1d'); // Default to 1 day
  const [lastValues, setLastValues] = useState({}); // Store the last values for each dataset
  const [ownerDevices, setOwnerDevices] = useState([]); // Devices owned by the same owner
  const [manualInput, setManualInput] = useState(false); // Toggle for manual input

  const location = useLocation(); // Access location object
  const { deviceID: passedDeviceID, ownerID } = location.state || {}; // Destructure deviceID and ownerID from the state

  // Use the passed deviceID if it exists
  useEffect(() => {
    if (passedDeviceID) {
      setDeviceID(passedDeviceID);
    }
  }, [passedDeviceID]);

  // Fetch data from Firebase based on deviceID
  useEffect(() => {
    if (deviceID) {
      const deviceRef = ref(rtdb, `Devices/${deviceID}/timestamps`);
      onValue(deviceRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const parsedData = Object.values(data).map((entry) => ({
            temperature: entry.temperature,
            humidity: entry.humidity,
            pressure: entry.pressure,
            timestamp: new Date(entry.unix_timestamp * 1000), // Convert UNIX timestamp to Date
          }));
          setDeviceData(parsedData);

          // Update the last recorded values for temperature, humidity, and pressure
          const lastEntry = parsedData[parsedData.length - 1];
          if (lastEntry) {
            setLastValues({
              temperature: lastEntry.temperature,
              humidity: lastEntry.humidity,
              pressure: lastEntry.pressure,
            });
          }
        } else {
          setDeviceData([]);
        }
      });
    }
  }, [deviceID]);

  // Fetch other devices owned by the same owner
  useEffect(() => {
    if (ownerID) {
      const devicesRef = ref(rtdb, 'Devices');
      onValue(devicesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const ownedDevices = Object.keys(data)
            .filter((key) => data[key].owner === ownerID)
            .map((key) => ({
              id: key,
              name: data[key].customerName || 'Unknown', // Optional: use device/customer name for display
            }));
          setOwnerDevices(ownedDevices);
        }
      });
    }
  }, [ownerID]);

  // Timeframe options for the dropdown menu
  const timeframeOptions = [
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' },
    { value: '1m', label: '1 Month' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
  ];

  // Filter data based on the selected timeframe
  const filterDataByTimeframe = (data) => {
    const now = new Date();
    let filteredData = data;
    switch (timeframe) {
      case '1d':
        filteredData = data.filter(
          (entry) => entry.timestamp >= now.setDate(now.getDate() - 1)
        );
        break;
      case '1w':
        filteredData = data.filter(
          (entry) => entry.timestamp >= now.setDate(now.getDate() - 7)
        );
        break;
      case '1m':
        filteredData = data.filter(
          (entry) => entry.timestamp >= now.setMonth(now.getMonth() - 1)
        );
        break;
      case '6m':
        filteredData = data.filter(
          (entry) => entry.timestamp >= now.setMonth(now.getMonth() - 6)
        );
        break;
      case '1y':
        filteredData = data.filter(
          (entry) => entry.timestamp >= now.setFullYear(now.getFullYear() - 1)
        );
        break;
      default:
        break;
    }
    return filteredData;
  };

  // Prepare data for the chart with multiple scales
  const getChartData = () => {
    const filteredData = filterDataByTimeframe(deviceData);
    const hasTemperature = filteredData.some(
      (entry) => entry.temperature !== undefined
    );
    const hasHumidity = filteredData.some(
      (entry) => entry.humidity !== undefined
    );
    const hasPressure = filteredData.some(
      (entry) => entry.pressure !== undefined
    );

    return {
      labels: filteredData.map((entry) => entry.timestamp.toLocaleString()), // Convert timestamp to readable string
      datasets: [
        hasTemperature && {
          label: 'Temperature (°F)',
          data: filteredData.map((entry) => entry.temperature),
          borderColor: 'red',
          fill: false,
          yAxisID: 'temperature', // Link to temperature scale
        },
        hasHumidity && {
          label: 'Humidity (%)',
          data: filteredData.map((entry) => entry.humidity),
          borderColor: 'blue',
          fill: false,
          yAxisID: 'humidity', // Link to humidity scale
        },
        hasPressure && {
          label: 'Pressure (hPa)',
          data: filteredData.map((entry) => entry.pressure),
          borderColor: 'green',
          fill: false,
          yAxisID: 'pressure', // Link to pressure scale
        },
      ].filter(Boolean), // Filter out datasets that are not active
    };
  };

  // Chart options to include multiple scales
  const getChartOptions = () => ({
    scales: {
      temperature: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Temperature (°F)',
        },
      },
      humidity: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Humidity (%)',
        },
      },
      pressure: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Pressure (hPa)',
        },
        grid: {
          drawOnChartArea: false, // Prevent grid lines from overlapping
        },
      },
    },
  });

  return (
    <div
      style={{
        padding: '20px',
        marginLeft: '250px',
        width: 'calc(100% - 250px)',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Device Data Chart: {deviceID || 'Select a Device'}
      </Typography>

      {/* Input field for device ID or select from owned devices */}
      <TextField
        select={!manualInput} // Enable select mode unless manual input is active
        label="Device ID"
        variant="outlined"
        value={deviceID}
        onChange={(e) => {
          setDeviceID(e.target.value);
          setManualInput(false); // If selecting from the dropdown, disable manual input
        }}
        InputProps={{ style: { height: '50px' } }} // Enforce the height
        style={{ marginBottom: '20px', width: '300px' }}
        onClick={() => setManualInput(true)} // Allow switching to manual input when clicked
      >
        {manualInput ? (
          <MenuItem value="">
            <Typography>Enter Device ID</Typography>
          </MenuItem>
        ) : (
          ownerDevices.map((device) => (
            <MenuItem key={device.id} value={device.id}>
              {device.id} - {device.name}
            </MenuItem>
          ))
        )}
      </TextField>

      {/* Timeframe selector */}
      <TextField
        select
        label="Timeframe"
        variant="outlined"
        value={timeframe}
        onChange={(e) => setTimeframe(e.target.value)}
        InputProps={{ style: { height: '50px' } }} // Enforce the same height as Device ID
        style={{ marginBottom: '20px', width: '200px' }}
      >
        {timeframeOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      {/* Display chart with border and value flags */}
      <div
        style={{
          position: 'relative',
          border: '2px solid #ccc', // Border around the chart
          padding: '10px',
          borderRadius: '8px',
        }}
      >
        {deviceData.length > 0 ? (
          <>
            <Line data={getChartData()} options={getChartOptions()} />
            {/* Display the last recorded values as bubbles */}
            <div
              style={{
                position: 'absolute',
                right: '20px',
                top: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* Bubble for Temperature */}
              {lastValues.temperature && (
                <div
                  style={{
                    backgroundColor: 'red',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {`Temperature: ${lastValues.temperature}°F`}
                </div>
              )}

              {/* Bubble for Humidity */}
              {lastValues.humidity && (
                <div
                  style={{
                    backgroundColor: 'blue',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {`Humidity: ${lastValues.humidity}%`}
                </div>
              )}

              {/* Bubble for Pressure */}
              {lastValues.pressure && (
                <div
                  style={{
                    backgroundColor: 'green',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {`Pressure: ${lastValues.pressure} hPa`}
                </div>
              )}
            </div>
          </>
        ) : (
          <Typography>No data available for this device</Typography>
        )}
      </div>
    </div>
  );
};

export default DeviceChart;
