import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDInput from 'components/MDInput';
import MDButton from 'components/MDButton';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from 'firebaseConfig'; // Import Firebase auth
import BasicLayout from 'layouts/authentication/components/BasicLayout';
import Footer from 'layouts/authentication/components/Footer';
import bgImage from 'assets/images/bg-sign-in-basic.jpeg';

function SignInBasic() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous error

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in successfully');
      navigate('/dashboard'); // Redirect after successful sign-in
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(err);
    }
  };

  return (
    <BasicLayout image={bgImage}>
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
            Welcome back
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to sign in
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <form onSubmit={handleSignIn}>
            {error && (
              <MDBox mb={2}>
                <MDTypography variant="button" color="error">
                  {error}
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
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                variant="standard"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: 'pointer', userSelect: 'none', ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth>
                Sign In
              </MDButton>
            </MDBox>
          </form>
          <MDBox mt={3} mb={1} textAlign="center">
            <MDTypography variant="button" color="text">
              Don’t have an account?{' '}
              <MDTypography
                component={Link}
                to="/authentication/sign-up/cover" // Update this link as needed
                variant="button"
                color="info"
                fontWeight="medium"
                textGradient
              >
                Create an account
              </MDTypography>
            </MDTypography>
          </MDBox>
        </MDBox>
      </Card>
      <Footer light />
    </BasicLayout>
  );
}

SignInBasic.propTypes = {
  image: PropTypes.string,
  children: PropTypes.node,
};

export default SignInBasic;
