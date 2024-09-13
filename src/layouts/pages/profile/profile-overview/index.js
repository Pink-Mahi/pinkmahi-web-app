import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';
import Header from 'layouts/pages/profile/components/Header';
import { doc, setDoc } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { firestore, rtdb, auth } from '../../../../firebaseConfig'; // Adjusted imports

function Overview() {
  // State for managing contact info, devices, and third-party provider
  const [primaryContact, setPrimaryContact] = useState({
    name: '',
    phone1: '',
    phone2: '',
    email1: '',
    email2: '',
  });
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: '', phone: '', email: '', relationship: '' },
    { name: '', phone: '', email: '', relationship: '' },
  ]);
  const [devices, setDevices] = useState([]); // To manage the devices added by the user
  const [newDevice, setNewDevice] = useState({
    deviceId: '',
    location: '',
  });
  const [thirdPartyContact, setThirdPartyContact] = useState({
    company: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    clientId: '',
  });

  // Function to handle changes to emergency contacts
  const handleEmergencyContactChange = (index, field, value) => {
    const updatedContacts = [...emergencyContacts];
    updatedContacts[index][field] = value;
    setEmergencyContacts(updatedContacts);
  };

  const handleAddDevice = async () => {
    const user = auth.currentUser;

    if (user) {
      try {
        // Add the device to the user's profile in UsersData (Firestore)
        const userDocRef = doc(
          firestore,
          'UsersData',
          user.uid,
          'devices',
          newDevice.deviceId
        );
        await setDoc(userDocRef, {
          deviceId: newDevice.deviceId,
          location: newDevice.location,
          deviceType: 'sensorType',
        });

        // Add the device to the global Devices collection (Realtime Database)
        const rtdbRef = ref(rtdb, `Devices/${newDevice.deviceId}`);
        await set(rtdbRef, {
          uid: user.uid,
          location: newDevice.location,
          customerName: user.displayName || 'Unknown',
          deviceType: 'sensorType',
          active: true,
        });

        setDevices([...devices, newDevice]);
        setNewDevice({ deviceId: '', location: '' });
      } catch (error) {
        console.error('Error adding device: ', error);
      }
    } else {
      console.log('No user is signed in');
    }
  };
  const testWrite = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const testDocRef = doc(firestore, 'TestCollection', 'testDoc');
        await setDoc(testDocRef, {
          testField: 'Hello Firestore!',
        });
        console.log('Test document written successfully');
      } catch (error) {
        console.error('Test write failed:', error.message);
      }
    }
  };

  const handleSaveProfile = async () => {
    const user = auth.currentUser; // Ensure the user is logged in

    if (user) {
      try {
        console.log('Saving profile for user:', user.uid); // Debug UID
        console.log('Primary Contact:', primaryContact); // Debug profile data
        console.log('Emergency Contacts:', emergencyContacts);
        console.log('Third Party Contact:', thirdPartyContact);

        // Log Firestore reference to check correctness
        const userDocRef = doc(firestore, 'UsersData', user.uid);
        console.log('Firestore Document Reference:', userDocRef);

        // Add the user's profile data to Firestore
        await setDoc(userDocRef, {
          primaryContact,
          emergencyContacts,
          thirdPartyContact,
        });

        console.log('Profile saved successfully');
      } catch (error) {
        console.error('Error saving profile:', error.message, error); // Debug Firestore errors
      }
    } else {
      console.log('No user is signed in'); // Handle case where no user is authenticated
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Header />
      <MDBox
        mt={3}
        mb={3}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        {/* Primary Contact Info */}
        <Grid item xs={12} md={8} lg={6}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Primary Contact Info
              </MDTypography>
              <Divider />
              <MDBox mt={2}>
                <MDInput
                  label="Name"
                  fullWidth
                  value={primaryContact.name}
                  onChange={(e) =>
                    setPrimaryContact({
                      ...primaryContact,
                      name: e.target.value,
                    })
                  }
                />
              </MDBox>
              <MDBox mt={2}>
                <MDInput
                  label="Phone 1"
                  fullWidth
                  value={primaryContact.phone1}
                  onChange={(e) =>
                    setPrimaryContact({
                      ...primaryContact,
                      phone1: e.target.value,
                    })
                  }
                />
              </MDBox>
              <MDBox mt={2}>
                <MDInput
                  label="Phone 2"
                  fullWidth
                  value={primaryContact.phone2}
                  onChange={(e) =>
                    setPrimaryContact({
                      ...primaryContact,
                      phone2: e.target.value,
                    })
                  }
                />
              </MDBox>
              <MDBox mt={2}>
                <MDInput
                  label="Email 1"
                  fullWidth
                  value={primaryContact.email1}
                  onChange={(e) =>
                    setPrimaryContact({
                      ...primaryContact,
                      email1: e.target.value,
                    })
                  }
                />
              </MDBox>
              <MDBox mt={2}>
                <MDInput
                  label="Email 2"
                  fullWidth
                  value={primaryContact.email2}
                  onChange={(e) =>
                    setPrimaryContact({
                      ...primaryContact,
                      email2: e.target.value,
                    })
                  }
                />
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

        {/* Devices and Add Device Section */}
        <Grid item xs={12} md={8} lg={6} mt={3}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Add Device
              </MDTypography>
              <Divider />
              <MDBox mt={2}>
                <MDInput
                  label="Device ID"
                  fullWidth
                  value={newDevice.deviceId}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, deviceId: e.target.value })
                  }
                />
              </MDBox>
              <MDBox mt={2}>
                <MDInput
                  label="Location"
                  fullWidth
                  value={newDevice.location}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, location: e.target.value })
                  }
                />
              </MDBox>
              <MDBox mt={3}>
                <MDButton
                  variant="gradient"
                  color="info"
                  fullWidth
                  onClick={handleAddDevice}
                >
                  Add Device
                </MDButton>
              </MDBox>
            </MDBox>
          </Card>

          {/* Display Added Devices */}
          <MDBox mt={3}>
            <MDTypography variant="h6" fontWeight="medium">
              Added Devices
            </MDTypography>
            {devices.length === 0 ? (
              <MDTypography>No devices added yet.</MDTypography>
            ) : (
              devices.map((device, index) => (
                <MDBox key={index} mt={2}>
                  <MDTypography>
                    Device ID: {device.deviceId}, Location: {device.location}
                  </MDTypography>
                </MDBox>
              ))
            )}
          </MDBox>
        </Grid>

        {/* Emergency Contacts Section */}
        {emergencyContacts.map((contact, index) => (
          <Grid item xs={12} md={8} lg={6} mt={3} key={index}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium">
                  Emergency Contact {index + 1}
                </MDTypography>
                <Divider />
                <MDBox mt={2}>
                  <MDInput
                    label="Name"
                    fullWidth
                    value={contact.name}
                    onChange={(e) =>
                      handleEmergencyContactChange(
                        index,
                        'name',
                        e.target.value
                      )
                    }
                  />
                </MDBox>
                <MDBox mt={2}>
                  <MDInput
                    label="Phone"
                    fullWidth
                    value={contact.phone}
                    onChange={(e) =>
                      handleEmergencyContactChange(
                        index,
                        'phone',
                        e.target.value
                      )
                    }
                  />
                </MDBox>
                <MDBox mt={2}>
                  <MDInput
                    label="Email"
                    fullWidth
                    value={contact.email}
                    onChange={(e) =>
                      handleEmergencyContactChange(
                        index,
                        'email',
                        e.target.value
                      )
                    }
                  />
                </MDBox>
                <MDBox mt={2}>
                  <MDInput
                    label="Relationship"
                    fullWidth
                    value={contact.relationship}
                    onChange={(e) =>
                      handleEmergencyContactChange(
                        index,
                        'relationship',
                        e.target.value
                      )
                    }
                  />
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        ))}

        {/* Third-Party Provider Info Section */}
        <Grid item xs={12} md={8} lg={6} mt={3}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Third-Party Provider Info
              </MDTypography>
              <Divider />
              <MDBox mt={2}>
                <MDInput
                  label="Company"
                  fullWidth
                  value={thirdPartyContact.company}
                  onChange={(e) =>
                    setThirdPartyContact({
                      ...thirdPartyContact,
                      company: e.target.value,
                    })
                  }
                />
              </MDBox>
              <MDBox mt={2}>
                <MDInput
                  label="Contact Name"
                  fullWidth
                  value={thirdPartyContact.contactName}
                  onChange={(e) =>
                    setThirdPartyContact({
                      ...thirdPartyContact,
                      contactName: e.target.value,
                    })
                  }
                />
              </MDBox>
              <MDBox mt={2}>
                <MDInput
                  label="Phone"
                  fullWidth
                  value={thirdPartyContact.phone}
                  onChange={(e) =>
                    setThirdPartyContact({
                      ...thirdPartyContact,
                      phone: e.target.value,
                    })
                  }
                />
              </MDBox>
              <MDBox mt={2}>
                <MDInput
                  label="Email"
                  fullWidth
                  value={thirdPartyContact.email}
                  onChange={(e) =>
                    setThirdPartyContact({
                      ...thirdPartyContact,
                      email: e.target.value,
                    })
                  }
                />
              </MDBox>
              <MDBox mt={2}>
                <MDInput
                  label="Address"
                  fullWidth
                  value={thirdPartyContact.address}
                  onChange={(e) =>
                    setThirdPartyContact({
                      ...thirdPartyContact,
                      address: e.target.value,
                    })
                  }
                />
              </MDBox>
              <MDBox mt={2}>
                <MDInput
                  label="Client ID"
                  fullWidth
                  value={thirdPartyContact.clientId}
                  onChange={(e) =>
                    setThirdPartyContact({
                      ...thirdPartyContact,
                      clientId: e.target.value,
                    })
                  }
                />
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

        {/* Save Profile Button */}
        <MDBox mt={3}>
          <MDButton
            variant="gradient"
            color="info"
            fullWidth
            onClick={handleSaveProfile}
          >
            Save Profile
          </MDButton>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
