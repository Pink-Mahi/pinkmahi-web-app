/**
=========================================================
* Material Dashboard 2 PRO React - v2.2.1
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// react-router-dom components
import { Link } from 'react-router-dom';
import { useState } from 'react';

// @mui material components
import Card from '@mui/material/Card';

// Material Dashboard 2 PRO React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';

// Firebase imports
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from 'firebaseConfig'; // Ensure you have auth properly initialized in firebaseConfig

// Authentication layout components
import CoverLayout from 'layouts/authentication/components/CoverLayout';

// Images
import bgImage from 'assets/images/bg-reset-cover.jpeg';

function Cover() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle password reset process
  const handlePasswordReset = (e) => {
    e.preventDefault();

    // Firebase send password reset email
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setSuccessMessage(
          'Password reset email sent successfully. Please check your inbox.'
        );
        setError('');
      })
      .catch((error) => {
        setError('Failed to send password reset email. Please try again.');
        setSuccessMessage('');
        console.error(error.message);
      });
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
            Forgot your password?
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and we will send you a link to reset your password
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handlePasswordReset}>
            {error && (
              <MDBox mb={2}>
                <MDTypography variant="button" color="error">
                  {error}
                </MDTypography>
              </MDBox>
            )}
            {successMessage && (
              <MDBox mb={2}>
                <MDTypography variant="button" color="success">
                  {successMessage}
                </MDTypography>
              </MDBox>
            )}
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                variant="standard"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth>
                Reset Password
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Remember your password?{' '}
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
