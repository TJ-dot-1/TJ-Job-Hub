import axios from 'axios';
import crypto from 'crypto';

const MPESA_BASE_URL = process.env.MPESA_ENVIRONMENT === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORT_CODE = process.env.MPESA_SHORT_CODE;
const PASSKEY = process.env.MPESA_PASSKEY;

// Get M-Pesa access token
export const getMpesaAccessToken = async () => {
  try {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    const response = await axios.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('M-Pesa access token error:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
};

// Generate M-Pesa password
export const generateMpesaPassword = () => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3); // YYYYMMDDHHMMSS
  const password = Buffer.from(SHORT_CODE + PASSKEY + timestamp).toString('base64');

  return { password, timestamp };
};

// Initiate STK Push
export const initiateSTKPush = async (phoneNumber, amount, accountReference, transactionDesc) => {
  try {
    const accessToken = await getMpesaAccessToken();
    const { password, timestamp } = generateMpesaPassword();

    // Format phone number (remove + and ensure 254 format)
    const formattedPhone = phoneNumber.replace(/^\+/, '').replace(/^0/, '254');

    const payload = {
      BusinessShortCode: SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: SHORT_CODE,
      PhoneNumber: formattedPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/subscription/mpesa-callback`,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc
    };

    const response = await axios.post(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('M-Pesa STK Push error:', error.response?.data || error.message);
    throw new Error('Failed to initiate M-Pesa STK Push');
  }
};

// Query STK Push status
export const querySTKPushStatus = async (checkoutRequestId) => {
  try {
    const accessToken = await getMpesaAccessToken();
    const { password, timestamp } = generateMpesaPassword();

    const payload = {
      BusinessShortCode: SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    const response = await axios.post(`${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('M-Pesa query error:', error.response?.data || error.message);
    throw new Error('Failed to query M-Pesa STK Push status');
  }
};