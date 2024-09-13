// Device Dashboard

import React, { useEffect, useState } from 'react';
import { ref, onValue, update, remove } from 'firebase/database'; // Firebase functions including remove
import { rtdb } from '../../../firebaseConfig';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Checkbox,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'; // Updated imports from MUI 5
import DeleteIcon from '@mui/icons-material/Delete'; // Importing Delete Icon
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // Importing the Copy Icon
import { useNavigate } from 'react-router-dom'; // Importing useNavigate from React Router

const DeviceDashboard = () => {
  const [devices, setDevices] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDevices, setFilteredDevices] = useState([]);

  // State for delete confirmation dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);

  // State for displaying user details
  const [openOwnerDialog, setOpenOwnerDialog] = useState(false);
  const [ownerDetails, setOwnerDetails] = useState(null);

  // State for editing customer name and location
  const [editedFields, setEditedFields] = useState({});

  const navigate = useNavigate(); // Initialize useNavigate

  const calculateTimeSinceLastUpdate = (lastUpdateTime) => {
    const now = Date.now() / 1000; // Current time in seconds
    const lastUpdateInSeconds = lastUpdateTime / 1000; // Convert last update time to seconds
    return Math.floor(now - lastUpdateInSeconds); // Time elapsed in seconds
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFilteredDevices((prevDevices) =>
        prevDevices.map((device) => ({
          ...device,
          timeSinceLastUpdate: calculateTimeSinceLastUpdate(
            device.lastUpdateTime
          ),
        }))
      );
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  useEffect(() => {
    const devicesRef = ref(rtdb, 'Devices');
    onValue(devicesRef, (snapshot) => {
      const data = snapshot.val();
      const deviceArray = data
        ? Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
            thresholds: data[key].thresholds || {}, // Initialize thresholds
            customerName: data[key].customerName || 'Unknown', // Initialize customer name
            location: data[key].location || '', // Initialize location
            owner: data[key].owner || '', // Initialize owner
            timeSinceLastUpdate: calculateTimeSinceLastUpdate(
              data[key].lastUpdateTime
            ),
          }))
        : [];
      setDevices(deviceArray);
      setFilteredDevices(deviceArray);
    });
  }, []);

  // Function to handle redirecting to the chart page with the deviceID
  const handleChartRedirect = (deviceID, ownerID) => {
    navigate(`/device-chart`, { state: { deviceID, ownerID } }); // Redirect and pass the deviceID via state
  };

  // Function to copy the deviceID to clipboard without alert
  const handleCopyDeviceID = (deviceID) => {
    navigator.clipboard.writeText(deviceID).catch((error) => {
      console.error('Failed to copy device ID: ', error);
    });
  };

  // Function to update LED states only if they have changed
  const evaluateLEDStates = (device) => {
    const thresholds = device.thresholds || {
      highTemperature: Infinity,
      lowTemperature: -Infinity,
      humidity: 100,
    };

    const isHighTempOn = device.temperature > thresholds.highTemperature;
    const isLowTempOn = device.temperature < thresholds.lowTemperature;
    const isHighHumidityOn = device.humidity > thresholds.humidity;

    if (
      device.ledHighTemp !== isHighTempOn ||
      device.ledLowTemp !== isLowTempOn ||
      device.ledHighHum !== isHighHumidityOn
    ) {
      const updates = {
        ledHighTemp: isHighTempOn,
        ledLowTemp: isLowTempOn,
        ledHighHum: isHighHumidityOn,
      };

      const deviceRef = ref(rtdb, `Devices/${device.id}`);
      update(deviceRef, updates)
        .then(() => console.log('LED states updated successfully'))
        .catch((error) => console.error('Error updating LED states: ', error));
    }
  };

  // Function to handle threshold changes in local state
  const handleThresholdChange = (deviceID, field, value) => {
    const devicesCopy = [...filteredDevices];
    const index = devicesCopy.findIndex((device) => device.id === deviceID);
    if (index !== -1) {
      if (!devicesCopy[index].thresholds) {
        devicesCopy[index].thresholds = {};
      }
      devicesCopy[index].thresholds[field] = value;
      setFilteredDevices(devicesCopy);
    }
  };

  // Function to save thresholds only when Save button is clicked
  const handleSaveThresholds = (deviceID) => {
    const device = filteredDevices.find((d) => d.id === deviceID);
    if (device) {
      const thresholds = device.thresholds || {};
      const updatedThresholds = {
        highTemperature: Number(thresholds.highTemperature) || 0,
        lowTemperature: Number(thresholds.lowTemperature) || 0,
        humidity: Number(thresholds.humidity) || 0,
      };

      const deviceRef = ref(rtdb, `Devices/${deviceID}`);
      update(deviceRef, { thresholds: updatedThresholds })
        .then(() => {
          evaluateLEDStates(device);
          console.log('Thresholds saved successfully');
        })
        .catch((error) => console.error('Error saving thresholds: ', error));
    }
  };

  // Function to save customer name and location
  const handleSaveCustomerDetails = (deviceID) => {
    const { customerName = '', location = '' } = editedFields[deviceID] || {};
    const deviceRef = ref(rtdb, `Devices/${deviceID}`);
    update(deviceRef, { customerName, location })
      .then(() => {
        console.log('Customer name and location updated successfully');
        setEditedFields((prev) => ({
          ...prev,
          [deviceID]: { ...prev[deviceID], updated: false },
        }));
      })
      .catch((error) =>
        console.error('Error updating customer details: ', error)
      );
  };

  // Handle opening the owner details dialog
  const handleOwnerClick = (ownerID) => {
    const ownerRef = ref(rtdb, `UsersData/${ownerID}`);
    onValue(ownerRef, (snapshot) => {
      const ownerData = snapshot.val();
      if (ownerData) {
        setOwnerDetails(ownerData); // Set the owner data to be displayed
        setOpenOwnerDialog(true); // Open the dialog with owner details
      }
    });
  };

  const handleCloseOwnerDialog = () => {
    setOpenOwnerDialog(false);
    setOwnerDetails(null);
  };
  const handleCopyOwner = (ownerID) => {
    navigator.clipboard
      .writeText(ownerID)
      .then(() => {
        console.log(`Owner ID ${ownerID} copied to clipboard`);
      })
      .catch((error) => {
        console.error('Failed to copy owner ID: ', error);
      });
  };

  const handleFieldChange = (deviceID, field, value) => {
    setEditedFields((prev) => ({
      ...prev,
      [deviceID]: { ...prev[deviceID], [field]: value, updated: true },
    }));
  };

  const renderLEDStatus = (ledStatus, ledName) => (
    <Typography className={ledStatus ? 'led-on' : ''}>
      {ledName}: {ledStatus ? 'ON' : 'OFF'}
    </Typography>
  );

  const handleVisibilityToggle = (deviceID, checked) => {
    const deviceRef = ref(rtdb, `Devices/${deviceID}`);
    update(deviceRef, { active: checked })
      .then(() => {
        const devicesCopy = [...filteredDevices];
        const index = devicesCopy.findIndex((device) => device.id === deviceID);
        if (index !== -1) {
          devicesCopy[index].active = checked;
          setFilteredDevices(devicesCopy);
        }
      })
      .catch((error) => console.error('Error updating visibility: ', error));
  };

  // Open confirmation dialog before deleting device
  const handleClickOpen = (deviceID) => {
    setDeviceToDelete(deviceID);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleConfirmDelete = () => {
    const deviceRef = ref(rtdb, `Devices/${deviceToDelete}`);
    remove(deviceRef)
      .then(() => {
        console.log(`Device ${deviceToDelete} deleted successfully`);
        setFilteredDevices(
          filteredDevices.filter((device) => device.id !== deviceToDelete)
        );
        setOpenDialog(false); // Close dialog after delete
      })
      .catch((error) => {
        console.error('Error deleting device: ', error);
      });
  };

  useEffect(() => {
    const filtered = Object.values(devices).filter((device) => {
      return (
        device.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (device.customerName &&
          device.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
    setFilteredDevices(filtered);
  }, [searchQuery, devices]);

  return (
    <div style={{ padding: '20px', marginLeft: '250px' }}>
      <style>{`
        .led-on {
          color: red;
          font-weight: bold;
          animation: flash 1s infinite;
        }
        @keyframes flash {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      <Typography variant="h4" gutterBottom>
        Device Dashboard
      </Typography>
      <TextField
        label="Search by Device ID or Customer Name"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <Grid container spacing={3}>
        {filteredDevices.length > 0 ? (
          filteredDevices.map((device) => (
            <Grid item xs={12} md={4} key={device.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5">
                    Device ID: {device.id}
                    <IconButton
                      aria-label="copy"
                      onClick={() => handleCopyDeviceID(device.id)} // Copy device ID
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Typography>
                  <Typography>
                    Owner:{' '}
                    <Button
                      variant="text"
                      onClick={() => handleOwnerClick(device.owner)}
                      color="primary"
                    >
                      {device.owner}
                    </Button>
                    <IconButton
                      aria-label="copy"
                      onClick={() => handleCopyOwner(device.owner)} // Copy owner
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Typography>
                  <Typography>
                    Temperature: {device.temperature || 'N/A'} °F
                  </Typography>
                  <Typography>
                    Humidity: {device.humidity || 'N/A'} %
                  </Typography>
                  <Typography>
                    Pressure: {device.pressure || 'N/A'} hPa
                  </Typography>
                  <Typography>
                    WiFi Signal: {device.wifiSignalStrength || 'N/A'} dBm
                  </Typography>
                  <TextField
                    label="Customer Name"
                    variant="outlined"
                    fullWidth
                    value={
                      editedFields[device.id]?.customerName ??
                      device.customerName
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        device.id,
                        'customerName',
                        e.target.value
                      )
                    }
                    style={{ marginBottom: '10px' }}
                  />
                  <TextField
                    label="Location"
                    variant="outlined"
                    fullWidth
                    value={editedFields[device.id]?.location ?? device.location}
                    onChange={(e) =>
                      handleFieldChange(device.id, 'location', e.target.value)
                    }
                    style={{ marginBottom: '10px' }}
                  />
                  {editedFields[device.id]?.updated && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSaveCustomerDetails(device.id)}
                      style={{ marginBottom: '10px' }}
                    >
                      Save Name & Location
                    </Button>
                  )}
                  <Typography>
                    Last Update: {device.timeSinceLastUpdate} seconds ago
                  </Typography>

                  <Typography>
                    Device Type: {device.deviceType || 'Unknown'}
                  </Typography>
                  {renderLEDStatus(device.ledHighTemp, 'High Temp LED')}
                  {renderLEDStatus(device.ledLowTemp, 'Low Temp LED')}
                  {renderLEDStatus(device.ledHighHum, 'High Humidity LED')}
                  {renderLEDStatus(device.ledWaterLeak, 'Water Leak LED')}

                  <div>
                    <Typography variant="subtitle1">
                      Temperature Thresholds
                    </Typography>
                    <TextField
                      label="High Temperature (°F)"
                      type="number"
                      value={device.thresholds?.highTemperature || ''}
                      onChange={(e) =>
                        handleThresholdChange(
                          device.id,
                          'highTemperature',
                          e.target.value
                        )
                      }
                    />
                    <TextField
                      label="Low Temperature (°F)"
                      type="number"
                      value={device.thresholds?.lowTemperature || ''}
                      onChange={(e) =>
                        handleThresholdChange(
                          device.id,
                          'lowTemperature',
                          e.target.value
                        )
                      }
                    />
                    <TextField
                      label="Humidity (%)"
                      type="number"
                      value={device.thresholds?.humidity || ''}
                      onChange={(e) =>
                        handleThresholdChange(
                          device.id,
                          'humidity',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <Checkbox
                      checked={device.active || false}
                      onChange={(e) =>
                        handleVisibilityToggle(device.id, e.target.checked)
                      }
                    />
                    <Typography>Visible</Typography>
                  </div>

                  {/* Charts Button */}
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#1e88e5', // Same as Save Thresholds button color
                      color: '#fff', // White text color
                      marginRight: '10px', // Add margin to space out from Save button
                      '&:hover': {
                        backgroundColor: '#1565c0', // Slightly darker on hover
                      },
                    }}
                    onClick={() => handleChartRedirect(device.id, device.owner)} // Redirect to charts page with deviceID
                  >
                    Charts
                  </Button>

                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#f5f5f5', // Light background
                      color: '#333333', // Darker text
                      '&:hover': {
                        backgroundColor: '#cccccc', // Slightly darker background on hover
                      },
                    }}
                    onClick={() => handleSaveThresholds(device.id)} // Save Thresholds Button
                  >
                    Save Thresholds
                  </Button>

                  <IconButton
                    aria-label="delete"
                    onClick={() => handleClickOpen(device.id)} // Open confirmation dialog
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No devices available</Typography>
        )}
      </Grid>

      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={openDialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Delete Device'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Permanently delete device from the system. Are you sure you want to
            proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            No, Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary" autoFocus>
            Yes, Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Owner Details Dialog */}
      <Dialog
        open={openOwnerDialog}
        onClose={handleCloseOwnerDialog}
        aria-labelledby="owner-dialog-title"
        aria-describedby="owner-dialog-description"
      >
        <DialogTitle id="owner-dialog-title">Owner Details</DialogTitle>
        <DialogContent>
          {ownerDetails ? (
            <>
              <Typography variant="subtitle1">
                Name: {ownerDetails.name}
              </Typography>
              <Typography variant="subtitle1">
                Email: {ownerDetails.email}
              </Typography>
              <Typography variant="subtitle1">
                Phone: {ownerDetails.phone}
              </Typography>
              {/* Add more fields as necessary */}
            </>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOwnerDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeviceDashboard;
