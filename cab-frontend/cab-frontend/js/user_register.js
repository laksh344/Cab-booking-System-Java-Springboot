// js/user_register.js
import { request } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('userRegisterForm');
    const messageArea = document.getElementById('messageArea');
    const registerButton = form.querySelector('button[type="submit"]'); // Get the submit button


    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        messageArea.textContent = ''; // Clear previous messages
        messageArea.className = 'message'; // Reset class
        registerButton.disabled = true; // Disable button

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const phone = document.getElementById('phone').value;

        try {
            const data = { name, email, password, phone };
            // API Call: POST /api/users/register
            const response = await request('POST', '/users/register', data, false);

            // Assuming registration success returns a message or user object
            messageArea.textContent = 'Registration successful! Redirecting to login...';
            messageArea.className = 'message success';
            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = 'user_login.html';
            }, 2000);

        } catch (error) {
            messageArea.textContent = `Registration failed: ${error.message}`;
            messageArea.className = 'message error';
        } finally {
             registerButton.disabled = false; // Re-enable button
        }
    });
});