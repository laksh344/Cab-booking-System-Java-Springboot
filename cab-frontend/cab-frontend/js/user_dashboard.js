// js/user_dashboard.js - Complete implementation
import { request } from './api.js';
import { isAuthenticated, removeToken, getUserId, setUserId } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is authenticated, otherwise redirect to login
    if (!isAuthenticated('user')) {
        window.location.href = 'user_login.html';
        return;
    }

    // --- DOM Elements ---
    const userNameSpan = document.getElementById('userName');
    const userEmailSpan = document.getElementById('userEmail');
    const userPhoneSpan = document.getElementById('userPhone');
    const editProfileButton = document.getElementById('editProfileButton');
    const editProfileSection = document.getElementById('editProfileSection'); // The container div
    const editProfileForm = document.getElementById('editProfileForm');
    const editNameInput = document.getElementById('editName');
    const editPhoneInput = document.getElementById('editPhone');
    const cancelEditProfileButton = document.getElementById('cancelEditProfile');
    const editProfileMessageArea = document.getElementById('editProfileMessage');

    const availableDriversCountSpan = document.getElementById('availableDriversCount');
    const refreshAvailabilityButton = document.getElementById('refreshAvailability');
    const bookingAvailabilityMessageArea = document.getElementById('bookingAvailabilityMessage');

    const bookRideForm = document.getElementById('bookRideForm');
    const bookRideButton = document.getElementById('bookRideButton'); // Get the button
    const pickupLocationInput = document.getElementById('pickupLocation');
    const pickupLatitudeInput = document.getElementById('pickupLatitude');
    const pickupLongitudeInput = document.getElementById('pickupLongitude');
    const dropoffLocationInput = document.getElementById('dropoffLocation');
    const dropoffLatitudeInput = document.getElementById('dropoffLatitude');
    const dropoffLongitudeInput = document.getElementById('dropoffLongitude');

    const bookingMessageArea = document.getElementById('bookingMessage');
    const bookingStatusDiv = document.getElementById('bookingStatus');
    const userRidesListDiv = document.getElementById('userRidesList');
    const refreshRidesButton = document.getElementById('refreshRides');

    const userRatingsListDiv = document.getElementById('userRatingsList');
    const refreshRatingsButton = document.getElementById('refreshRatings');

    const receiptDisplayArea = document.getElementById('receiptDisplayArea');
    const receiptContentDiv = document.getElementById('receiptContent');
    const closeReceiptButton = document.getElementById('closeReceipt');

    const logoutButton = document.getElementById('logoutButton');

    let currentUserId = getUserId(); // Get user ID from storage

    // --- Utility Functions for UI ---
    function showSection(sectionElement) {
         sectionElement.classList.add('visible');
    }

    function hideSection(sectionElement) {
         sectionElement.classList.remove('visible');
         // Clear messages when hiding forms/sections with messages
         if (sectionElement === editProfileSection) {
              clearMessage(editProfileMessageArea);
         }
         // Add specific clear for rating forms if needed when hiding manually
         if (sectionElement.classList.contains('rating-form-area')) {
              const rideId = sectionElement.id.replace('ratingFormArea_', '');
              clearMessage(document.getElementById(`ratingMessage_${rideId}`));
         }
    }

     function showMessage(element, text, type = 'info') {
         element.textContent = text;
         element.className = `message ${type}`; // Use 'info', 'success', 'error', 'loading', 'warning'
     }

     function clearMessage(element) {
         element.textContent = '';
         element.className = 'message'; // Reset class
     }


    // --- API Calls & Display Functions ---

    // Function to fetch and display user profile (GET /api/users/profile)
    async function fetchUserProfile() {
        try {
            const profile = await request('GET', '/users/profile', null, true, 'user');
            userNameSpan.textContent = profile.name;
            userEmailSpan.textContent = profile.email;
            userPhoneSpan.textContent = profile.phone;
            // Pre-fill edit form
            editNameInput.value = profile.name;
            editPhoneInput.value = profile.phone;

            if (!currentUserId && profile.id) { // If ID wasn't stored during login, store it now
                setUserId(profile.id);
                currentUserId = profile.id;
                // After setting ID, maybe trigger fetchRides/Ratings if they failed initially
                fetchUserRides();
                fetchUserRatingsHistory();
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            userNameSpan.textContent = 'Error loading profile';
            userEmailSpan.textContent = 'N/A';
            userPhoneSpan.textContent = 'N/A';
            // If profile fails, assume auth might be broken
             // removeToken('user'); // Consider logging out user if profile fetch fails
             // window.location.href = 'user_login.html';
        }
    }

    // Function to fetch and display available drivers count (GET /api/drivers/available)
    async function fetchAvailableDrivers() {
        try {
             availableDriversCountSpan.textContent = '...'; // Indicate loading
            const response = await request('GET', '/drivers/available', null, true, 'user');
            const count = response.count || (response.drivers ? response.drivers.length : 0); // Adjust based on actual API response structure
            availableDriversCountSpan.textContent = count;

            if (count > 0) {
                 bookRideButton.disabled = false;
                 clearMessage(bookingAvailabilityMessageArea);
            } else {
                 bookRideButton.disabled = true;
                 showMessage(bookingAvailabilityMessageArea, 'No drivers available currently. Please try again later.', 'warning');
            }

        } catch (error) {
            console.error('Failed to fetch available drivers:', error);
            availableDriversCountSpan.textContent = 'Error';
            bookRideButton.disabled = true; // Disable booking on error
            showMessage(bookingAvailabilityMessageArea, `Could not check driver availability: ${error.message}`, 'error');
        }
    }


    // Function to fetch and display user's rides (GET /api/rides/user/{userId})
    async function fetchUserRides() {
        if (!currentUserId) {
            console.error("User ID not available to fetch rides.");
            userRidesListDiv.innerHTML = '<p class="message error">Error loading rides: User ID not found.</p>';
            return;
        }
        try {
             userRidesListDiv.innerHTML = '<p class="message loading">Loading Rides...</p>'; // Show loading state
            const rides = await request('GET', `/rides/user/${currentUserId}`, null, true, 'user');

            if (rides && rides.length > 0) {
                userRidesListDiv.innerHTML = rides.map(ride => {
                    let actionsHTML = '';
                    // Determine available actions based on ride status and payment/rating info
                    if (ride.status === 'COMPLETED') {
                        if (!ride.payment || ride.payment.status !== 'PAID') {
                            actionsHTML += `<button type="button" class="ride-action-button" data-action="pay" data-ride-id="${ride.id}">Pay Now</button>`;
                        } else {
                            actionsHTML += `<button type="button" class="ride-action-button" data-action="view-receipt" data-payment-id="${ride.payment ? ride.payment.id : ''}">View Receipt</button>`; // Use optional chaining just in case
                            if (!ride.rating) {
                                actionsHTML += `<button type="button" class="ride-action-button" data-action="rate" data-ride-id="${ride.id}">Rate Ride</button>`;
                            }
                        }
                    }
                     // Add a Cancel button for PENDING/ACCEPTED rides? (If backend supports cancel API)
                    // Example (API not provided):
                    // if (ride.status === 'PENDING' || ride.status === 'ACCEPTED' || ride.status === 'PENDING_DRIVER_ASSIGN') {
                    //    actionsHTML += `<button type="button" class="ride-action-button" data-action="cancel" data-ride-id="${ride.id}" style="background-color: var(--danger-color);">Cancel Ride</button>`;
                    // }


                    return `
                        <div class="ride-item">
                            <h4>Ride ID: ${ride.id} <span style="color: ${ride.status === 'COMPLETED' ? 'var(--secondary-color)' : ride.status === 'CANCELLED' ? 'var(--danger-color)' : 'var(--primary-color)'}">${ride.status}</span></h4>
                            ${ride.fare ? `<p><strong>Fare:</strong> $${ride.fare.toFixed(2)}</p>` : ''}
                            <p><strong>Pickup:</strong> ${ride.pickupLocation}</p>
                            <p><strong>Dropoff:</strong> ${ride.dropoffLocation}</p>
                            ${ride.driver ? `<p><strong>Driver:</strong> ${ride.driver.name} (${ride.driver.vehicleDetails})</p>` : '<p style="color: var(--warning-color);">Finding driver...</p>'}
                             ${ride.payment ? `<p><strong>Payment:</strong> ${ride.payment.status || 'Pending'} (${ride.payment.method || ''}) ${ride.payment.id ? `(ID: ${ride.payment.id})` : ''}</p>` : ''}
                             ${ride.rating ? `<p><strong>Rating:</strong> ${ride.rating.score}/5 - "${rating.comments || 'No comments'}"</p>` : ''}
                            <div class="ride-actions" data-ride-id="${ride.id}">
                                ${actionsHTML}
                            </div>
                             <!-- Simple form area for rating -->
                             <div class="rating-form-area" id="ratingFormArea_${ride.id}">
                                 <h5>Rate this ride:</h5>
                                 <select class="rating-score">
                                     <option value="5">5 Stars - Excellent</option>
                                     <option value="4">4 Stars - Very Good</option>
                                     <option value="3">3 Stars - Good</option>
                                     <option value="2">2 Stars - Fair</option>
                                     <option value="1">1 Star - Poor</option>
                                 </select>
                                 <textarea class="rating-comments" placeholder="Comments (Optional)" rows="2"></textarea>
                                 <button type="button" class="submit-rating-button" data-ride-id="${ride.id}">Submit Rating</button>
                                 <button type="button" class="cancel-rating-button" data-ride-id="${ride.id}">Cancel</button>
                                  <p class="message" id="ratingMessage_${ride.id}"></p> <!-- Message area for rating -->
                             </div>
                        </div>
                    `;
                }).join('');

                // Add event listeners to the dynamically created buttons
                userRidesListDiv.querySelectorAll('.ride-action-button').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const action = event.target.dataset.action;
                        const rideId = event.target.dataset.rideId;
                        const paymentId = event.target.dataset.paymentId; // For view-receipt action

                        // Hide the receipt display area if it's open before performing another action
                         hideSection(receiptDisplayArea);


                        if (action === 'pay') {
                            handlePayment(rideId, event.target); // Pass button to disable
                        } else if (action === 'view-receipt') {
                            handleViewReceipt(paymentId);
                        } else if (action === 'rate') {
                             // Show the rating form for this ride
                             const ratingFormArea = document.getElementById(`ratingFormArea_${rideId}`);
                             showSection(ratingFormArea);
                             // Hide the action buttons for this ride item temporarily
                             const actionsDiv = event.target.closest('.ride-actions');
                             if(actionsDiv) actionsDiv.style.display = 'none';
                        }
                        // Handle cancel action if implemented
                        // else if (action === 'cancel') { handleCancelRide(rideId, event.target); }
                    });
                });

                 // Add event listeners for dynamically created rating form buttons
                 userRidesListDiv.querySelectorAll('.submit-rating-button').forEach(button => {
                     button.addEventListener('click', async (event) => {
                         const rideId = event.target.dataset.rideId;
                         const ratingFormArea = document.getElementById(`ratingFormArea_${rideId}`);
                         const score = ratingFormArea.querySelector('.rating-score').value;
                         const comments = ratingFormArea.querySelector('.rating-comments').value;
                         const messageElement = document.getElementById(`ratingMessage_${rideId}`);

                         await handleRating(rideId, parseInt(score), comments, event.target, messageElement);
                         // After submitting, hide the form regardless of success/failure
                         // Add a small delay so user can see success/error message before it hides
                         setTimeout(() => {
                              hideSection(ratingFormArea);
                              // Show action buttons again
                              const actionsDiv = ratingFormArea.closest('.ride-item').querySelector('.ride-actions');
                              if (actionsDiv) actionsDiv.style.display = 'flex';
                              fetchUserRides(); // Refresh rides to show updated status/buttons
                              fetchUserRatingsHistory(); // Refresh ratings history
                         }, 1500); // Delay hiding
                     });
                 });

                 userRidesListDiv.querySelectorAll('.cancel-rating-button').forEach(button => {
                     button.addEventListener('click', (event) => {
                         const rideId = event.target.dataset.rideId;
                         const ratingFormArea = document.getElementById(`ratingFormArea_${rideId}`);
                         hideSection(ratingFormArea);
                          // Show action buttons again
                          const actionsDiv = ratingFormArea.closest('.ride-item').querySelector('.ride-actions');
                          if (actionsDiv) actionsDiv.style.display = 'flex';
                          clearMessage(document.getElementById(`ratingMessage_${rideId}`)); // Clear rating message
                     });
                 });


            } else {
                userRidesListDiv.innerHTML = '<p>No rides found.</p>';
            }
        } catch (error) {
            console.error('Failed to fetch user rides:', error);
            userRidesListDiv.innerHTML = `<p class="message error">Error loading rides: ${error.message}</p>`;
        }
    }

     // Function to process payment (POST /api/payments/process)
     async function handlePayment(rideId, buttonElement) {
         const confirmPay = confirm(`Confirm payment for Ride ID ${rideId}?`);
         if (!confirmPay) return;

         // Disable button while processing
         if(buttonElement) buttonElement.disabled = true;

         try {
             const paymentData = { rideId: parseInt(rideId), paymentMethod: "UPI" };
             // API Call: POST /api/payments/process
             const response = await request('POST', '/payments/process', paymentData, true, 'user');

             if (response && response.paymentId) {
                 console.log('Payment processed successfully:', response);
                 alert(`Payment successful! Payment ID: ${response.paymentId}`); // Still using alert for simplicity here
                 fetchUserRides(); // Refresh ride list to show payment status updated
             } else {
                 throw new Error('Payment processing failed');
             }

         } catch (error) {
             console.error('Payment error:', error);
             alert(`Payment failed: ${error.message}`); // Still using alert
         } finally {
              // Re-enable button
             if(buttonElement) buttonElement.disabled = false;
         }
     }

      // Function to view payment receipt (GET /api/payments/receipt/{paymentId})
      async function handleViewReceipt(paymentId) {
          if (!paymentId) {
               alert("No payment ID available for this ride.");
               return;
          }
           clearMessage(editProfileMessageArea); // Clear other messages that might be visible
           hideSection(editProfileSection); // Hide edit profile if open

          try {
              receiptContentDiv.innerHTML = '<p class="message loading">Loading receipt...</p>'; // Loading message
              showSection(receiptDisplayArea); // Show the receipt area placeholder

              // API Call: GET /api/payments/receipt/{paymentId}
              const receipt = await request('GET', `/payments/receipt/${paymentId}`, null, true, 'user');

              receiptContentDiv.innerHTML = `
                  <p><strong>Payment ID:</strong> ${receipt.id || 'N/A'}</p>
                  <p><strong>Ride ID:</strong> ${receipt.rideId || 'N/A'}</p>
                  <p><strong>Amount:</strong> ${receipt.amount ? `$${receipt.amount.toFixed(2)}` : 'N/A'}</p>
                  <p><strong>Method:</strong> ${receipt.method || 'N/A'}</p>
                  <p><strong>Status:</strong> ${receipt.status || 'N/A'}</p>
                  <p><strong>Date:</strong> ${receipt.timestamp ? new Date(receipt.timestamp).toLocaleString() : 'N/A'}</p>
                  <!-- Add more details from receipt object as available -->
              `;


          } catch (error) {
              console.error('Failed to fetch receipt:', error);
              receiptContentDiv.innerHTML = `<p class="message error">Failed to load receipt: ${error.message}</p>`;
              // Optionally hide the area on error after a short delay
              // setTimeout(() => hideSection(receiptDisplayArea), 3000);
          }
      }

      // Function to submit a rating (POST /api/ratings)
      async function handleRating(rideId, score, comments, buttonElement, messageElement) {
           clearMessage(messageElement); // Clear previous rating message
          try {
              const ratingData = {
                  rideId: parseInt(rideId), // Ensure rideId is number
                  score: parseInt(score), // Ensure score is number
                  comments: comments || ''
              };
               // Disable the submit button while processing
              if(buttonElement) buttonElement.disabled = true;
               showMessage(messageElement, 'Submitting rating...', 'loading');

              // API Call: POST /api/ratings
              const response = await request('POST', '/ratings', ratingData, true, 'user');

              if (response && response.id) {
                  console.log('Rating submitted successfully:', response);
                  showMessage(messageElement, 'Rating submitted successfully!', 'success');
                   // The form hiding and list refresh are handled by the event listener's setTimeout
              } else {
                  throw new Error('Rating submission failed: Invalid response');
              }

          } catch (error) {
              console.error('Rating error:', error);
              showMessage(messageElement, `Rating submission failed: ${error.message}`, 'error');
          } finally {
               // Re-enable the submit button
              if(buttonElement) buttonElement.disabled = false;
          }
      }

     // Function to fetch and display user's rating history (GET /api/ratings/user/{userId})
     async function fetchUserRatingsHistory() {
          if (!currentUserId) {
              console.error("User ID not available to fetch ratings.");
              userRatingsListDiv.innerHTML = '<p class="message error">Error loading ratings: User ID not found.</p>';
              return;
          }
         try {
             userRatingsListDiv.innerHTML = '<p class="message loading">Loading Ratings...</p>'; // Show loading state
             // API Call: GET /api/ratings/user/{userId}
             const ratings = await request('GET', `/ratings/user/${currentUserId}`, null, true, 'user');

             if (ratings && ratings.length > 0) {
                 userRatingsListDiv.innerHTML = ratings.map(rating => `
                     <div class="rating-item">
                         <h5>Rating for Ride ID: ${rating.rideId}</h5>
                         <p><strong>Score:</strong> ${rating.score}/5</p>
                         <p><strong>Comments:</strong> "${rating.comments || 'No comments'}"</p>
                          <p><strong>Date:</strong> ${rating.timestamp ? new Date(rating.timestamp).toLocaleString() : 'N/A'}</p>
                         <!-- Add more rating details if available -->
                     </div>
                 `).join('');
             } else {
                 userRatingsListDiv.innerHTML = '<p>No ratings submitted yet.</p>';
             }
         } catch (error) {
             console.error('Failed to fetch user ratings:', error);
             userRatingsListDiv.innerHTML = `<p class="message error">Error loading ratings: ${error.message}</p>`;
         }
     }


    // --- Event Listeners ---

    // Handle Edit Profile Button Click
    editProfileButton.addEventListener('click', () => {
         hideSection(receiptDisplayArea); // Hide receipt if open
         showSection(editProfileSection); // Show the form
         editProfileButton.style.display = 'none'; // Hide the edit button
         // Ensure current profile data is in the form (done in fetchUserProfile)
    });

    // Handle Cancel Edit Profile Button Click
    cancelEditProfileButton.addEventListener('click', () => {
        hideSection(editProfileSection); // Hide the form
        editProfileButton.style.display = 'inline-block'; // Show the edit button
    });

    // Handle Edit Profile Form Submission (PUT /api/users/profile)
    editProfileForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearMessage(editProfileMessageArea);

        const name = editNameInput.value;
        const phone = editPhoneInput.value;

        try {
             // Disable buttons while submitting
             editProfileForm.querySelector('button[type="submit"]').disabled = true;
             editProfileForm.querySelector('button[type="button"]').disabled = true; // Cancel button too

             const data = { name, phone };
             showMessage(editProfileMessageArea, 'Saving profile...', 'loading');

            // API Call: PUT /api/users/profile
            const response = await request('PUT', '/users/profile', data, true, 'user');

            if (response && (response.name || response.message)) { // Check for name or a success message
                 showMessage(editProfileMessageArea, 'Profile updated successfully!', 'success');
                 fetchUserProfile(); // Refresh displayed profile info
                 // Hide the form after success
                 setTimeout(() => {
                      hideSection(editProfileSection);
                      editProfileButton.style.display = 'inline-block';
                 }, 1500);

            } else {
                 throw new Error('Update failed: Invalid response');
            }

        } catch (error) {
            showMessage(editProfileMessageArea, `Profile update failed: ${error.message}`, 'error');
             console.error('Profile update failed:', error);
        } finally {
             // Re-enable buttons
             editProfileForm.querySelector('button[type="submit"]').disabled = false;
             editProfileForm.querySelector('button[type="button"]').disabled = false;
        }
    });

     // Handle Refresh Availability Button
     refreshAvailabilityButton.addEventListener('click', fetchAvailableDrivers);


    // Handle Book Ride form submission (POST /api/rides/book)
    bookRideForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearMessage(bookingMessageArea);
        bookingStatusDiv.innerHTML = ''; // Clear status

         // Basic validation (also handled by disabled button, but good check)
         if (bookRideButton.disabled) {
             showMessage(bookingAvailabilityMessageArea, 'Cannot book: No drivers available.', 'warning');
             return;
         }

        const pickupLocation = pickupLocationInput.value;
        const pickupLatitude = parseFloat(pickupLatitudeInput.value);
        const pickupLongitude = parseFloat(pickupLongitudeInput.value);
        const dropoffLocation = dropoffLocationInput.value;
        const dropoffLatitude = parseFloat(dropoffLatitudeInput.value);
        const dropoffLongitude = parseFloat(dropoffLongitudeInput.value);


        if (isNaN(pickupLatitude) || isNaN(pickupLongitude) || isNaN(dropoffLatitude) || isNaN(dropoffLongitude)) {
            showMessage(bookingMessageArea, 'Please enter valid latitude and longitude values.', 'error');
            return;
        }


        const bookingData = {
            pickupLocation,
            pickupLatitude,
            pickupLongitude,
            dropoffLocation,
            dropoffLatitude,
            dropoffLongitude
        };

        try {
            // Indicate booking is in progress
            showMessage(bookingMessageArea, 'Booking ride... Please wait.', 'loading');
            bookingStatusDiv.innerHTML = ''; // Clear previous status
            bookRideButton.disabled = true; // Disable button during submission

            // API Call: POST /api/rides/book
            const response = await request('POST', '/rides/book', bookingData, true, 'user');

            if (response && response.id) {
                showMessage(bookingMessageArea, `Ride booked successfully! Ride ID: ${response.id}. Finding driver...`, 'success');
                bookingStatusDiv.innerHTML = `
                    <h4>Ride Details:</h4>
                    <p><strong>Status:</strong> ${response.status || 'PENDING'}</p>
                    <p><strong>Pickup:</strong> ${response.pickupLocation}</p>
                    <p><strong>Dropoff:</strong> ${response.dropoffLocation}</p>
                    <p>Checking for available drivers...</p>
                `;

                // Clear the form
                bookRideForm.reset();
                 // Reset Lat/Lng inputs as well
                 pickupLatitudeInput.value = '';
                 pickupLongitudeInput.value = '';
                 dropoffLatitudeInput.value = '';
                 dropoffLongitudeInput.value = '';


                // Refresh the user's ride list to show the new booking
                setTimeout(fetchUserRides, 3000); // Delay allows backend time to process assignment

            } else {
                throw new Error('Invalid response from booking API');
            }

        } catch (error) {
            showMessage(bookingMessageArea, `Booking failed: ${error.message}`, 'error');
             console.error('Booking failed:', error);
        } finally {
             bookRideButton.disabled = false; // Re-enable button
             fetchAvailableDrivers(); // Refresh availability count
        }
    });

    // Handle refresh rides button
    refreshRidesButton.addEventListener('click', fetchUserRides);

    // Handle refresh ratings button
    refreshRatingsButton.addEventListener('click', fetchUserRatingsHistory);

    // Handle close receipt button
     closeReceiptButton.addEventListener('click', () => {
         hideSection(receiptDisplayArea);
         receiptContentDiv.innerHTML = ''; // Clear content
     });


    // Handle logout button
    logoutButton.addEventListener('click', () => {
        removeToken('user');
        window.location.href = 'index.html'; // Redirect to landing page
    });

    // --- Initial Data Load ---
    await fetchUserProfile(); // Get profile & set/confirm user ID
    if (currentUserId) { // Ensure user ID is available before fetching user-specific data
         fetchAvailableDrivers();
         fetchUserRides();
         fetchUserRatingsHistory();
    } else {
        // If user ID somehow wasn't set after fetchUserProfile, redirect
         window.location.href = 'user_login.html';
    }

});