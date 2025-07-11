// API Layer - Handles all backend communication
const API = {
    baseURL: 'http://localhost:8081/api',
    token: null,

    // Set JWT token for authenticated requests
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    },

    // Get stored token
    getToken() {
        if (!this.token) {
            this.token = localStorage.getItem('token');
        }
        return this.token;
    },

    // Clear token on logout
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    },

    // Get headers for API requests
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    },

    // Make API request with error handling
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            console.log(`API Request: ${options.method || 'GET'} ${url}`);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log(`API Response: ${url}`, result);
            return result;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    },

    // User Authentication
    async userRegister(userData) {
        return this.request('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async userLogin(credentials) {
        return this.request('/users/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    async getUserProfile() {
        return this.request('/users/profile');
    },

    async updateUserProfile(profileData) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    // Driver Authentication
    async driverRegister(driverData) {
        return this.request('/drivers/register', {
            method: 'POST',
            body: JSON.stringify(driverData)
        });
    },

    async driverLogin(credentials) {
        return this.request('/drivers/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    async getDriverProfile() {
        return this.request('/drivers/profile');
    },

    async updateDriverStatus(driverId, status) {
        return this.request(`/drivers/status/${driverId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    async getAvailableDrivers() {
        return this.request('/drivers/available');
    },

    // Ride Management
    async bookRide(rideData) {
        return this.request('/rides/book', {
            method: 'POST',
            body: JSON.stringify(rideData)
        });
    },

    async getRidesByUser(userId) {
        return this.request(`/rides/user/${userId}`);
    },

    async getRidesByDriver(driverId) {
        return this.request(`/rides/driver/${driverId}`);
    },

    async updateRideStatus(rideId, status) {
        return this.request(`/rides/status/${rideId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    // Payment Management
    async processPayment(paymentData) {
        return this.request('/payments/process', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    },

    async getPaymentReceipt(rideId) {
        return this.request(`/payments/receipt/${rideId}`);
    },

    // Rating Management
    async createRating(data) {
        return this.request('/ratings', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async getRatingsByUser(userId) {
        return this.request(`/ratings/user/${userId}`);
    },

    async getRatingsByDriver(driverId) {
        return this.request(`/ratings/driver/${driverId}`);
    }
};

// Make API available globally
window.api = API;