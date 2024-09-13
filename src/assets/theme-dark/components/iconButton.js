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

// Material Dashboard 2 PRO React Base Styles
import colors from 'assets/theme-dark/base/colors';

const { transparent } = colors;

const iconButton = {
  styleOverrides: {
    root: {
      '&:hover': {
        backgroundColor: transparent.main,
      },
    },
  },
};

export default iconButton;
