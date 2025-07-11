# Car Booking App Frontend

A modern, responsive web application for car booking services built with HTML, CSS, and JavaScript.

## Features

### 🔐 Authentication
- **User Registration & Login**: Complete user account management
- **Driver Registration & Login**: Driver account management with vehicle details
- **JWT Token Management**: Secure authentication with token-based sessions
- **Role-based Access**: Separate interfaces for users and drivers

### 👤 User Dashboard
- **Profile Management**: View and edit user profile information
- **Ride Booking**: Book rides with pickup and dropoff locations
- **Fare Calculation**: Real-time fare estimation with peak hour pricing
- **Ride History**: View all past rides with status tracking
- **Payment Processing**: Multiple payment methods (Cash, Card, UPI)
- **Rating System**: Rate drivers after completed rides
- **Receipt Generation**: View and print payment receipts

### 🚗 Driver Dashboard
- **Profile Management**: View driver profile and vehicle information
- **Status Toggle**: Switch between Available/Unavailable status
- **Ride Requests**: View and manage incoming ride requests
- **Ride Management**: Start, complete, or reject rides
- **Ride History**: Track all completed rides and earnings
- **Real-time Updates**: Live status updates for ride requests

### 🎨 User Interface
- **Modern Design**: Clean, intuitive interface with gradient backgrounds
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Loading States**: Smooth loading animations and transitions
- **Toast Notifications**: Real-time feedback for user actions
- **Modal Dialogs**: Clean modal interfaces for forms and confirmations

## File Structure

```
cab-frontend/
├── index.html              # Main application entry point
├── styles.css              # Complete CSS styling
├── js/
│   ├── api.js              # API communication module
│   ├── auth.js             # Authentication management
│   ├── user-dashboard.js   # User dashboard functionality
│   ├── driver-dashboard.js # Driver dashboard functionality
│   └── app.js              # Main application logic
└── README.md               # This file
```

## API Integration

The frontend integrates with the following backend endpoints:

### User Endpoints
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Driver Endpoints
- `POST /api/drivers/register` - Driver registration
- `POST /api/drivers/login` - Driver login
- `GET /api/drivers/profile` - Get driver profile
- `PUT /api/drivers/status/{id}` - Update driver status
- `GET /api/drivers/available` - Get available drivers

### Ride Endpoints
- `POST /api/rides/book` - Book a new ride
- `PUT /api/rides/status/{id}` - Update ride status
- `GET /api/rides/user/{userId}` - Get user ride history
- `GET /api/rides/driver/{driverId}` - Get driver ride history

### Payment Endpoints
- `POST /api/payments/process` - Process payment
- `GET /api/payments/receipt/{rideId}` - Get payment receipt

### Rating Endpoints
- `POST /api/ratings` - Submit ride rating
- `GET /api/ratings/user/{userId}` - Get user ratings

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Backend server running on `http://localhost:8081`

### Installation
1. Clone or download the frontend files
2. Ensure the backend server is running
3. Open `index.html` in a web browser
4. The application will automatically connect to the backend

### Usage

#### For Users
1. **Register/Login**: Choose "I'm a User" and create an account or login
2. **Book a Ride**: Click "Book Ride" and enter pickup/dropoff locations
3. **Confirm Booking**: Review ride details and confirm
4. **Track Ride**: Monitor ride status in real-time
5. **Payment**: Complete payment when ride ends
6. **Rate Driver**: Provide feedback after payment

#### For Drivers
1. **Register/Login**: Choose "I'm a Driver" and create an account or login
2. **Set Status**: Toggle availability status
3. **Accept Rides**: View and accept incoming ride requests
4. **Manage Rides**: Start and complete rides
5. **View History**: Track completed rides and earnings

## Technical Details

### Architecture
- **Modular JavaScript**: Separate modules for different functionalities
- **Event-Driven**: Uses event listeners for user interactions
- **Promise-based**: Async/await for API calls
- **Local Storage**: Persistent session management

### Styling
- **CSS Grid & Flexbox**: Modern layout techniques
- **CSS Variables**: Consistent theming
- **Responsive Design**: Mobile-first approach
- **Animations**: Smooth transitions and loading states

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Features in Detail

### Authentication Flow
1. User selects role (User/Driver)
2. Chooses to register or login
3. Form validation and submission
4. JWT token storage and session management
5. Automatic dashboard redirection

### Ride Booking Flow
1. User enters pickup and dropoff locations
2. System checks for available drivers
3. Shows ride confirmation with estimated fare
4. User confirms booking
5. Ride request sent to available drivers
6. Driver accepts and manages ride
7. Payment processing after ride completion
8. Rating system for feedback

### Driver Management Flow
1. Driver sets availability status
2. Receives incoming ride requests
3. Accepts or rejects requests
4. Manages ride lifecycle (Start → Complete)
5. Tracks earnings and ride history

## Error Handling

The application includes comprehensive error handling:
- **Network Errors**: Graceful handling of API failures
- **Validation Errors**: Form validation with user feedback
- **Authentication Errors**: Automatic logout on token expiry
- **User Feedback**: Toast notifications for all actions

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Client-side form validation
- **XSS Prevention**: Sanitized HTML rendering
- **CSRF Protection**: Token-based request validation

## Performance Optimizations

- **Lazy Loading**: Load content as needed
- **Debounced Input**: Optimized search and form inputs
- **Efficient DOM Updates**: Minimal re-rendering
- **Cached API Responses**: Local storage for frequently accessed data

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live ride tracking
- **Push Notifications**: Browser notifications for ride updates
- **Offline Support**: Service worker for offline functionality
- **Advanced Maps**: Integration with mapping services
- **Multi-language Support**: Internationalization
- **Dark Mode**: Theme switching capability

## Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure backend server is running on port 8081
   - Check CORS configuration on backend
   - Verify network connectivity

2. **Authentication Issues**
   - Clear browser cache and local storage
   - Check token expiration
   - Verify login credentials

3. **Ride Booking Problems**
   - Ensure drivers are available
   - Check location format
   - Verify network connection

### Debug Mode
Open browser developer tools and check the console for detailed error messages and debugging information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the troubleshooting section
- Review browser console for errors
- Ensure backend server is properly configured
- Verify all dependencies are installed

---

**Note**: This frontend is designed to work with the provided Spring Boot backend. Ensure the backend is running and properly configured before using the frontend application. 