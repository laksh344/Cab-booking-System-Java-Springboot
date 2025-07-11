// Driver Dashboard Module
class DriverDashboard {
    constructor() {
        this.currentDriver = null;
        this.currentRide = null;
        this.rideHistory = [];
        this.ratings = [];
        this.isAvailable = false;
    }

    // Initialize dashboard
    async init() {
        try {
            this.currentDriver = auth.getCurrentUser();
            if (!this.currentDriver) {
                throw new Error('Driver not authenticated');
            }

            this.setupEventListeners();
            await this.loadProfile();
            await this.loadRideHistory();
            await this.loadRatings();
            this.updateStatusDisplay();
            
            console.log('Driver dashboard initialized for:', this.currentDriver.name);
        } catch (error) {
            console.error('Error initializing driver dashboard:', error);
            showToast('Failed to initialize dashboard', 'error');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Status toggle buttons
        const statusAvailableBtn = document.getElementById('status-available');
        const statusUnavailableBtn = document.getElementById('status-unavailable');
        
        if (statusAvailableBtn) {
            statusAvailableBtn.addEventListener('click', () => {
                this.updateStatus(true);
            });
        }
        
        if (statusUnavailableBtn) {
            statusUnavailableBtn.addEventListener('click', () => {
                this.updateStatus(false);
            });
        }
    }

    // Load driver profile
    async loadProfile() {
        try {
            const profile = await api.getDriverProfile();
            this.currentDriver = profile;
            this.displayProfile(profile);
        } catch (error) {
            console.error('Error loading profile:', error);
            showToast('Failed to load profile', 'error');
        }
    }

    // Display profile information
    displayProfile(profile) {
        document.getElementById('driver-name').textContent = profile.name;
        document.getElementById('profile-name').textContent = profile.name;
        document.getElementById('profile-email').textContent = profile.email;
        document.getElementById('profile-phone').textContent = profile.phone;
        document.getElementById('profile-license').textContent = profile.licenseNumber;
        document.getElementById('profile-vehicle').textContent = profile.vehicleDetails;
        
        const statusElement = document.getElementById('profile-status');
        statusElement.textContent = profile.status;
        statusElement.className = `status-badge status-${profile.status.toLowerCase()}`;
        
        this.isAvailable = profile.status === 'AVAILABLE';
        this.updateStatusDisplay();
    }

    // Update driver status
    async updateStatus(isAvailable) {
        try {
            showLoading();
            
            const driverId = this.currentDriver.driverId || this.currentDriver.id;
            if (!driverId) {
                throw new Error('Driver ID not found');
            }

            const status = isAvailable ? 'AVAILABLE' : 'UNAVAILABLE';
            await api.updateDriverStatus(driverId, status);
            
            // Update local state
            this.currentDriver.status = status;
            this.isAvailable = isAvailable;
            
            // Update display
            this.displayProfile(this.currentDriver);
            this.updateStatusDisplay();
            
            showToast(`Status updated to ${status}`, 'success');
            
            // Load ride requests if available
            if (isAvailable) {
                await this.loadRideRequests();
            } else {
                this.hideRideRequests();
            }
            
        } catch (error) {
            console.error('Error updating status:', error);
            showToast(error.message || 'Failed to update status', 'error');
        } finally {
            hideLoading();
        }
    }

    // Update status display
    updateStatusDisplay() {
        const statusMessage = document.getElementById('status-message');
        if (statusMessage) {
            if (this.isAvailable) {
                statusMessage.textContent = 'You are currently available for rides';
                statusMessage.className = 'status-message available';
            } else {
                statusMessage.textContent = 'You are currently unavailable for rides';
                statusMessage.className = 'status-message unavailable';
            }
        }
    }

    // Load ride requests (only for available drivers)
    async loadRideRequests() {
        if (!this.isAvailable) {
            this.hideRideRequests();
            return;
        }

        try {
            const driverId = this.currentDriver.driverId || this.currentDriver.id;
            if (!driverId) {
                console.error('Driver ID not found');
                return;
            }

            const rides = await api.getRidesByDriver(driverId);
            const requestedRides = rides.filter(ride => ride.status === 'REQUESTED');
            
            this.displayRideRequests(requestedRides);
            
            // Show/hide requests section
            const requestsSection = document.getElementById('ride-requests-section');
            if (requestsSection) {
                requestsSection.style.display = requestedRides.length > 0 ? 'block' : 'none';
            }
        } catch (error) {
            console.error('Error loading ride requests:', error);
            showToast('Failed to load ride requests', 'error');
        }
    }

    // Hide ride requests section
    hideRideRequests() {
        const requestsSection = document.getElementById('ride-requests-section');
        if (requestsSection) {
            requestsSection.style.display = 'none';
        }
    }

    // Display ride requests
    displayRideRequests(requests) {
        const requestsList = document.getElementById('ride-requests-list');
        
        if (requests.length === 0) {
            requestsList.innerHTML = '<p class="no-requests">No incoming ride requests.</p>';
            return;
        }

        requestsList.innerHTML = requests.map(ride => `
            <div class="ride-request-card">
                <div class="request-header">
                    <h4>Ride Request #${ride.rideId || ride.id}</h4>
                    <span class="request-time">${new Date(ride.createdAt).toLocaleTimeString()}</span>
                </div>
                <div class="request-details">
                    <div class="request-detail">
                        <label>Pickup:</label>
                        <span>${ride.pickupLocation}</span>
                    </div>
                    <div class="request-detail">
                        <label>Dropoff:</label>
                        <span>${ride.dropoffLocation}</span>
                    </div>
                    <div class="request-detail">
                        <label>Fare:</label>
                        <span>₹${ride.fare || 'Calculating...'}</span>
                    </div>
                    ${ride.user ? `
                        <div class="request-detail">
                            <label>User:</label>
                            <span>${ride.user.name}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="request-actions">
                    <button onclick="driverDashboard.acceptRide(${ride.rideId || ride.id})" class="btn btn-success">
                        <i class="fas fa-check"></i> Accept
                    </button>
                    <button onclick="driverDashboard.rejectRide(${ride.rideId || ride.id})" class="btn btn-danger">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Accept ride
    async acceptRide(rideId) {
        try {
            showLoading();
            
            await api.updateRideStatus(rideId, 'ACCEPTED');
            showToast('Ride accepted successfully!', 'success');
            
            // Refresh ride history and requests
            await this.loadRideHistory();
            await this.loadRideRequests();
            
        } catch (error) {
            console.error('Error accepting ride:', error);
            showToast(error.message || 'Failed to accept ride', 'error');
        } finally {
            hideLoading();
        }
    }

    // Reject ride
    async rejectRide(rideId) {
        if (confirm('Are you sure you want to reject this ride?')) {
            try {
                showLoading();
                
                await api.updateRideStatus(rideId, 'CANCELLED');
                showToast('Ride rejected successfully', 'success');
                
                // Refresh ride history and requests
                await this.loadRideHistory();
                await this.loadRideRequests();
                
            } catch (error) {
                console.error('Error rejecting ride:', error);
                showToast(error.message || 'Failed to reject ride', 'error');
            } finally {
                hideLoading();
            }
        }
    }

    // Start ride
    async startRide(rideId) {
        try {
            showLoading();
            
            await api.updateRideStatus(rideId, 'IN_PROGRESS');
            showToast('Ride started successfully!', 'success');
            
            // Refresh ride history
            await this.loadRideHistory();
            
        } catch (error) {
            console.error('Error starting ride:', error);
            showToast(error.message || 'Failed to start ride', 'error');
        } finally {
            hideLoading();
        }
    }

    // Complete ride
    async completeRide(rideId) {
        try {
            showLoading();
            
            await api.updateRideStatus(rideId, 'COMPLETED');
            showToast('Ride completed successfully!', 'success');
            
            // Refresh ride history
            await this.loadRideHistory();
            
        } catch (error) {
            console.error('Error completing ride:', error);
            showToast(error.message || 'Failed to complete ride', 'error');
        } finally {
            hideLoading();
        }
    }

    // Load ride history
    async loadRideHistory() {
        try {
            const driverId = this.currentDriver.driverId || this.currentDriver.id;
            if (!driverId) {
                console.error('Driver ID not found');
                return;
            }

            const rides = await api.getRidesByDriver(driverId);
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
                    ${ride.user ? `
                        <div class="ride-detail">
                            <label>User:</label>
                            <span>${ride.user.name}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="ride-actions">
                    ${(ride.status === 'IN_PROGRESS' || ride.status === 'ACCEPTED' || ride.status === 'ONRIDE') ? `
                        <button onclick="driverDashboard.completeRideAndSetAvailable(${ride.rideId || ride.id})" class="btn btn-success">
                            <i class='fas fa-check'></i> Completed
                        </button>
                    ` : ''}
                    ${ride.status === 'COMPLETED' && ride.rating ? `
                        <div class="rating-display">
                            <span>User Rating: ${'★'.repeat(ride.rating.score)}${'☆'.repeat(5 - ride.rating.score)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Complete ride and set driver available
    async completeRideAndSetAvailable(rideId) {
        try {
            showLoading();
            // Complete the ride
            await api.updateRideStatus(rideId, 'COMPLETED');
            // Set driver available
            const driverId = this.currentDriver.driverId || this.currentDriver.id;
            await api.updateDriverStatus(driverId, 'AVAILABLE');
            this.currentDriver.status = 'AVAILABLE';
            this.isAvailable = true;
            showToast('Ride marked as completed and you are now available!', 'success');
            await this.loadRideHistory();
            this.updateStatusDisplay();
        } catch (error) {
            showToast(error.message || 'Failed to complete ride', 'error');
        } finally {
            hideLoading();
        }
    }

    // Load ratings
    async loadRatings() {
        try {
            const driverId = this.currentDriver.driverId || this.currentDriver.id;
            if (!driverId) {
                console.error('Driver ID not found');
                return;
            }

            const ratings = await api.getRatingsByDriver(driverId);
            this.ratings = ratings;
            this.displayRatings(ratings);
        } catch (error) {
            console.error('Error loading ratings:', error);
            showToast('Failed to load ratings', 'error');
        }
    }

    // Display ratings
    displayRatings(ratings) {
        const ratingsList = document.getElementById('ratings-list');
        
        if (ratings.length === 0) {
            ratingsList.innerHTML = '<p class="no-ratings">No ratings found.</p>';
            return;
        }

        ratingsList.innerHTML = ratings.map(rating => `
            <div class="rating-card">
                <div class="rating-header">
                    <h4>Ride #${rating.ride.rideId || rating.ride.id}</h4>
                    <div class="rating-stars">
                        ${'★'.repeat(rating.score)}${'☆'.repeat(5 - rating.score)}
                    </div>
                </div>
                <div class="rating-details">
                    <div class="rating-detail">
                        <label>Date:</label>
                        <span>${rating.timestamp ? new Date(rating.timestamp).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div class="rating-detail">
                        <label>Comments:</label>
                        <span>${rating.comments || 'No comments'}</span>
                    </div>
                    ${rating.ride.user ? `
                        <div class="rating-detail">
                            <label>User:</label>
                            <span>${rating.ride.user.name}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
}

// Create global driver dashboard instance
const driverDashboard = new DriverDashboard();

// Make driverDashboard available globally
window.driverDashboard = driverDashboard;

// Listen for rating refresh events from other tabs/windows
window.addEventListener('storage', function(event) {
    if (event.key === 'driver_ratings_refresh') {
        if (window.driverDashboard && typeof window.driverDashboard.loadRatings === 'function') {
            window.driverDashboard.loadRatings();
        }
    }
}); 