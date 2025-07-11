// js/driver_dashboard.js - Complete implementation
import { request } from './api.js';
import { isAuthenticated, removeToken, getDriverId, setDriverId } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Check if driver is authenticated, otherwise redirect to login
    if (!isAuthenticated('driver')) {
        window.location.href = 'driver_login.html';
        return;
    }

    // --- DOM Elements ---
    const driverNameSpan = document.getElementById('driverName');
    const driverEmailSpan = document.getElementById('driverEmail');
    const driverPhoneSpan = document.getElementById('driverPhone');
    const driverLicenseSpan = document.getElementById('driverLicense');
    const driverVehicleSpan = document.getElementById('driverVehicle');
    const driverStatusSpan = document.getElementById('driverStatus');
    const setStatusAvailableButton = document.getElementById('setStatusAvailable');
    const setStatusUnavailableButton = document.getElementById('setStatusUnavailable');
    const statusMessageArea = document.getElementById('statusMessageArea'); // Message area for status updates
    const driverRidesListDiv = document.getElementById('driverRidesList');
    const logoutButton = document.getElementById('logoutButton');
    const refreshRidesButton = document.getElementById('refreshRides');

    let currentDriverId = getDriverId(); // Get driver ID from storage

    // --- Utility Functions for UI ---
     function showMessage(element, text, type = 'info') {
         element.textContent = text;
         element.className = `message ${type}`; // Use 'info', 'success', 'error', 'loading', 'warning'
     }

     function clearMessage(element) {
         element.textContent = '';
         element.className = 'message'; // Reset class
     }


     // Function to fetch and display driver profile (GET /api/drivers/profile)
    async function fetchDriverProfile() {
        try {
            const profile = await request('GET', '/drivers/profile', null, true, 'driver');
            driverNameSpan.textContent = profile.name;
            driverEmailSpan.textContent = profile.email;
            driverPhoneSpan.textContent = profile.phone;
            driverLicenseSpan.textContent = profile.licenseNumber;
            driverVehicleSpan.textContent = profile.vehicleDetails;
            driverStatusSpan.textContent = profile.status || 'UNKNOWN'; // Display current status
             if (!currentDriverId && profile.id) { // If ID wasn't stored during login, store it now
                 setDriverId(profile.id);
                 currentDriverId = profile.id;
                 // After setting ID, maybe trigger fetchRides if they failed initially
                 fetchDriverRides();
             }
        } catch (error) {
            console.error('Failed to fetch driver profile:', error);
             driverStatusSpan.textContent = 'Error loading status';
             // Consider logging out driver if profile fetch fails
             // removeToken('driver');
             // window.location.href = 'driver_login.html';
        }
    }

     // Function to update driver status (PUT /api/drivers/status/{driverId})
    async function updateDriverStatus(status) {
         if (!currentDriverId) {
             showMessage(statusMessageArea, 'Error: Driver ID not available.', 'error');
             console.error("Driver ID not available to update status.");
             return;
         }
         clearMessage(statusMessageArea); // Clear previous message
         setStatusAvailableButton.disabled = true; // Disable both buttons
         setStatusUnavailableButton.disabled = true;


        try {
            showMessage(statusMessageArea, `Setting status to ${status}...`, 'loading');
            // API Call: PUT /api/drivers/status/{driverId}
            const response = await request('PUT', `/drivers/status/${currentDriverId}`, { status: status }, true, 'driver');
             if (response && response.status) {
                 driverStatusSpan.textContent = response.status; // Update status display
                 showMessage(statusMessageArea, `Status updated to ${response.status}`, 'success');
             } else {
                  throw new Error('Invalid response from status update');
             }

        } catch (error) {
            showMessage(statusMessageArea, `Failed to update status: ${error.message}`, 'error');
             console.error('Failed to update status:', error);
        } finally {
             setStatusAvailableButton.disabled = false; // Re-enable both buttons
             setStatusUnavailableButton.disabled = false;
        }
    }

    // Function to fetch and display driver's rides (GET /api/rides/driver/{driverId})
    async function fetchDriverRides() {
         if (!currentDriverId) {
             console.error("Driver ID not available to fetch rides.");
             driverRidesListDiv.innerHTML = '<p class="message error">Error loading rides: Driver ID not found.</p>';
             return;
         }
        try {
            driverRidesListDiv.innerHTML = '<p class="message loading">Loading Rides...</p>'; // Show loading
            // API Call: GET /api/rides/driver/{driverId}
            const rides = await request('GET', `/rides/driver/${currentDriverId}`, null, true, 'driver');

            if (rides && rides.length > 0) {
                driverRidesListDiv.innerHTML = rides.map(ride => `
                    <div class="ride-item" data-ride-id="${ride.id}">
                        <h4>Ride ID: ${ride.id} <span style="color: ${ride.status === 'COMPLETED' ? 'var(--secondary-color)' : ride.status === 'CANCELLED' ? 'var(--danger-color)' : 'var(--primary-color)'}">${ride.status}</span></h4>
                        ${ride.fare ? `<p><strong>Fare:</strong> $${ride.fare.toFixed(2)}</p>` : ''}
                        <p><strong>Pickup:</strong> ${ride.pickupLocation} (${ride.pickupLatitude}, ${ride.pickupLongitude})</p>
                        <p><strong>Dropoff:</strong> ${ride.dropoffLocation} (${ride.dropoffLatitude}, ${ride.dropoffLongitude})</p>
                        ${ride.user ? `<p><strong>Passenger:</strong> ${ride.user.name} (${ride.user.phone})</p>` : ''}
                         ${ride.payment ? `<p><strong>Payment Status:</strong> ${ride.payment.status || 'Pending'}</p>` : ''}

                        <div class="ride-actions">
                         <!-- Buttons to update ride status -->
                         ${ride.status === 'ACCEPTED' ?
                            `<button type="button" class="update-ride-status" data-ride-id="${ride.id}" data-status="PICKED_UP">Mark as Picked Up</button>`
                            : ''}
                         ${ride.status === 'PICKED_UP' ?
                            `<button type="button" class="update-ride-status" data-ride-id="${ride.id}" data-status="COMPLETED">Mark as Completed</button>`
                            : ''}
                         </div>
                    </div>
                `).join('');

                 // Add event listeners to the dynamically created buttons
                 driverRidesListDiv.querySelectorAll('.update-ride-status').forEach(button => {
                     button.addEventListener('click', async (event) => {
                         const rideId = event.target.dataset.rideId;
                         const newStatus = event.target.dataset.status;
                         await updateRideStatusForRide(rideId, newStatus, event.target); // Pass button
                     });
                 });

            } else {
                driverRidesListDiv.innerHTML = '<p>No rides found.</p>';
            }
        } catch (error) {
            console.error('Failed to fetch driver rides:', error);
            driverRidesListDiv.innerHTML = `<p class="message error">Error loading rides: ${error.message}</p>`;
        }
    }

     // Function to update a specific ride's status (called by driver buttons) (PUT /api/rides/status/{rideId})
     async function updateRideStatusForRide(rideId, status, buttonElement) {
         try {
             // Disable the button clicked during the request
              if (buttonElement) buttonElement.disabled = true;
              // Optional: Add visual indicator (e.g., button text changes to "Updating...")

             // API Call: PUT /api/rides/status/{rideId}
             const response = await request('PUT', `/rides/status/${rideId}`, { status: status }, true, 'driver');

             if (response && response.status) {
                 console.log(`Ride ${rideId} status updated to ${response.status}`);
                  // Refresh the ride list to show the updated status and button changes
                  fetchDriverRides();
                 // Optional: Show a small success message near the ride item if needed
             } else {
                 throw new Error('Invalid response from status update API');
             }
         } catch (error) {
             console.error(`Failed to update ride ${rideId} status to ${status}:`, error);
              // Optional: Show an error message near the ride item if needed
         } finally {
             // Re-enable button if it was disabled (in case fetchRides fails)
             if (buttonElement) buttonElement.disabled = false;
         }
     }


    // Load profile and rides on page load
     await fetchDriverProfile(); // Get profile & set/confirm driver ID
     if (currentDriverId) { // Ensure driver ID is available before fetching driver-specific data
         fetchDriverRides();
     } else {
          // If driver ID somehow wasn't set after fetchDriverProfile, redirect
         window.location.href = 'driver_login.html';
     }


    // Handle status buttons
    setStatusAvailableButton.addEventListener('click', () => updateDriverStatus('AVAILABLE'));
    setStatusUnavailableButton.addEventListener('click', () => updateDriverStatus('UNAVAILABLE'));


    // Handle refresh rides button
    refreshRidesButton.addEventListener('click', fetchDriverRides);

    // Handle logout button
    logoutButton.addEventListener('click', () => {
        removeToken('driver');
        window.location.href = 'index.html'; // Redirect to landing page
    });

});