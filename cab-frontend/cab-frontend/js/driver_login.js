// js/driver_login.js
import { request } from './api.js';
import { setToken, setDriverId } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('driverLoginForm');
    const messageArea = document.getElementById('messageArea');
     const loginButton = form.querySelector('button[type="submit"]'); // Get the submit button


    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        messageArea.textContent = '';
        messageArea.className = 'message';
        loginButton.disabled = true; // Disable button

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const data = { email, password };
            // API Call: POST /api/drivers/login
            const response = await request('POST', '/drivers/login', data, false);

            // Assuming the backend returns { token: '...', driver: { id: '...' } }
            if (response && response.token && response.driver && response.driver.id) {
                setToken('driver', response.token);
                setDriverId(response.driver.id); // Store driver ID
                messageArea.textContent = 'Login successful! Redirecting...';
                messageArea.className = 'message success';
                window.location.href = 'driver_dashboard.html';
            } else {
                 throw new Error('Invalid response from server');
            }

        } catch (error) {
            messageArea.textContent = `Login failed: ${error.message}`;
            messageArea.className = 'message error';
        } finally {
             loginButton.disabled = false; // Re-enable button
        }
    });
});