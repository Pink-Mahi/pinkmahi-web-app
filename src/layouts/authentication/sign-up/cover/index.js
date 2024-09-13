import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Checkbox } from '@mui/material';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase auth functions
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // Firestore functions for saving user data
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import CoverLayout from 'layouts/authentication/components/CoverLayout';
import bgImage from 'assets/images/bg-sign-up-cover.jpeg';

function Cover() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // For handling errors
  const navigate = useNavigate(); // To navigate after successful sign-up

  // Firestore database reference
  const db = getFirestore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors

    const auth = getAuth(); // Initialize Firebase auth

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save the user profile info to Firestore
      await setDoc(doc(db, 'UsersData', user.uid), {
        name: name,
        email: email,
        uid: user.uid,
      });

      console.log('User created and data saved to Firestore');
      // Ensure that this is being called
      navigate('/profile'); // Navigate to profile or desired page after sign-up
    } catch (err) {
      setError(err.message); // Handle and display errors
      console.error('Error during sign-up:', err); // Log the error to debug
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Name"
                variant="standard"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)} // Update state
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                variant="standard"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Update state
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                variant="standard"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Update state
              />
            </MDBox>
            {error && (
              <MDTypography color="error" variant="caption">
                {error}
              </MDTypography>
            )}
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: 'pointer', userSelect: 'none', ml: -1 }}
              >
                &nbsp;&nbsp;I agree to the&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Terms and Conditions
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit">
                Sign Up
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{' '}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in/cover"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;
