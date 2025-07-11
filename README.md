
# 🚖 Cab Booking System

A full-stack web application designed to streamline ride booking services for users and drivers. This system facilitates secure authentication, real-time fare calculation, payment processing, and ride lifecycle management using modern technologies including **Spring Boot**, **MySQL**, and **vanilla JavaScript**.

---

## 📌 Overview

The **Cab Booking System** offers a complete ride-booking platform that bridges the gap between users and drivers. It supports:

- Seamless ride booking with real-time fare estimation  
- Role-based access control and secure JWT authentication  
- A responsive user interface for both users and drivers  
- Lifecycle management of rides from request to completion

---

## 🎯 Features

### ✅ User-Focused
- Account registration and login  
- Ride booking with fare estimates  
- Real-time ride status updates  
- Payment via Cash, Card, or UPI  
- Rate drivers post-ride  
- Access ride history and receipts

### ✅ Driver-Focused
- Driver registration with vehicle details  
- Availability toggle and ride request management  
- Update ride status (Accepted → In Progress → Completed)  
- View ride history and earnings summary

---

## 🧱 Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Responsive layout using Flexbox and CSS Grid
- API communication using Fetch API

### Backend
- Java 21, Spring Boot 3.2.3
- Spring Security + JWT
- Spring Data JPA
- MySQL 8.x
- Maven

### External Services
- OSRM (Open Source Routing Machine)
- Postman (for API testing)

---

## 🗂️ Project Structure

```

cab-booking-system/
├── src/main/java/com/cabbooking/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   ├── security/
│   └── config/
├── src/main/resources/
│   └── application.properties
├── cab-frontend/
│   ├── index.html
│   ├── styles.css
│   └── js/
│       ├── auth.js
│       ├── api.js
│       ├── user-dashboard.js
│       └── driver-dashboard.js

````

---

## 🛠️ Backend Setup in IntelliJ

If you're using **IntelliJ IDEA** to run the backend:

### 🔗 Backend Code Link
> [Click here to access backend code](https://drive.google.com/drive/folders/1yG61tS2x0GLVrfIypz3GVNabNJ6hjQVG?usp=sharing)

### 💻 Step-by-Step IntelliJ Instructions

1. **Download the Project**
   - Download or clone the project folder from the Google Drive link above.

2. **Open IntelliJ IDEA**
   - Click `File → Open`
   - Select the root folder of the backend (where `pom.xml` is located)

3. **Import as Maven Project**
   - IntelliJ will automatically detect the Maven structure.
   - If prompted, select "Import as Maven project".

4. **Configure the Database**
   - Open `src/main/resources/application.properties`
   - Set your database URL, username, and password:
     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/cab_booking
     spring.datasource.username=your_username
     spring.datasource.password=your_password
     ```

5. **Create the Database**
   ```sql
   CREATE DATABASE cab_booking;
````

6. **Build and Run**

   * Right-click `CabBookingSystemApplication.java` (inside `com.cabbooking`)
   * Click `Run` to start the backend server (runs on `http://localhost:8081` by default)

---

## 🌐 Frontend Setup

```bash
cd cab-frontend

# Option 1: Open index.html directly in a browser
# Option 2: Run a local server
python -m http.server 8000
# or
npx http-server
```

---

## 🔐 Authentication & Authorization

* JWT-based secure login
* Role-based access (User or Driver)
* Token validation for protected routes

---

## 🧪 Testing

### Backend

* Unit & Integration Testing with JUnit
* Authentication and API endpoint validation

### Frontend

* Manual user testing
* API communication validation

---

## 🚀 Deployment

### Local Deployment

```bash
# Backend
mvn clean package
java -jar target/cab-booking-system-0.0.1-SNAPSHOT.jar

# Frontend
python -m http.server 8000
```

### Cloud Deployment

* **Backend**: Heroku, Render, or AWS EC2
* **Frontend**: Netlify, Vercel, or GitHub Pages

---

## 🧭 Roadmap

* Real-time GPS tracking
* WebSocket for live updates
* Admin analytics dashboard
* Docker containerization
* Microservices structure

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).

---

## 🙌 Contact

For queries or contributions, open an [issue](https://github.com/your-username/cab-booking-system/issues) or submit a pull request.

```

##SCREENSHOTS
![WhatsApp Image 2025-07-05 at 19 19 58_782ed74e](https://github.com/user-attachments/assets/0f2efd24-f105-464c-af10-54574bdf858e)

![WhatsApp Image 2025-07-05 at 19 19 58_6cadfed2](https://github.com/user-attachments/assets/d5a651f9-1b11-4dec-b2a6-ba9a37855dd2)

![WhatsApp Image 2025-07-05 at 19 19 57_c3e56279](https://github.com/user-attachments/assets/58aef242-d2ef-417a-be39-f333066fd3c0)



```
