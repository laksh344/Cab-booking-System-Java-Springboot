// Authentication Module - Handles login, registration, and session management
class Auth {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.isAuthenticated = false;
    }

    // Initialize auth module
    init() {
        this.checkAuthStatus();
    }

    // Check if user is authenticated and redirect accordingly
    checkAuthStatus() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const role = localStorage.getItem('role');

        if (token && user && role) {
            try {
                this.currentUser = JSON.parse(user);
                this.currentRole = role;
                this.isAuthenticated = true;
                api.setToken(token);

                // Redirect to appropriate dashboard if on login/register pages
                const currentPage = window.location.pathname.split('/').pop();
                if (currentPage === 'index.html' || currentPage === '') {
                    if (role === 'user') {
                        window.location.href = 'user_dashboard.html';
                    } else if (role === 'driver') {
                        window.location.href = 'driver_dashboard.html';
                    }
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.logout();
            }
        }
    }

    // User registration
    async registerUser(userData) {
        try {
            const response = await api.userRegister(userData);
            showToast('User registered successfully! Please login.', 'success');
            return response;
        } catch (error) {
            showToast(error.message || 'Registration failed', 'error');
            throw error;
        }
    }

    // User login
    async loginUser(credentials) {
        try {
            const response = await api.userLogin(credentials);
            
            if (!response || !response.token) {
                throw new Error('Invalid login response');
            }

            // Set token and get user profile
            api.setToken(response.token);
            const userProfile = await api.getUserProfile();
            
            // Store session data
            this.setSession(response.token, userProfile, 'user');
            
            showToast('Login successful!', 'success');
            window.location.href = 'user_dashboard.html';
            
        } catch (error) {
            showToast(error.message || 'Login failed', 'error');
            throw error;
        }
    }

    // Driver registration
    async registerDriver(driverData) {
        try {
            const response = await api.driverRegister(driverData);
            showToast('Driver registered successfully! Please login.', 'success');
            return response;
        } catch (error) {
            showToast(error.message || 'Registration failed', 'error');
            throw error;
        }
    }

    // Driver login
    async loginDriver(credentials) {
        try {
            const response = await api.driverLogin(credentials);
            
            if (!response || !response.token) {
                throw new Error('Invalid login response');
            }

            // Set token and get driver profile
            api.setToken(response.token);
            const driverProfile = await api.getDriverProfile();
            
            // Store session data
            this.setSession(response.token, driverProfile, 'driver');
            
            showToast('Login successful!', 'success');
            window.location.href = 'driver_dashboard.html';
            
        } catch (error) {
            showToast(error.message || 'Login failed', 'error');
            throw error;
        }
    }

    // Set session data
    setSession(token, user, role) {
        this.currentUser = user;
        this.currentRole = role;
        this.isAuthenticated = true;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('role', role);
        
        console.log(`Session set for ${role}:`, user.name);
    }

    // Clear session and logout
    logout() {
        this.currentUser = null;
        this.currentRole = null;
        this.isAuthenticated = false;
        
        api.clearToken();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        
        showToast('Logged out successfully', 'success');
        window.location.href = 'index.html';
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get current role
    getCurrentRole() {
        return this.currentRole;
    }

    // Check if authenticated
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.currentRole === role;
    }
}

// Create global auth instance
const auth = new Auth();

// Global functions for HTML onclick handlers
window.showUserAuth = function() {
    hideAllAuthContainers();
    document.getElementById('user-auth').style.display = 'flex';
};

window.showDriverAuth = function() {
    hideAllAuthContainers();
    document.getElementById('driver-auth').style.display = 'flex';
};

window.showRoleSelection = function() {
    hideAllAuthContainers();
    document.getElementById('role-selection').style.display = 'flex';
};

window.switchTab = function(tabId) {
    // Remove active class from all tabs and forms
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    // Add active class to clicked tab
    const clickedTab = document.querySelector(`[onclick="switchTab('${tabId}')"]`);
    if (clickedTab) {
        clickedTab.classList.add('active');
    }
    
    // Show corresponding form
    const form = document.getElementById(tabId);
    if (form) {
        form.classList.add('active');
    }
};

window.logout = function() {
    auth.logout();
};

function hideAllAuthContainers() {
    const containers = ['role-selection', 'user-auth', 'driver-auth'];
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.style.display = 'none';
        }
    });
}

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    auth.init();
});

// Make auth available globally
window.auth = auth; 
window.auth = auth; 