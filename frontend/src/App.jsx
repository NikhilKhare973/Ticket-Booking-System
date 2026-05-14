import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';
import './App.css';
import axios from 'axios';

function App() {
  const [loading, setLoading] = useState(false);

  // This function runs when you click the "Pay Now" button
  const handlePayment = async () => {
    setLoading(true);

    try {
      // -----> 1.Tell the Backend to Create an Order
      // We are hardcoding bookingId 1 and amount 500 for this test
      // const orderResponse = await axios.post(
      //   'http://localhost:3000/payments/create-order',
      //   {
      //     bookingId: 9, // <- This should match a valid booking ID in your NestJS backend
      //     amount: 500,
      //   },
      // );

      const backendOrderData = {
        order_id: 'order_ShL24Wc8nYGxzw', // Put quotes around it!
        amount: 10000, // Put the amount in paise (e.g., Rs 100 = 10000)
        currency: 'INR',
      }; // This contains the order_id, amount, and currency from the backend

      // -----> 2. Open the Razorpay Popup Window <-----
      const options = {
        key: 'rzp_test_SgvTgZz9wBKVoQ', // <-- Razorpay Test Key ID here!
        amount: backendOrderData.amount, // It's already in paise (50000) from the backend
        currency: backendOrderData.currency,
        name: 'Ticket Booking System',
        description: 'Payment for Movie Ticket',
        order_id: backendOrderData.order_id, // The ID we just got from NestJS!

        // -----> 3. This handler runs automatically IF the payment is successful
        handler: async function (response) {
          alert(
            `Payment Successful! Payment ID: ${response.razorpay_payment_id}`,
          );

          // -----> 4. Send the digital receipt back to the backend to verify it
          try {
            const verifyResponse = await axios.post(
              'http://localhost:3000/payments/verify',
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
            );

            alert('Backend says: ' + verifyResponse.data.message);
          } catch (verifyError) {
            alert('Payment verification failed on backend!');
          }
        },
        theme: {
          color: '#3399cc',
        },
      };

      //  ---------->> Create the popup and open it!  <<-----------
      const rzpWindow = new window.Razorpay(options);
      rzpWindow.open();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to start payment. Check your NestJS terminal for errors.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h1>Complete Your Booking</h1>
        <p>Movie: Dhurandhar 2 : The Revenge</p>
        <p>Total: Rs. 100</p>

        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '18px',
            cursor: 'pointer',
            backgroundColor: '#3399cc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </>
  );
}

export default App;
