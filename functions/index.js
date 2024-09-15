/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.database();

// Configure Nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().gmail.email, // Use environment variables for security
    pass: functions.config().gmail.password, // Use environment variables for security
  },
});

/**
 * Firebase function to send alert email when LED changes state
 * @param {object} change - The database change object.
 * @param {object} context - The function context.
 */
exports.sendAlertEmail = functions.database
  .ref('Devices/{deviceID}/{ledType}')
  .onWrite(async (change, context) => {
    const deviceID = context.params.deviceID;
    const ledType = context.params.ledType;
    const newValue = change.after.val();
    const previousValue = change.before.val();

    console.log(
      `Device ID: ${deviceID}, LED Type: ${ledType}, New Value: ${newValue}, Previous Value: ${previousValue}`
    );

    try {
      if (newValue === true && previousValue !== true) {
        // LED just turned on
        await handleLedOn(deviceID, ledType);
      }

      if (newValue === true) {
        // LED remains on, set up reminder
        await scheduleReminderEmail(deviceID, ledType);
      } else if (newValue === false && previousValue === true) {
        // LED turned off
        await clearReminder(deviceID, ledType);
      }
    } catch (error) {
      console.error(
        `Error processing LED change for Device ${deviceID}:`,
        error
      );
    }

    return null;
  });

/**
 * Handle the LED turning on and sending an immediate alert email
 * @param {string} deviceID - The ID of the device.
 * @param {string} ledType - The type of LED.
 */
async function handleLedOn(deviceID, ledType) {
  const alertReason = getAlertReason(ledType);
  if (alertReason) {
    try {
      await sendEmail(deviceID, ledType, alertReason);
      await updateLedOnTimestamp(deviceID, ledType);
    } catch (error) {
      console.error(
        `Error sending immediate email for Device ${deviceID}:`,
        error
      );
    }
  }
}

/**
 * Schedule reminder emails every 2 hours if LED remains on
 * @param {string} deviceID - The ID of the device.
 * @param {string} ledType - The type of LED.
 */
async function scheduleReminderEmail(deviceID, ledType) {
  const reminderInterval = 2 * 60 * 60 * 1000; // 2 hours
  const lastEmailTimestamp = await getLedOnTimestamp(deviceID, ledType);
  const currentTime = Date.now();

  if (
    lastEmailTimestamp &&
    currentTime - lastEmailTimestamp >= reminderInterval
  ) {
    const alertReason = getAlertReason(ledType);
    if (alertReason) {
      try {
        await sendEmail(deviceID, ledType, alertReason);
        await updateLedOnTimestamp(deviceID, ledType); // Update timestamp for the next reminder
      } catch (error) {
        console.error(
          `Error sending reminder email for Device ${deviceID}:`,
          error
        );
      }
    }
  }

  // Schedule next reminder if the LED remains on
  setTimeout(async () => {
    const currentState = await getCurrentLedState(deviceID, ledType);
    if (currentState === true) {
      await scheduleReminderEmail(deviceID, ledType); // Recursively schedule the next reminder
    }
  }, reminderInterval);
}

/**
 * Clear the LED on timestamp when the LED is turned off
 * @param {string} deviceID - The ID of the device.
 * @param {string} ledType - The type of LED.
 */
async function clearReminder(deviceID, ledType) {
  await clearLedOnTimestamp(deviceID, ledType);
}

/**
 * Get the current state of the LED from the database
 * @param {string} deviceID - The ID of the device.
 * @param {string} ledType - The type of LED.
 * @return {boolean} - The current state of the LED.
 */
async function getCurrentLedState(deviceID, ledType) {
  const snapshot = await db.ref(`Devices/${deviceID}/${ledType}`).once('value');
  return snapshot.val();
}

/**
 * Get a reason for the alert based on the type of LED
 * @param {string} ledType - The type of LED.
 * @return {string|null} - The reason for the alert or null.
 */
function getAlertReason(ledType) {
  switch (ledType) {
    case 'ledHighTemp':
      return 'high temperature';
    case 'ledLowTemp':
      return 'low temperature';
    case 'ledHighHum':
      return 'high humidity';
    case 'ledWaterLeak':
      return 'water leak detected';
    default:
      return null;
  }
}

/**
 * Retrieve the last timestamp when the LED was turned on
 * @param {string} deviceID - The ID of the device.
 * @param {string} ledType - The type of LED.
 * @return {number|null} - The timestamp when the LED was last turned on.
 */
async function getLedOnTimestamp(deviceID, ledType) {
  const snapshot = await db
    .ref(`Devices/${deviceID}/ledOnTimestamps/${ledType}`)
    .once('value');
  return snapshot.val();
}

/**
 * Update the timestamp for when the LED was turned on
 * @param {string} deviceID - The ID of the device.
 * @param {string} ledType - The type of LED.
 */
async function updateLedOnTimestamp(deviceID, ledType) {
  await db
    .ref(`Devices/${deviceID}/ledOnTimestamps/${ledType}`)
    .set(Date.now());
}

/**
 * Clear the timestamp for when the LED was turned on
 * @param {string} deviceID - The ID of the device.
 * @param {string} ledType - The type of LED.
 */
async function clearLedOnTimestamp(deviceID, ledType) {
  await db.ref(`Devices/${deviceID}/ledOnTimestamps/${ledType}`).remove();
}

/**
 * Send an alert email to the admin about the LED state
 * @param {string} deviceID - The ID of the device.
 * @param {string} ledType - The type of LED.
 * @param {string} reason - The reason for the alert.
 */
async function sendEmail(deviceID, ledType, reason) {
  try {
    const snapshot = await db.ref(`Devices/${deviceID}/owner`).once('value');
    const userID = snapshot.val();

    if (!userID) {
      console.error(`No owner found for Device ID: ${deviceID}`);
      return;
    }

    const userSnapshot = await db
      .ref(`UsersData/${userID}/${deviceID}/contactInfo`)
      .once('value');
    const userInfo = userSnapshot.val() || {};

    // Prepare email content
    const mailOptions = {
      from: functions.config().gmail.email, // Use config for security
      to: 'homewatchsensordata@gmail.com', // Admin email
      subject: `Alert for Device ${deviceID}`,
      html: `
        <p>Alert: ${reason}</p>
        <p>Device ID: ${deviceID}</p>
        <p>LED: ${ledType}</p>
        <p>User Information:</p>
        <ul>
          <li>Name: ${userInfo.name || 'Blank'}</li>
          <li>Physical Address: ${userInfo.physicalAddress || 'Blank'}</li>
          <li>Mailing Address: ${userInfo.mailingAddress || 'Blank'}</li>
          <li>Phone Number: ${userInfo.phoneNumber || 'Blank'}</li>
          <li>Emergency Contact: ${userInfo.emergencyContact || 'Blank'}</li>
          <li>Emergency Phone: ${userInfo.emergencyPhone || 'Blank'}</li>
          <li>Emergency Email: ${userInfo.emergencyEmail || 'Blank'}</li>
        </ul>
      `,
    };

    console.log(`Sending email for Device ID: ${deviceID}`);
    await transporter.sendMail(mailOptions);
    console.log(`Email sent for Device ID: ${deviceID}`);
  } catch (error) {
    console.error(`Error sending email for Device ID ${deviceID}:`, error);
  }
}
