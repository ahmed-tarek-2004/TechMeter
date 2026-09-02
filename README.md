# TechMeter

TechMeter is a modern e-learning platform API built with ASP.NET Core. It provides a complete digital learning experience for students, course providers, and administrators. The system supports course management, lesson delivery, student progress tracking, order handling, payment processing, reviews, notifications, and scalable backend architecture.

---

## Project Overview

TechMeter is more than a simple API. It is a full-featured learning platform that supports the entire educational lifecycle:

* Providers can create and manage courses.
* Students can browse, purchase, and complete courses.
* Learners can track progress lesson by lesson.
* Payments are integrated through Stripe for secure purchases.
* Different user roles are supported: Student, Provider, and Admin.

---

## What This Application Offers

### 1) Authentication and User Management

The platform supports multiple user roles:

* Student: a user who browses, purchases, and learns from courses.
* Provider: a user who creates and sells courses.
* Admin: a user who manages the platform.

Supported features include:

* User registration
* Login
* **Login with Google**
* **Login with Facebook**
* Email verification through OTP
* Resending OTP
* Forgot password and password reset
* Password change
* Logout

Authentication is handled using JWT Bearer Tokens to protect API endpoints.

### 2) Profile Management

Each user can manage their personal account information, including:

* Full name
* Email address
* Phone number
* Profile image
* Basic identity-related details

This is handled through separate profile endpoints for students and providers.

### 3) Course Management

This is one of the core features of the platform. Providers can create complete educational courses that include:

* Course title
* Description
* Cover image
* Category
* Price
* Learning content

Supported actions include:

* Viewing all available courses
* Viewing courses enrolled by a student
* Viewing courses owned by a provider
* Updating a course
* Deleting a course

### 4) Sections and Lessons Management

Each course is organized into educational units:

* Sections: major parts of a course
* Lessons: individual learning units inside each section

Features include:

* Adding a section to a course
* Editing a section
* Deleting a section
* Adding lessons to a section
* Editing or deleting lessons
* Viewing lessons for a course or section

### 5) Student Progress Tracking

Students can mark lessons as completed or unfinished. This allows the platform to track learning progress effectively.

Supported behavior includes:

* Tracking progress lesson by lesson
* Marking a lesson as finished
* Undoing a lesson completion
* Viewing completed lessons

### 6) Cart and Wishlist

Students can manage their learning purchases before checkout:

* Add a course to the cart
* View cart items
* Remove cart items
* Clear the cart
* Add a course to the wishlist
* Remove a course from the wishlist
* Clear the wishlist

### 7) Order Management

Once students select courses, an order is created based on the cart contents. The system supports:

* Creating an order from the cart
* Viewing student orders
* Viewing provider orders
* Viewing admin orders
* Canceling an order
* Updating the order status
* Deleting an order

### 8) Stripe Payments

The application supports online payments through Stripe with:

* Stripe Checkout
* Payment Intent flow
* Webhooks for payment confirmation

The payment flow works as follows:

1. An order is created
2. The payment request is sent to Stripe
3. Payment confirmation is received from Stripe
4. The order is updated and the student is enrolled in the course automatically

### 9) Ratings and Reviews

Students can leave feedback on courses they enrolled in or completed. Features include:

* Adding a rating
* Editing a rating
* Deleting a rating
* Viewing ratings for a specific course
* Admin review moderation

### 10) Real-Time Notifications and Messaging

The app uses SignalR to support real-time communication such as:

* System notifications
* Instant messaging
* Status updates

### 11) Background Jobs and Scheduled Tasks

The application uses Hangfire to handle background work such as:

* Deferred processing
* Background operations
* Scheduled tasks

### 12) Media and File Storage

The platform supports:

* Uploading course images
* Uploading user profile images
* Storing media through Cloudinary

### 13) Docker Containerization

The application is fully containerized using Docker, allowing you to run the API and its dependencies seamlessly across any environment without manual setup.

---

## User Roles

| Role | Main Responsibility |
| --- | --- |
| Student | Browses courses, adds them to the cart or wishlist, purchases them, and follows learning progress |
| Provider | Creates courses, adds sections and lessons, and receives payments for their content |
| Admin | Oversees the full platform, manages categories, moderates ratings, and monitors orders and payments |

---

## Architecture

The project follows Clean Architecture principles, separating responsibilities into clear layers:

* Domain: contains core models, entities, and base types
* Application: contains business logic, commands, queries, handlers, and DTOs
* Infrastructure: contains the database layer, external services, Stripe, email, storage, and background jobs
* API: contains controllers, middleware, and startup configuration

It also uses CQRS with MediatR, which is ideal for separating read and write operations clearly.

---

## Technologies Used

| Layer | Technology |
| --- | --- |
| Framework | ASP.NET Core Web API |
| Architecture | Clean Architecture |
| Pattern | CQRS + MediatR |
| Authentication | JWT Bearer Tokens, **Google Auth, Facebook Auth** |
| Database | SQL Server |
| ORM | Entity Framework Core |
| Payments | Stripe |
| Real-Time Communication | SignalR |
| Background Jobs | Hangfire |
| Media Storage | Cloudinary |
| Email Verification | OTP via email |
| Firebase | Firebase integration |
| **Containerization** | **Docker & Docker Compose** |

---

## Project Structure

```text
TechMeter/
├── TechMeter.API/             # Controllers, middleware, startup configuration
├── TechMeter.Application/     # Commands, queries, handlers, DTOs, interfaces
├── TechMeter.Domain/          # Entities, enums, models
├── TechMeter.Infrastructure/  # DbContext, migrations, services, payments, email
├── docker-compose.yml         # Docker configuration
└── Shared/                    # Shared models and common base classes

```

---

## Prerequisites

Before running the project, make sure the following are available:

* .NET 8 SDK
* SQL Server
* Stripe account
* SMTP server for email delivery
* Firebase credentials if Firebase services are used fully
* **Docker Desktop (if running via Docker Compose)**
* **Google & Facebook Developer Apps (for Social Login credentials)**

---

## Getting Started

### 1) Clone the Repository

```bash
git clone https://github.com/ahmed-tarek-2004/TechMeter.git
cd TechMeter

```

### 2) Run with Docker (Recommended)

```bash
docker-compose up --build

```

### 3) Restore Dependencies (For Local Execution)

```bash
dotnet restore

```

### 4) Apply Database Migrations

```bash
dotnet ef database update --project TechMeter.Infrastructure

```

### 5) Run the API

```bash
dotnet run --project TechMeter.API

```

---

## Basic Configuration

You should update the appsettings.json file with the correct values, for example:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "your_connection_string",
    "Hangfire": "your_hangfire_connection_string"
  },
  "JWT": {
    "Key": "your_secret_key",
    "Issuer": "TechMeter",
    "Audience": "TechMeterUsers"
  },
  "Authentication": {
    "Google": {
      "ClientId": "your_google_client_id",
      "ClientSecret": "your_google_client_secret"
    },
    "Facebook": {
      "AppId": "your_facebook_app_id",
      "AppSecret": "your_facebook_app_secret"
    }
  },
  "Stripe": {
    "SecretKey": "sk_test_...",
    "WebhookSecret": "whsec_..."
  },
  "Email": {
    "Host": "smtp.example.com",
    "Port": 587,
    "Username": "your_email",
    "Password": "your_password"
  }
}

```

---

## Important API Endpoints

### Authentication

* POST /api/Account/student/register
* POST /api/Account/provider/register
* POST /api/Account/login
* **POST /api/Account/external-login**
* POST /api/Account/confirm-email
* POST /api/Account/forget-password
* POST /api/Account/reset-password
* POST /api/Account/logout

### Courses

* GET /api/Course/all
* GET /api/Course/{Id}
* GET /api/Course/provider
* GET /api/Course/student
* POST /api/Course
* PUT /api/Course/{courseId}
* DELETE /api/Course/{courseId}

### Sections and Lessons

* GET /api/Section/{courseId}/all
* POST /api/Section/course/{courseId}
* GET /api/Lesson/course/{courseId}/all
* POST /api/Lesson/{sectionId}
* POST /api/Lesson/{Id}/finish
* DELETE /api/Lesson/{Id}/unfinish

### Cart and Wishlist

* GET /api/Cart/student/cart
* POST /api/Cart/student
* DELETE /api/Cart/student/{cartItemId}
* GET /api/WishList
* POST /api/WishList/{courseId}
* DELETE /api/WishList/{wishlistItemId}

### Orders and Payments

* POST /api/Order
* GET /api/Order/student/orders/{studentId}
* PUT /api/Order/cancel/{orderId}
* POST /api/Payment/check-out
* POST /api/Payment/create-payment-intent
* POST /api/Payment/HandleWebHook

### Ratings

* POST /api/Rating/student
* GET /api/Rating/all/{CourseId}
* DELETE /api/Rating/student/{CourseId}

---

## Notes

* The system is designed to be scalable and easy to extend with new features.
* Business logic is organized through MediatR handlers, making the codebase modular and maintainable.
* The application is suitable for production environments with external services like Stripe, Cloudinary, Email, and Firebase.

---

## License

This project is licensed under the MIT License.
