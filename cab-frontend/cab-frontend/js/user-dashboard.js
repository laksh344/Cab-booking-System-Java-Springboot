// User Dashboard Module
class UserDashboard {
    constructor() {
        this.currentUser = null;
        this.currentRide = null;
        this.rideHistory = [];
        this.selectedRating = 0;
        this.pendingRideForRating = null;
    }

    // Initialize dashboard
    async init() {
        try {
            // Ensure JWT token is set from localStorage on page load
            const token = localStorage.getItem('token');
            if (token) api.setToken(token);
            this.currentUser = auth.getCurrentUser();
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }
            this.setupEventListeners();
            await this.loadProfile();
            await this.loadRideHistory();
            this.setupRatingStars();
            
            console.log('User dashboard initialized for:', this.currentUser.name);
        } catch (error) {
            console.error('Error initializing user dashboard:', error);
            showToast('Failed to initialize dashboard', 'error');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Book ride form
        const bookRideForm = document.getElementById('book-ride-form');
        if (bookRideForm) {
            bookRideForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBookRide();
            });
        }

        // Edit profile form
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditProfile();
            });
        }

        // Refresh rides button
        const refreshRidesBtn = document.getElementById('refreshRides');
        if (refreshRidesBtn) {
            refreshRidesBtn.addEventListener('click', () => {
                this.loadRideHistory();
            });
        }

        // Refresh ratings button
        const refreshRatingsBtn = document.getElementById('refreshRatings');
        if (refreshRatingsBtn) {
            refreshRatingsBtn.addEventListener('click', () => {
                this.loadRatings();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutButton');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Edit profile button
        const editProfileBtn = document.getElementById('editProfileButton');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.showEditProfileForm();
            });
        }

        // Cancel edit profile button
        const cancelEditBtn = document.getElementById('cancelEditProfile');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                this.hideEditProfileForm();
            });
        }

        // Close receipt button
        const closeReceiptBtn = document.getElementById('closeReceipt');
        if (closeReceiptBtn) {
            closeReceiptBtn.addEventListener('click', () => {
                this.hideReceiptDisplay();
            });
        }

        // Payment form (will be added dynamically)
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'payment-form') {
                e.preventDefault();
                this.processPayment();
            }
        });

        // Rating form (will be added dynamically)
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'rating-form') {
                e.preventDefault();
                this.submitRating();
            }
        });

        // Rating stars
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('star') || e.target.closest('.star')) {
                const starsContainer = e.target.closest('.star-container');
                const stars = starsContainer.querySelectorAll('.star');
                const clickedStar = e.target.closest('.star');
                
                if (clickedStar) {
                    const rating = parseInt(clickedStar.dataset.rating);
                    
                    // Update visual state
                    stars.forEach((star, index) => {
                        star.classList.toggle('filled', index < rating);
                    });
                    
                    // Store rating in global variable for form submission
                    this.selectedRating = rating;
                }
            }
        });
    }

    // Load user profile
    async loadProfile() {
        try {
            const profile = await api.getUserProfile();
            this.displayProfile(profile);
        } catch (error) {
            console.error('Error loading profile:', error);
            showToast('Failed to load profile', 'error');
        }
    }

    // Display profile information
    displayProfile(profile) {
        document.getElementById('user-name').textContent = profile.name;
        document.getElementById('profile-name').textContent = profile.name;
        document.getElementById('profile-email').textContent = profile.email;
        document.getElementById('profile-phone').textContent = profile.phone;
    }

    // Handle ride booking
    async handleBookRide() {
        const pickupLocation = document.getElementById('pickup-location').value;
        const dropoffLocation = document.getElementById('dropoff-location').value;
        const peakHour = document.getElementById('peak-hour-checkbox').checked;

        if (!pickupLocation || !dropoffLocation) {
            showToast('Please enter pickup and dropoff locations', 'error');
            return;
        }

        try {
            showLoading();
            // Check for available drivers
            const availableDrivers = await api.getAvailableDrivers();
            if (availableDrivers.length === 0) {
                showToast('No drivers available at the moment', 'error');
                return;
            }
            // Convert addresses to coordinates
            const pickupCoords = this.convertAddressToCoordinates(pickupLocation);
            const dropoffCoords = this.convertAddressToCoordinates(dropoffLocation);
            // Book the ride
            const rideData = {
                pickupLocation: pickupCoords,
                dropoffLocation: dropoffCoords,
                peakHour: peakHour
            };
            const newRide = await api.bookRide(rideData);
            this.currentRide = newRide;
            showToast('Ride booked successfully!', 'success');
            this.displayCurrentRide(newRide);
            this.loadRideHistory();
            // Clear form
            document.getElementById('book-ride-form').reset();
        } catch (error) {
            console.error('Error booking ride:', error);
            showToast(error.message || 'Failed to book ride', 'error');
        } finally {
            hideLoading();
        }
    }

    // Convert address to coordinates (improved)
    convertAddressToCoordinates(address) {
        // Improved mapping for common addresses
        const addressMap = {
            'airport': '77.7101,12.9762',
            'railway station': '77.5946,12.9716',
            'bus stand': '77.5806,12.9718',
            'mall': '77.6101,12.9352',
            'hospital': '77.6201,12.9500',
            'school': '77.6301,12.9600',
            'college': '77.6401,12.9700',
            'university': '77.6501,12.9800',
            'office': '77.6601,12.9900',
            'home': '77.6701,13.0000',
            'hotel': '77.6801,13.0100',
            'restaurant': '77.6901,13.0200',
            'market': '77.7001,13.0300',
            'park': '77.7101,13.0400',
            'gym': '77.7201,13.0500',
            'bank': '77.7301,13.0600',
            'post office': '77.7401,13.0700',
            'police station': '77.7501,13.0800',
            'fire station': '77.7601,13.0900',
            'gas station': '77.7701,13.1000'
        };
        const lowerAddress = address.toLowerCase();
        for (const [key, coords] of Object.entries(addressMap)) {
            if (lowerAddress.includes(key)) {
                return coords;
            }
        }
        // Default coordinates for Bangalore (lng,lat)
        return '77.5946,12.9716';
    }

    // Display current ride
    displayCurrentRide(ride) {
        const currentRideSection = document.getElementById('current-ride-section');
        const currentRideInfo = document.getElementById('current-ride-info');
        
        currentRideInfo.innerHTML = `
            <div class="ride-details">
                <div class="ride-item">
                    <label>Ride ID:</label>
                    <span>${ride.rideId || ride.id}</span>
                </div>
                <div class="ride-item">
                    <label>Status:</label>
                    <span class="status-badge status-${ride.status.toLowerCase()}">${ride.status}</span>
                </div>
                <div class="ride-item">
                    <label>Pickup:</label>
                    <span>${ride.pickupLocation}</span>
                </div>
                <div class="ride-item">
                    <label>Dropoff:</label>
                    <span>${ride.dropoffLocation}</span>
                </div>
                <div class="ride-item">
                    <label>Fare:</label>
                    <span>₹${ride.fare || 'Calculating...'}</span>
                </div>
                ${ride.driver ? `
                    <div class="ride-item">
                        <label>Driver:</label>
                        <span>${ride.driver.name}</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        currentRideSection.style.display = 'block';
    }

    // Load ride history
    async loadRideHistory() {
        try {
            const userId = this.currentUser.userId || this.currentUser.id;
            if (!userId) {
                console.error('User ID not found');
                return;
            }

            const rides = await api.getRidesByUser(userId);
            this.rideHistory = rides;
            this.displayRideHistory(rides);
        } catch (error) {
            console.error('Error loading ride history:', error);
            showToast('Failed to load ride history', 'error');
        }
    }

    // Display ride history
    displayRideHistory(rides) {
        const rideHistoryList = document.getElementById('ride-history-list');
        
        if (rides.length === 0) {
            rideHistoryList.innerHTML = '<p class="no-rides">No ride history found.</p>';
            return;
        }

        rideHistoryList.innerHTML = rides.map(ride => `
            <div class="ride-card">
                <div class="ride-header">
                    <h4>Ride #${ride.rideId || ride.id}</h4>
                    <span class="status-badge status-${ride.status.toLowerCase()}">${ride.status}</span>
                </div>
                <div class="ride-details">
                    <div class="ride-detail">
                        <label>Date:</label>
                        <span>${new Date(ride.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="ride-detail">
                        <label>Time:</label>
                        <span>${new Date(ride.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div class="ride-detail">
                        <label>Pickup:</label>
                        <span>${ride.pickupLocation}</span>
                    </div>
                    <div class="ride-detail">
                        <label>Dropoff:</label>
                        <span>${ride.dropoffLocation}</span>
                    </div>
                    <div class="ride-detail">
                        <label>Fare:</label>
                        <span>₹${ride.fare || 'N/A'}</span>
                    </div>
                    ${ride.driver ? `
                        <div class="ride-detail">
                            <label>Driver:</label>
                            <span>${ride.driver.name}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="ride-actions">
                    ${(ride.status === 'REQUESTED' || ride.status === 'IN_PROGRESS') ? `
                        <button onclick="userDashboard.cancelRide(${ride.rideId || ride.id}, ${ride.driver ? (ride.driver.driverId || ride.driver.id) : null})" class="btn btn-danger">
                            <i class='fas fa-times'></i> Cancel
                        </button>
                        <button onclick="userDashboard.showPaymentModal(${ride.rideId || ride.id}, ${ride.fare})" class="btn btn-primary">
                            <i class='fas fa-credit-card'></i> Payment
                        </button>
                    ` : ''}
                    ${ride.status === 'COMPLETED' ? `
                        <button onclick="userDashboard.downloadReceipt(${ride.rideId || ride.id})" class="btn btn-outline"><i class="fas fa-download"></i> Receipt</button>
                        ${ride.rating ? `<div class="rating-display"><span>Your Rating: ${'★'.repeat(ride.rating.score)}${'☆'.repeat(5 - ride.rating.score)}</span></div>` : ''}
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Show payment modal
    showPaymentModal(rideId, amount) {
        this.pendingRideForRating = rideId;
        document.getElementById('payment-ride-id').textContent = rideId;
        document.getElementById('payment-amount').textContent = `₹${amount}`;
        document.getElementById('payment-modal').style.display = 'block';
    }

    // Process payment, complete ride, set driver available, then show rating modal
    async processPayment() {
        const rideId = this.pendingRideForRating;
        const amount = document.getElementById('payment-amount').textContent.replace('₹', '');
        const paymentMethod = document.getElementById('payment-method').value;
        try {
            showLoading();
            // 1. Process payment
            const paymentData = {
                rideId: rideId,
                amount: parseFloat(amount),
                paymentMethod: paymentMethod
            };
            await api.processPayment(paymentData);
            // 2. Set ride status to COMPLETED (ensure this is successful before rating)
            await api.updateRideStatus(rideId, 'COMPLETED');
            // 3. Set driver status to AVAILABLE (find driverId from ride)
            const ride = this.rideHistory.find(r => (r.rideId || r.id) == rideId);
            if (ride && ride.driver) {
                const driverId = ride.driver.driverId || ride.driver.id;
                if (driverId) {
                    await api.updateDriverStatus(driverId, 'AVAILABLE');
                }
            }
            showToast('Payment successful! Please rate your ride.', 'success');
            closePaymentModal();
            // 4. Show rating modal
            this.showRatingModal(rideId);
            // 5. Refresh ride history
            await this.loadRideHistory();
        } catch (error) {
            if (error.message && error.message.includes('403')) {
                showToast('Session expired or not authorized. Please log in as a user again.', 'error');
                setTimeout(() => { auth.logout(); }, 2000);
            } else {
                showToast(error.message || 'Payment failed', 'error');
            }
        } finally {
            hideLoading();
        }
    }

    // Show rating modal
    showRatingModal(rideId) {
        this.pendingRideForRating = rideId;
        this.selectedRating = 0;
        this.resetRatingStars();
        document.getElementById('rating-modal').style.display = 'block';
    }

    // Setup rating stars
    setupRatingStars() {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.selectedRating = rating;
                this.updateRatingStars(rating);
            });
        });
    }

    // Update rating stars display
    updateRatingStars(rating) {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.textContent = '★';
                star.style.color = '#ffd700';
            } else {
                star.textContent = '☆';
                star.style.color = '#ccc';
            }
        });
    }

    // Reset rating stars
    resetRatingStars() {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.textContent = '☆';
            star.style.color = '#ccc';
        });
    }

    // Submit rating and refresh both dashboards
    async submitRating() {
        if (this.selectedRating === 0) {
            showToast('Please select a rating', 'error');
            return;
        }
        const comments = document.getElementById('rating-comments').value;
        const rideId = this.pendingRideForRating;
        try {
            showLoading();
            const ratingData = {
                rideId: rideId,
                score: this.selectedRating,
                comments: comments
            };
            await api.createRating(ratingData);
            showToast('Rating submitted successfully!', 'success');
            closeRatingModal();
            await this.loadRideHistory();
            // Notify driver dashboard to refresh ratings if open
            if (window.localStorage) {
                localStorage.setItem('driver_ratings_refresh', Date.now().toString());
            }
            // Prompt user to view/download receipt after rating
            setTimeout(() => {
                this.showPaymentReceipt(rideId);
            }, 500);
        } catch (error) {
            if (error.message && error.message.includes('403')) {
                showToast('Session expired or not authorized. Please log in as a user again.', 'error');
                setTimeout(() => { auth.logout(); }, 2000);
            } else if (error.message && error.message.includes('COMPLETED')) {
                showToast('You can only rate completed rides. Please complete payment first.', 'error');
            } else {
                showToast(error.message || 'Failed to submit rating', 'error');
            }
        } finally {
            hideLoading();
        }
    }

    async handleEditProfile() {
        const name = document.getElementById('edit-name').value;
        const phone = document.getElementById('edit-phone').value;

        try {
            showLoading();
            
            await api.updateUserProfile({ name, phone });
            
            showToast('Profile updated successfully!', 'success');
            closeModal('edit-profile-modal');
            
            // Reload profile
            await this.loadProfile();
            
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast(error.message || 'Failed to update profile', 'error');
        } finally {
            hideLoading();
        }
    }

    async showPaymentReceipt(rideId) {
        try {
            showLoading();
            const receipt = await api.getPaymentReceipt(rideId);
            this.displayPaymentReceipt(receipt);
        } catch (error) {
            console.error('Error showing receipt:', error);
            showToast('Failed to load receipt', 'error');
        } finally {
            hideLoading();
        }
    }

    displayPaymentReceipt(receipt) {
        const receiptModal = document.createElement('div');
        receiptModal.className = 'modal';
        receiptModal.id = 'receipt-modal';
        receiptModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Payment Receipt</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="receipt-content" style="padding: 30px;">
                    <div class="receipt-header">
                        <h4>Car Booking App Receipt</h4>
                        <p>Receipt #${receipt.id}</p>
                        <p>Date: ${new Date(receipt.timestamp).toLocaleString()}</p>
                    </div>
                    <div class="receipt-details">
                        <div class="receipt-row">
                            <span>Ride ID:</span>
                            <span>#${receipt.ride.id}</span>
                        </div>
                        <div class="receipt-row">
                            <span>Amount:</span>
                            <span>₹${receipt.amount}</span>
                        </div>
                        <div class="receipt-row">
                            <span>Payment Method:</span>
                            <span>${receipt.method}</span>
                        </div>
                        <div class="receipt-row">
                            <span>Status:</span>
                            <span class="payment-status-${receipt.status.toLowerCase()}">${receipt.status}</span>
                        </div>
                        <div class="receipt-row">
                            <span>Pickup:</span>
                            <span>${receipt.ride.pickupLocation}</span>
                        </div>
                        <div class="receipt-row">
                            <span>Dropoff:</span>
                            <span>${receipt.ride.dropoffLocation}</span>
                        </div>
                    </div>
                    <div class="receipt-footer">
                        <p>Thank you for using Car Booking App!</p>
                        <button class="btn btn-primary" onclick="window.print()">
                            <i class="fas fa-print"></i> Print Receipt
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(receiptModal);
        receiptModal.style.display = 'block';
        // Add close event
        const closeBtn = receiptModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(receiptModal);
            });
        }
    }

    // Helper functions
    showEditProfileForm() {
        const editSection = document.getElementById('editProfileSection');
        if (editSection) {
            editSection.classList.add('visible');
            
            // Populate form with current data
            const editName = document.getElementById('editName');
            const editPhone = document.getElementById('editPhone');
            
            if (this.currentUser && editName && editPhone) {
                editName.value = this.currentUser.name;
                editPhone.value = this.currentUser.phone;
            }
        }
    }

    hideEditProfileForm() {
        const editSection = document.getElementById('editProfileSection');
        if (editSection) {
            editSection.classList.remove('visible');
        }
    }

    hideReceiptDisplay() {
        const receiptArea = document.getElementById('receiptDisplayArea');
        if (receiptArea) {
            receiptArea.classList.remove('visible');
        }
    }

    async loadRatings() {
        try {
            if (!this.currentUser) return;
            
            const userId = this.currentUser.userId || this.currentUser.id;
            if (!userId) {
                console.error('User ID not found for ratings');
                return;
            }
            
            const ratings = await api.getRatingsByUser(userId);
            this.displayRatings(ratings);
        } catch (error) {
            console.error('Error loading ratings:', error);
            showToast('Failed to load ratings', 'error');
        }
    }

    displayRatings(ratings) {
        const ratingsContainer = document.getElementById('userRatingsList');
        if (!ratingsContainer) return;

        if (ratings.length === 0) {
            ratingsContainer.innerHTML = '<p class="text-center">No ratings found.</p>';
            return;
        }

        ratingsContainer.innerHTML = ratings.map(rating => `
            <div class="rating-item">
                <div class="rating-header">
                    <h4>Ride #${rating.ride.rideId || rating.ride.id}</h4>
                    <div class="rating-stars-display">
                        ${'★'.repeat(rating.score)}${'☆'.repeat(5 - rating.score)}
                    </div>
                </div>
                <div class="rating-details">
                    <p><strong>Comments:</strong> ${rating.comments || 'No comments'}</p>
                    <p><strong>Date:</strong> ${rating.timestamp ? new Date(rating.timestamp).toLocaleString() : 'N/A'}</p>
                </div>
            </div>
        `).join('');
    }

    logout() {
        if (window.auth) {
            window.auth.logout();
        } else {
            // Fallback logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
            window.location.href = 'index.html';
        }
    }

    // Global functions for HTML onclick handlers
    showBookRideModal() {
        showModal('book-ride-modal');
    }

    showEditProfileModal() {
        const editName = document.getElementById('edit-name');
        const editPhone = document.getElementById('edit-phone');
        
        if (this.currentUser) {
            editName.value = this.currentUser.name;
            editPhone.value = this.currentUser.phone;
        }
        
        showModal('edit-profile-modal');
    }

    // Cancel ride and set driver available
    async cancelRide(rideId, driverId) {
        if (!confirm('Are you sure you want to cancel this ride?')) return;
        try {
            showLoading();
            await api.updateRideStatus(rideId, 'CANCELLED');
            if (driverId) {
                await api.updateDriverStatus(driverId, 'AVAILABLE');
            }
            showToast('Ride cancelled and driver is now available.', 'success');
            await this.loadRideHistory();
        } catch (error) {
            showToast(error.message || 'Failed to cancel ride', 'error');
        } finally {
            hideLoading();
        }
    }

    // Download payment receipt
    async downloadReceipt(rideId) {
        try {
            showLoading();
            const receipt = await api.getPaymentReceipt(rideId);
            // Download as JSON and also offer print
            const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt_ride_${rideId}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Receipt downloaded!', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to download receipt', 'error');
        } finally {
            hideLoading();
        }
    }
}

// Create global user dashboard instance
const userDashboard = new UserDashboard();

// Global functions for HTML onclick handlers
window.showBookRideModal = function() {
    userDashboard.showBookRideModal();
};

window.showEditProfileModal = function() {
    userDashboard.showEditProfileModal();
};

window.confirmRide = function() {
    userDashboard.confirmRide();
};

// Make userDashboard available globally
window.userDashboard = userDashboard;
// Expose payment and rating handlers globally for modal buttons
window.processPayment = () => userDashboard.processPayment();
window.submitRating = () => userDashboard.submitRating(); 