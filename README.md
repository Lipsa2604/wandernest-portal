# WanderNest Rental Platform

## Overview

This project is a full-stack web application developed as a clone of Airbnb using the MERN stack (MongoDB, Express.js, React.js, Node.js). It aims to replicate the core functionality of Airbnb, allowing users to search for accommodations, view details, make bookings, and manage their listings.

## 🚀 Live Deployment

- **Frontend:** https://resplendent-biscochitos-3a315f.netlify.app
- **Backend API:** https://wandernest-portal.onrender.com
- **GitHub Repository:** https://github.com/Lipsa2604/wandernest-portal

---

## Getting Started

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/jayashreemn/wandernest-portal.git
   ```

2. **Install dependencies:**

   Navigate to client directory and install frontend dependencies using npm

   ```bash
   cd client
   npm install
   ```

   Similarly navigate to api folder and install backend dependencies

   ```bash
   cd ../api
   npm install
   ```

3. **ENV variables:**

   - Create .env file in the client folder and add these variables

     ```
     VITE_BASE_URL=http://localhost:4000
     VITE_GOOGLE_CLIENT_ID=your_google_client_id
     ```

   - Create .env file in the api folder and add these variables

     ```
     PORT=4000
     DB_URL=your_mongodb_url
     JWT_SECRET=your_jwt_secret_key
     JWT_EXPIRY=20d
     COOKIE_TIME=7
     SESSION_SECRET=your_session_secret_key
     CLOUDINARY_NAME=your_cloudinary_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     CLIENT_URL=http://localhost:5173
     ```

4. **Run project:**
   - Open terminal, navigate to client directory and run below command to start frontend
   ```bash
   npm run dev
   ```
   - Open another terminal, navigate to api directory and run this command to start backend server
   ```bash
   npm start
   ```

---

## Features

- **User Authentication:** Users can sign up, log in, and log out securely. Passwords are hashed for security.
- **Google Login:** Users can sign up and log in using their gmail.

  ![Airbnb Logo](client/public/assets/auth.png)
  
  ![Airbnb Logo](client/public/assets/register.png)

- **Search Listings:** Users can search for accommodations.

  ![Airbnb Logo](client/public/assets/search.png)

- **View Listings:** Users can view detailed information about each accommodation, including photos, descriptions, amenities.

  ![Airbnb Logo](client/public/assets/view.png)

- **Make Bookings:** Authenticated users can book accommodations for specific dates.

  ![Airbnb Logo](client/public/assets/book.png)

- **Manage Listings:** Hosts can create, edit, and delete their listings.

  ![Airbnb Logo](client/public/assets/manage.png)

- **Responsive Design:** The application is designed to be responsive and work seamlessly across different devices.

  ![Airbnb Logo](client/public/assets/hero.png)

---

## Technologies Used

- **MongoDB:** NoSQL database for storing user data, listings.
- **Express.js:** Web application framework for building the backend server.
- **React.js:** JavaScript library for building the user interface.
- **Node.js:** JavaScript runtime environment for executing server-side code.
- **Tailwind CSS:** A utility-first CSS framework
- **Shadcn:** UI library for styling based on Tailwind CSS
- **JWT:** JSON Web Tokens for secure user authentication.
- **Cloudinary:** Cloud-based image management for storing and serving images.
- **Google Cloud:** For gmail based authentication

---

## 🌐 Deployment Guide

### Frontend Deployment (Netlify)

**Live URL:** https://resplendent-biscochitos-3a315f.netlify.app

#### Steps:

1. **Build the frontend:**
   ```bash
   cd client
   npm run build
   ```

2. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

3. **Login to Netlify:**
   ```bash
   netlify login
   ```

4. **Deploy to production:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

5. **Set Environment Variables in Netlify:**
   - Go to: https://app.netlify.com
   - Select your site
   - Settings → Build & Deploy → Environment
   - Add variables:
     ```
     VITE_BASE_URL=https://wandernest-portal.onrender.com
     VITE_GOOGLE_CLIENT_ID=your_google_client_id
     ```

---

### Backend Deployment (Render)

**Live URL:** https://wandernest-portal.onrender.com

#### Steps:

1. **Create Render Account:**
   - Visit: https://render.com
   - Sign up with GitHub

2. **Create Web Service:**
   - Click: "New +" → "Web Service"
   - Select repository: Your GitHub repo
   - Branch: `main`

3. **Configure Build:**
   - Build Command: `cd api && npm install`
   - Start Command: `node api/index.js`

4. **Add Environment Variables:**
   - Click: "Environment"
   - Add all variables from your `api/.env`:
     ```
     PORT=4000
     DB_URL=your_mongodb_connection_url
     JWT_SECRET=your_jwt_secret_key
     JWT_EXPIRY=20d
     COOKIE_TIME=7
     SESSION_SECRET=your_session_secret_key
     CLOUDINARY_NAME=your_cloudinary_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     CLIENT_URL=https://resplendent-biscochitos-3a315f.netlify.app
     ```

5. **Deploy:**
   - Click: "Create Web Service"
   - Wait 5-10 minutes for deployment to complete

---

### Database Setup (MongoDB Atlas)

1. **Create Account:** https://www.mongodb.com/cloud/atlas
2. **Create Cluster:** Choose M0 (Free tier)
3. **Get Connection String:** 
   - Cluster → Connect → Drivers
   - Copy the connection string
4. **Whitelist IP:** 
   - Security → Network Access 
   - Add `0.0.0.0/0` to allow all IPs
5. **Use URL:** Add connection string to `api/.env` as `DB_URL`

---

### Image Storage (Cloudinary)

1. **Create Account:** https://cloudinary.com
2. **Get Credentials:**
   - Dashboard → Account Details
   - Copy: Cloud Name, API Key, API Secret
3. **Add to Backend:** Add these to `api/.env`

---

### Payment Gateway (Razorpay)

1. **Create Account:** https://razorpay.com
2. **Get API Keys:** Settings → API Keys
3. **Use in Frontend:** Use keys for payment processing

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Whitelist your IP in MongoDB Atlas Network Access |
| CORS errors | Verify CLIENT_URL in backend matches frontend URL exactly |
| Google auth fails | Add deployed URL to Google OAuth redirect URIs |
| Cloudinary upload fails | Check API credentials in .env file |
| Build fails on Netlify | Ensure all environment variables are set correctly |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the ISC License.

---

**Last Updated:** April 14, 2026  
**Status:** Production Ready ✅