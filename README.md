# 🎟️ Ticket Booking System

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white)

A robust backend architecture for an Event Ticket Booking System. This project handles the complete flow of event management, seat allocation, user bookings, and secure payment processing using Razorpay.

## ✨ Key Features

- **Modular Architecture:** Well-structured routes and modules for `User`, `Admin`, `Event`, `Seats`, `Ticket Booking`, and `Payment`.
- **Role-Based Access Control (RBAC):**
  - Secure authentication and authorization using **JWT**.
  - Implemented **Guards** to restrict routes (e.g., only Admins can create events and manage seats).
- **Payment Gateway Integration (Razorpay):**
  - Backend-only payment flow implementation.
  - **Webhook integration** to automatically track and update ticket statuses upon successful payments.
  - Secure management of payment keys and signature verification.
- **Data Integrity & Validation:**

---

### Installation Steps:

1. Install dependencies:
```bash
npm install
```

2. Set up Environment Variables:
Create a `.env` file in the root directory:
```plaintext
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ticket_db?schema=public"

# JWT Auth
JWT_SECRET="your_jwt_secret_key"

# Razorpay Keys
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
```

3. Spin up the Database:
```bash
docker-compose up -d
```

4. Run Prisma Migrations:
npx prisma migrate dev --name init 
npx prisma generate 

5. Start the server:
npm run start:dev 

🤝 Contributing 
Contributions, issues, and feature requests are welcome!

📄 License 
This project is MIT licensed.

### Quick Tips Before Committing:
1. Replace `https://github.com/yourusername/ticket-booking-system.git` with your actual GitHub repo link.
2. If you built this using a specific framework (like **NestJS** or **Express.js**), feel free to add a badge for it at the very top (e.g., `![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)`).
