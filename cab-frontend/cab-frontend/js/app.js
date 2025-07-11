// Main Application Module
class App {
    constructor() {
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log('Initializing Car Booking App...');
        
        // Setup authentication
        auth.init();
        
        // Check if user is already authenticated
        const isAuthenticated = auth.checkAuthStatus();
        
        if (!isAuthenticated) {
            // Show role selection screen
            this.showRoleSelection();
        }
        
        // Hide loading screen
        this.hideLoadingScreen();
        
        this.isInitialized = true;
        console.log('App initialized successfully');
    }

    showRoleSelection() {
        // Hide loading screen and show role selection
        this.hideLoadingScreen();
        document.getElementById('role-selection').style.display = 'flex';
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }
}

// Utility Functions

// Modal Management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Close modal with escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal[style*="display: block"]');
        openModals.forEach(modal => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
});

// Loading Management
function showLoading() {
    // Create loading overlay if it doesn't exist
    let loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        `;
        document.body.appendChild(loadingOverlay);
    }
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    toastContainer.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Form Validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Error Handling
function handleApiError(error) {
    console.error('API Error:', error);
    
    if (error.message.includes('401')) {
        // Unauthorized - redirect to login
        auth.logout();
        showToast('Session expired. Please login again.', 'error');
    } else if (error.message.includes('403')) {
        showToast('Access denied. Please check your permissions.', 'error');
    } else if (error.message.includes('404')) {
        showToast('Resource not found.', 'error');
    } else if (error.message.includes('500')) {
        showToast('Server error. Please try again later.', 'error');
    } else {
        showToast(error.message || 'An error occurred. Please try again.', 'error');
    }
}

// Date/Time Utilities
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Currency Formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Location Utilities
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                reject(new Error('Unable to retrieve your location.'));
            }
        );
    });
}

// Debounce Utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle Utility
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Local Storage Utilities
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}

// Create global app instance
const app = new App();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    app.init();
});

// Export utility functions globally
window.showModal = showModal;
window.closeModal = closeModal;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.validatePassword = validatePassword;
window.handleApiError = handleApiError;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.formatDateTime = formatDateTime;
window.formatCurrency = formatCurrency;
window.getCurrentLocation = getCurrentLocation;
window.debounce = debounce;
window.throttle = throttle;
window.saveToLocalStorage = saveToLocalStorage;
window.getFromLocalStorage = getFromLocalStorage;
window.removeFromLocalStorage = removeFromLocalStorage; 