// js/user_login.js
import { request } from './api.js';
import { setToken, setUserId } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('userLoginForm');
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
            // API Call: POST /api/users/login
            const response = await request('POST', '/users/login', data, false);

            // Assuming the backend returns { token: '...', user: { id: '...' } }
            if (response && response.token && response.user && response.user.id) {
                setToken('user', response.token);
                setUserId(response.user.id); // Store user ID
                messageArea.textContent = 'Login successful! Redirecting...';
                messageArea.className = 'message success';
                window.location.href = 'user_dashboard.html';
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