# 🎓 TechMeter — E-Learning Platform API

<div align="center">

![.NET](https://img.shields.io/badge/.NET_9.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![EF Core](https://img.shields.io/badge/Entity_Framework_Core-8-purple?style=for-the-badge)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white)
![Hangfire](https://img.shields.io/badge/Hangfire-Jobs-green?style=for-the-badge)
![SignalR](https://img.shields.io/badge/SignalR-Real--time-blue?style=for-the-badge)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

**A full-featured, production-ready E-Learning REST API & React SPA built with ASP.NET Core 9, EF Core 8, MediatR CQRS, and React 19**

> 📖 **Direct AI & Developer References:**  
> - 🧠 **[Master AI Project & Architecture Guide (PROJECT_AI_MASTER_GUIDE.md)](./PROJECT_AI_MASTER_GUIDE.md)** — Complete architecture, database schema, CQRS pipelines, hubs, and API catalog.
> - 🚀 **[Implementation Roadmap: Wanted APIs & Frontend Pages (ROADMAP_WANTED_APIS_AND_FRONTEND_PAGES.md)](./ROADMAP_WANTED_APIS_AND_FRONTEND_PAGES.md)** — Actionable specification for new backend endpoints and frontend views.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Domain Models & Database Schema](#-domain-models--database-schema)
- [Features](#-features)
  - [Authentication & Authorization](#-authentication--authorization)
  - [Course Management](#-course-management)
  - [Lesson & Section Management](#-lesson--section-management)
  - [Shopping Cart](#-shopping-cart)
  - [Wishlist](#-wishlist)
  - [Orders & Payments](#-orders--payments)
  - [Ratings & Reviews](#-ratings--reviews)
  - [Lesson Comments & Interactions](#-lesson-comments--interactions)
  - [Real-Time Messaging](#-real-time-messaging)
  - [Notifications](#-notifications)
  - [User Profiles](#-user-profiles)
  - [Contact / Chat Discovery](#-contact--chat-discovery)
  - [Background Jobs](#-background-jobs)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Configuration & Settings](#-configuration--settings)
- [Getting Started](#-getting-started)
- [Future Features (Planned)](#-future-features-planned)

---

## 🌟 Overview

**TechMeter** is a comprehensive E-Learning platform API that enables:

- **Students** to browse, purchase, and consume courses.
- **Providers (Instructors)** to create and manage their own courses, sections, and lessons.
- **Admins** to oversee the entire platform, manage orders, transactions, and users.

The system supports full course lifecycle management — from discovery and purchase through Stripe, to lesson watching progress tracking, ratings, real-time chat, and push notifications.

---

## 🏗 Architecture

TechMeter follows **Clean Architecture** with a strict separation of concerns across four projects:

```
TechMeter/
├── TechMeter.API            → Presentation Layer   (Controllers, Hubs, Middleware)
├── TechMeter.Application    → Application Layer    (CQRS via MediatR, DTOs, Validators)
├── TechMeter.Infrastructure → Infrastructure Layer (EF Core, Stripe, Cloudinary, FCM, Email)
├── TechMeter.Domain         → Domain Layer         (Entities, Enums, Business Rules)
└── Shared/                  → Cross-Cutting        (Response wrapper, Settings)
```

### Key Patterns Used

| Pattern | Implementation |
|---|---|
| **CQRS** | MediatR — all requests go through Commands/Queries |
| **Repository** | EF Core `ApplicationDbContext` acts as repository |
| **Pipeline Behaviors** | Logging + FluentValidation via MediatR pipelines |
| **Response Wrapper** | Uniform `Response<T>` envelope on every endpoint |
| **Pagination** | `PaginatedList<T>` for all list endpoints |
| **Background Jobs** | Hangfire with SQL Server storage |
| **Real-Time** | SignalR hub for notifications & chat |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | ASP.NET Core 9.0 |
| **ORM** | Entity Framework Core 8 + SQL Server |
| **CQRS Mediator** | MediatR 12.5 |
| **Validation** | FluentValidation |
| **Authentication** | ASP.NET Core Identity + JWT Bearer + Refresh Tokens |
| **OAuth** | Google OAuth 2.0 / Facebook (external login) |
| **Payments** | Stripe (Checkout Sessions + Payment Intents + Webhooks) |
| **Media Storage** | Cloudinary (course images, profile pictures, lesson videos) |
| **Background Jobs** | Hangfire 1.8 (SQL Server backend) |
| **Real-Time** | ASP.NET Core SignalR |
| **Push Notifications** | Firebase Cloud Messaging (FCM) via FirebaseAdmin SDK |
| **Email** | FluentEmail + SMTP |
| **Caching** | Redis (StackExchange.Redis) |
| **Rate Limiting** | ASP.NET Core Rate Limiting (OTP policy, toggle policy) |
| **Logging** | Serilog (Console + File sinks, Thread/Environment enrichers) |
| **API Docs** | Swagger (Swashbuckle) + Scalar |
| **Error Handling** | Hellang ProblemDetails Middleware |

---

## 📁 Project Structure

```
TechMeter.API/
├── Controllers/
│   ├── AccountController.cs        ← Auth endpoints
│   ├── ProfileController.cs        ← User profile management
│   ├── CourseController.cs         ← Course CRUD
│   ├── SectionController.cs        ← Section CRUD
│   ├── LessonController.cs         ← Lesson CRUD + watch tracking
│   ├── CategoryController.cs       ← Category management
│   ├── CartController.cs           ← Shopping cart
│   ├── WishListController.cs       ← Wishlist
│   ├── OrderController.cs          ← Order management
│   ├── PaymentController.cs        ← Stripe payments
│   ├── WebhookController.cs        ← Stripe webhook handler
│   ├── RatingController.cs         ← Course ratings
│   ├── CommentsController.cs       ← Lesson comments + likes
│   ├── MessageController.cs        ← Chat message history
│   ├── NotificationController.cs   ← Notification management
│   └── ContactController.cs        ← Available contacts for chat
├── Hubs/
│   └── NotificationHub.cs          ← SignalR hub
├── Common/Middleware/
│   ├── GlobalExceptionHandlerMiddleware.cs
│   └── StopwatchRequestMiddleware.cs

TechMeter.Application/
├── Features/                       ← MediatR Commands & Queries (organized by feature)
│   ├── Auth/                       ← Register, Login, Logout, OTP, ResetPassword, ExternalLogin
│   ├── Course/                     ← Add, Edit, Delete, Get courses
│   ├── Section/                    ← Add, Edit, Delete, Get sections
│   ├── Lesson/                     ← Add, Edit, Delete, Get, Watch/Unwatch lessons
│   ├── Category/                   ← CRUD for categories
│   ├── Cart/                       ← Add, Remove, Clear cart
│   ├── WishList/                   ← Add, Remove, Clear wishlist
│   ├── Order/                      ← Create, Cancel, Delete, Get orders
│   ├── Payment/                    ← Checkout, PaymentIntent, Webhook
│   ├── Rating/                     ← Add, Edit, Delete ratings
│   ├── Comments/                   ← Add, Edit, Delete, Like/Unlike comments
│   ├── Notification/               ← Read, GetAll notifications, Store FCM tokens
│   ├── Message/                    ← Message history query
│   ├── Profile/                    ← Get/Update student & provider profiles
│   └── Contact/                    ← Get available contacts
├── Behaviors/
│   ├── LoggingBehavior.cs          ← Logs all MediatR requests/responses
│   └── ValidationBehavior.cs       ← Runs FluentValidation before handlers
└── DTO/                            ← Request/Response data transfer objects

TechMeter.Infrastructure/
├── Persistence/
│   ├── AppDbContext/ApplicationDbContext.cs
│   ├── EntitiesConfigurations/     ← EF Core Fluent API configs
│   ├── Migrations/                 ← 25+ EF Core migration files
│   └── Transaction/                ← EfTransaction, EfTransactionManager
├── Services/
│   ├── Token/TokenService.cs       ← JWT + Refresh token generation
│   ├── OTP/OTPService.cs           ← One-time password logic
│   ├── OAuth/                      ← Google + ExternalLogin service
│   ├── Payment/PaymentService.cs   ← Stripe integration
│   ├── Fcm/FcmService.cs           ← Firebase push notifications
│   ├── Message/MessageService.cs   ← Direct messaging
│   └── UserConnection/             ← SignalR connection management
└── HangfireJobs/
    ├── Hangfire/HangfireJobService.cs   ← IBackgroundJobService abstraction
    ├── Jobs/EnrollmentNotificationJob.cs
    └── Dashboard/AllowAllDashboardAuthorizationFilter.cs

TechMeter.Domain/
├── Models/
│   ├── Auth/Identity/User.cs       ← IdentityUser with extra fields
│   ├── Auth/Users/Student.cs
│   ├── Auth/Users/Provider.cs
│   ├── Auth/UserMessages.cs
│   ├── Auth/UserConnections.cs
│   ├── Course.cs
│   ├── Sections.cs
│   ├── Lessons.cs
│   ├── Category.cs
│   ├── Cart.cs / CartItem.cs
│   ├── Wishlist.cs / WishListItem.cs
│   ├── Order.cs / OrderItem.cs
│   ├── PaymentTransaction.cs
│   ├── UserCourseRating.cs
│   ├── CourseStudent.cs
│   ├── StudentLessonWatched.cs
│   ├── Notification.cs
│   ├── FcmUserTokens.cs
│   ├── LessonComment.cs
│   ├── LessonCommentLike.cs
│   └── AuditLog.cs
└── Enums/
    ├── Gender.cs
    ├── OrderStatus.cs
    ├── NotificationType.cs
    ├── TransactionStatus.cs
    ├── MediaType.cs
    ├── OtpStatus.cs
    └── UserAction.cs              ← Comprehensive audit action enum
```

---

## 🗃 Domain Models & Database Schema

### User Model (ASP.NET Identity extended)
| Field | Type | Notes |
|---|---|---|
| Id | string (GUID) | Primary Key |
| FullName | string | — |
| Email | string | Unique, from Identity |
| Country | string | — |
| ProfileUrl | string? | Cloudinary URL |
| Gender | enum | Male / Female |
| PhoneNumber | string | From Identity |

### Student (1-to-1 with User)
| Field | Notes |
|---|---|
| BirthDate | Optional |
| EducationLevel | string |
| Cart | Navigation |
| Wishlist | Navigation |
| Orders | Collection |
| CourseStudent | Enrolled courses (join table) |
| StudentLessonsWatched | Progress tracking |
| Transactions | Payment records |

### Provider / Instructor (1-to-1 with User)
| Field | Notes |
|---|---|
| BankAccount | Payout account |
| Brief | Bio text |
| ExperienceYears | int |
| Courses | Courses they own |
| CertificatesUrls | Credential URLs |

### Course
| Field | Notes |
|---|---|
| Title, Description | — |
| Price, Currency | Defaults to USD |
| CourseProfileImageUrl | Cloudinary |
| LessonCount, SectionCount | Denormalized counts |
| CategoryId, ProviderId | FK references |

### Section → Lesson (Course hierarchy)
- Each **Course** has many **Sections**
- Each **Section** has many **Lessons**
- Each **Lesson** has a `LessonUrl` (Cloudinary video), comments, and watch tracking

### Order & Payment
- **Order** → Status: `NoThing | PendingPayment | Paid | Canceled | Failed`
- **OrderItem** → links Order to purchased Courses
- **PaymentTransaction** → recorded after Stripe webhook fires
- Stripe events handled: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## ✨ Features

### 🔐 Authentication & Authorization

Three roles: **student**, **provider**, **admin**

| Feature | Details |
|---|---|
| Student Registration | Email + OTP email verification |
| Provider Registration | Same flow, different role |
| Login | Email + password + optional OTP |
| Email Confirmation | OTP-based via email |
| Forget Password | OTP sent to email |
| Reset Password | Token + new password |
| Change Password | Authenticated, old → new |
| Logout | Invalidates refresh token |
| Refresh Token | Sliding token rotation |
| External Login | Google OAuth (verify `idToken`) |
| OTP Resend | Rate-limited (`SendOtpPolicy`) |

**Security Features:**
- JWT Bearer tokens with configurable signing key, issuer, audience
- Refresh tokens stored in DB (`UserRefreshTokens`)
- Rate limiting on OTP and toggle actions
- FluentValidation on all inputs
- Global exception handler middleware
- Request stopwatch middleware for perf logging

---

### 📚 Course Management

| Endpoint | Role | Description |
|---|---|---|
| `GET /api/course/all` | Public | Browse all courses |
| `GET /api/course/{id}` | Public | Course detail |
| `GET /api/course/provider` | Provider | Own courses |
| `GET /api/course/student` | Student | Enrolled courses |
| `POST /api/course` | Provider | Create course (with image upload) |
| `PUT /api/course/{id}` | Provider | Edit course |
| `DELETE /api/course/{id}` | Provider/Admin | Delete course |

- Course images uploaded to **Cloudinary**
- Supports multi-form data uploads
- Lesson and section counts auto-tracked

---

### 📂 Lesson & Section Management

**Sections** organize course content into chapters:

| Endpoint | Role | Description |
|---|---|---|
| `GET /api/section/{courseId}/all` | Public | All sections for a course |
| `GET /api/section/course/{courseId}/detail/{sectionId}` | Auth | Section detail |
| `POST /api/section/course/{courseId}` | Provider | Add section |
| `PUT /api/section/{id}` | Provider | Edit section |
| `DELETE /api/section/{courseId}/section/{id}` | Provider | Delete section |

**Lessons** are video-based content within sections:

| Endpoint | Role | Description |
|---|---|---|
| `POST /api/lesson/{sectionId}` | Provider | Upload lesson (video to Cloudinary via Hangfire) |
| `GET /api/lesson/{id}` | Public | Get lesson |
| `GET /api/lesson/course/{courseId}/all` | Public | All lessons in course |
| `GET /api/lesson/{sectionId}/lessons` | Public | Lessons in a section |
| `PUT /api/lesson/{id}` | Provider | Edit lesson |
| `DELETE /api/lesson/{id}` | Provider/Admin | Delete lesson |
| `POST /api/lesson/{id}/finish` | Student | Mark lesson as watched |
| `DELETE /api/lesson/{id}/unfinish` | Student | Unmark lesson as watched |
| `GET /api/lesson/student/watched` | Student | Get all watched lessons |

> **Note:** Lesson video uploads are processed **asynchronously via Hangfire** to avoid blocking the request thread.

---

### 🛒 Shopping Cart

| Endpoint | Role | Description |
|---|---|---|
| `GET /api/cart/student` | Student | View own cart |
| `GET /api/cart/provider/{studentId}` | Provider | View a student's cart |
| `POST /api/cart/student` | Student | Add course to cart |
| `DELETE /api/cart/student/{cartItemId}` | Student | Remove item from cart |
| `DELETE /api/cart/clear` | Student | Clear entire cart |

---

### ❤️ Wishlist

| Endpoint | Role | Description |
|---|---|---|
| `GET /api/wishlist` | Any | View wishlist |
| `POST /api/wishlist/{courseId}` | Any | Add course to wishlist |
| `DELETE /api/wishlist/{wishlistItemId}` | Any | Remove item |
| `DELETE /api/wishlist/clear` | Any | Clear entire wishlist |

---

### 💳 Orders & Payments

#### Order Management

| Endpoint | Role | Description |
|---|---|---|
| `GET /api/order/{orderId}` | Authenticated | Get order by ID |
| `GET /api/order/student` | Student | Paginated student orders |
| `GET /api/order/provider` | Provider | Provider's sales orders |
| `GET /api/order/admin` | Admin | All orders (paginated) |
| `PUT /api/order/cancel/{orderId}` | Student | Cancel pending order |
| `PUT /api/order/status/{orderId}` | Admin/Provider | Update order status |
| `DELETE /api/order/{orderId}` | Admin | Hard delete order |

**Order Status Flow:** `PendingPayment` → `Paid` | `Canceled` | `Failed`

#### Stripe Payment Integration

| Endpoint | Role | Description |
|---|---|---|
| `POST /api/payment/check-out` | Student | Create Stripe Checkout Session |
| `POST /api/payment/create-payment-intent` | Student | Create Stripe PaymentIntent (for custom UI) |
| `GET /api/payment/admin/all/transaction` | Admin | All transactions (filterable by provider, date range) |
| `GET /api/payment/provider/all/transaction` | Provider | Own earnings transactions |
| `POST /api/webhook/HandleWebHook` | Anonymous | Stripe webhook receiver |

**Webhook Events Handled:**
- `checkout.session.completed` → Creates order + enrolls student
- `payment_intent.succeeded` → Creates order + enrolls student + sends invoice email
- `payment_intent.payment_failed` → Marks order as failed

> On successful payment: courses are added to **student's enrollment**, a **payment transaction** is recorded, and an **invoice email** is sent automatically.

---

### ⭐ Ratings & Reviews

| Endpoint | Role | Description |
|---|---|---|
| `POST /api/rating/student` | Student | Rate a course (1–5 stars) |
| `PUT /api/rating/student` | Student | Edit own rating |
| `GET /api/rating/student/{courseId}` | Student | Get own rating for a course |
| `GET /api/rating/all/{courseId}` | Authenticated | All ratings for a course |
| `DELETE /api/rating/student/{courseId}` | Student | Delete own rating |
| `DELETE /api/rating/admin/{studentId}/rating/{courseId}` | Admin | Admin removes any rating |

---

### 💬 Lesson Comments & Interactions

Full comment system on every lesson with threaded replies and likes:

| Endpoint | Role | Description |
|---|---|---|
| `POST /api/comments/{lessonId}` | Auth | Add comment (or reply) to lesson |
| `PATCH /api/comments/{id}` | Auth | Edit own comment |
| `DELETE /api/comments/{id}/lesson/{lessonId}` | Auth/Admin | Delete comment |
| `GET /api/comments/{lessonId}/all` | Auth | All comments for a lesson |
| `POST /api/comments/{id}/like` | Auth | Like a comment |
| `DELETE /api/comments/{id}/like` | Auth | Unlike a comment |
| `GET /api/comments/{id}/likes` | Auth | Get all likes on a comment |

**Features:**
- Nested comment threads (via `ParentCommentId`)
- Admins can delete any comment
- Like/unlike with rate limiting to prevent spam
- Comment stores author's name, full name, email, and profile image at creation time

---

### 📨 Real-Time Messaging

Direct one-to-one messaging between students and their course providers:

| Endpoint | Role | Description |
|---|---|---|
| `GET /api/message/{receiverId}` | Auth | Paginated chat history with a user |

**Architecture:**
- Messages stored in `UserMessages` table (persistent)
- `UserConnections` table tracks SignalR connection IDs
- **SignalR hub** (`/notificationHub`) enables real-time delivery
- Message read/delivery status supported (`isRead`, `isDeleted`)

---

### 🔔 Notifications

In-app + push notification system:

| Endpoint | Role | Description |
|---|---|---|
| `GET /api/notification/all` | Auth | All notifications (paginated) |
| `GET /api/notification/unread` | Auth | Unread notifications |
| `POST /api/notification/{id}/read` | Auth | Mark single notification as read |
| `POST /api/notification/read/all` | Auth | Mark all as read |
| `POST /api/notification/store/token` | Auth | Register device FCM token |

**Notification Types:** `Enrollment`, `Assignment`, `Message`, `Comment`, `Like`, `FinishCourse`

**Push Notifications:**
- Firebase Cloud Messaging (FCM) via `FirebaseAdmin` SDK
- Device tokens stored per user in `FcmUserTokens`
- Multiple devices per user supported

---

### 👤 User Profiles

| Endpoint | Role | Description |
|---|---|---|
| `GET /api/profile/student` | Student | Get student profile |
| `PUT /api/profile/student` | Student | Update student profile (with image upload) |
| `GET /api/profile/provider` | Provider | Get provider profile |
| `PUT /api/profile/provider` | Provider | Update provider profile (with image upload) |

**Student Profile Fields:** BirthDate, EducationLevel, profile picture (Cloudinary)  
**Provider Profile Fields:** Brief bio, ExperienceYears, BankAccount, CertificateUrls, profile picture

---

### 📒 Contact / Chat Discovery

Retrieve available contacts to start a chat with:

| Endpoint | Role | Description |
|---|---|---|
| `GET /api/contact/student` | Student | Paginated list of providers the student can message |
| `GET /api/contact/provider` | Provider | Paginated list of students the provider can message |

> Contacts are discovered based on enrollment relationships — students can message the providers of their enrolled courses, and providers can message their enrolled students.

---

### ⚙️ Category Management

| Endpoint | Role | Description |
|---|---|---|
| `GET /api/category` | Public | All categories |
| `GET /api/category/detail/{id}` | Public | Category detail |
| `POST /api/category/category` | Admin | Create category |
| `PUT /api/category/{id}` | Admin | Update category |
| `DELETE /api/category/{id}` | Admin | Delete category |

---

### ⏱ Background Jobs

**Hangfire** is used as the background job engine with SQL Server as the job store:

| Job | Trigger | Description |
|---|---|---|
| **Lesson Video Upload** | On lesson creation | Uploads video files to Cloudinary asynchronously |
| **File Upload** | On lesson creation | Handles PDF/file attachments asynchronously |
| **Enrollment Notification** | Post-payment | Sends enrollment notifications to newly enrolled students |
| **Invoice Email** | Payment success | Sends invoice email after successful Stripe payment |

**Job Types Supported:**
- `Enqueue` — fire-and-forget
- `Enqueue<T>` — typed fire-and-forget
- `Schedule<T>` — delayed execution

Hangfire Dashboard is available with a custom `AllowAllDashboardAuthorizationFilter` (configurable for production auth).

---

## 📡 API Endpoints Reference

### Base URL
```
https://localhost:{port}/api
```

### Authentication
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Complete Endpoint Summary

| Controller | Method | Route | Auth |
|---|---|---|---|
| **Account** | POST | `/account/student/register` | Public |
| | POST | `/account/provider/register` | Public |
| | POST | `/account/login` | Public |
| | POST | `/account/confirm-email` | Public |
| | POST | `/account/forget-password` | Public |
| | POST | `/account/verify-reset-password` | Public |
| | POST | `/account/reset-password` | Public |
| | POST | `/account/change-password` | Auth |
| | POST | `/account/resend-otp` | Rate-limited |
| | POST | `/account/logout` | Auth |
| | POST | `/account/refresh-token` | Public |
| | POST | `/account/external-login` | Public |
| **Profile** | GET | `/profile/provider` | Provider |
| | PUT | `/profile/provider` | Provider |
| | GET | `/profile/student` | Student |
| | PUT | `/profile/student` | Student |
| **Category** | GET | `/category` | Public |
| | GET | `/category/detail/{id}` | Public |
| | POST | `/category/category` | Admin |
| | PUT | `/category/{id}` | Admin |
| | DELETE | `/category/{id}` | Admin |
| **Course** | GET | `/course/all` | Public |
| | GET | `/course/{id}` | Public |
| | GET | `/course/provider` | Provider |
| | GET | `/course/student` | Student |
| | POST | `/course` | Provider |
| | PUT | `/course/{id}` | Provider |
| | DELETE | `/course/{id}` | Provider/Admin |
| **Section** | GET | `/section/{courseId}/all` | Public |
| | GET | `/section/course/{courseId}/detail/{sectionId}` | Auth |
| | POST | `/section/course/{courseId}` | Provider |
| | PUT | `/section/{id}` | Provider |
| | DELETE | `/section/{courseId}/section/{id}` | Provider |
| **Lesson** | POST | `/lesson/{sectionId}` | Provider |
| | GET | `/lesson/{id}` | Public |
| | GET | `/lesson/course/{courseId}/all` | Public |
| | GET | `/lesson/{sectionId}/lessons` | Public |
| | PUT | `/lesson/{id}` | Provider |
| | DELETE | `/lesson/{id}` | Provider/Admin |
| | POST | `/lesson/{id}/finish` | Student |
| | DELETE | `/lesson/{id}/unfinish` | Student |
| | GET | `/lesson/student/watched` | Student |
| **Cart** | GET | `/cart/student` | Student |
| | GET | `/cart/provider/{studentId}` | Provider |
| | POST | `/cart/student` | Student |
| | DELETE | `/cart/student/{cartItemId}` | Student |
| | DELETE | `/cart/clear` | Student |
| **WishList** | GET | `/wishlist` | Any |
| | POST | `/wishlist/{courseId}` | Any |
| | DELETE | `/wishlist/{wishlistItemId}` | Any |
| | DELETE | `/wishlist/clear` | Any |
| **Order** | GET | `/order/{orderId}` | Auth |
| | GET | `/order/student` | Student |
| | GET | `/order/provider` | Provider |
| | GET | `/order/admin` | Admin |
| | PUT | `/order/cancel/{orderId}` | Student |
| | PUT | `/order/status/{orderId}` | Admin/Provider |
| | DELETE | `/order/{orderId}` | Admin |
| **Payment** | POST | `/payment/check-out` | Student |
| | POST | `/payment/create-payment-intent` | Student |
| | GET | `/payment/admin/all/transaction` | Admin |
| | GET | `/payment/provider/all/transaction` | Provider |
| **Webhook** | POST | `/webhook/HandleWebHook` | Public (Stripe) |
| **Rating** | POST | `/rating/student` | Student |
| | PUT | `/rating/student` | Student |
| | GET | `/rating/student/{courseId}` | Student |
| | GET | `/rating/all/{courseId}` | Auth |
| | DELETE | `/rating/student/{courseId}` | Student |
| | DELETE | `/rating/admin/{studentId}/rating/{courseId}` | Admin |
| **Comments** | POST | `/comments/{lessonId}` | Auth |
| | PATCH | `/comments/{id}` | Auth |
| | DELETE | `/comments/{id}/lesson/{lessonId}` | Auth |
| | GET | `/comments/{lessonId}/all` | Auth |
| | POST | `/comments/{id}/like` | Auth |
| | DELETE | `/comments/{id}/like` | Auth |
| | GET | `/comments/{id}/likes` | Auth |
| **Message** | GET | `/message/{receiverId}` | Auth |
| **Notification** | GET | `/notification/all` | Auth |
| | GET | `/notification/unread` | Auth |
| | POST | `/notification/{id}/read` | Auth |
| | POST | `/notification/read/all` | Auth |
| | POST | `/notification/store/token` | Auth |
| **Contact** | GET | `/contact/student` | Student |
| | GET | `/contact/provider` | Provider |

---

## ⚙️ Configuration & Settings

The following configuration sections are required in `appsettings.json`:

```json
{
  "JwtSettings": {
    "SigningKey": "your-secret-key",
    "Issuer": "TechMeter",
    "Audience": "TechMeterUsers"
  },
  "StripeSettings": {
    "SecretKey": "sk_...",
    "PuplishableKey": "pk_...",
    "WebhookSecret": "whsec_..."
  },
  "CloudinarySettings": {
    "CloudName": "your-cloud-name",
    "ApiKey": "your-api-key",
    "ApiSecret": "your-api-secret"
  },
  "EmailSettings": {
    "Host": "smtp.example.com",
    "Port": 587,
    "Username": "noreply@techmeter.com",
    "Password": "your-email-password"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=TechMeterDb;..."
  }
}
```

---

## 🚀 Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- SQL Server (2019+ or SQL Server Express)
- Redis instance (local or cloud)
- Stripe account + API keys
- Cloudinary account + credentials
- Firebase project + service account JSON (for FCM)
- SMTP mail credentials

### Setup Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd TechMeter

# 2. Configure appsettings.json with your credentials
# (See Configuration section above)

# 3. Apply EF Core migrations
cd TechMeter.Infrastructure
dotnet ef database update --startup-project ../TechMeter.API

# 4. Run the API
cd ../TechMeter.API
dotnet run
```

### API Documentation

Once running, browse:
- **Swagger UI:** `https://localhost:{port}/swagger`
- **Scalar UI:** `https://localhost:{port}/scalar`
- **Hangfire Dashboard:** `https://localhost:{port}/hangfire`

---

## 🔭 Future Features (Planned)

The following features are tracked and planned for upcoming releases:

### 📊 Analytics & Audit
- **Audit Logging** — `AuditLog` entity and `UserAction` enum are already defined covering 60+ user actions (CourseViewed, LessonWatched, CoursePurchased, PaymentFailed, etc.). Full audit trail implementation is in progress.
- **Instructor Dashboard Analytics** — Revenue charts, student enrollment trends, lesson completion rates.
- **Admin Analytics Dashboard** — Platform-wide metrics: MAU, revenue, popular categories.

### 🏆 Gamification & Progress
- **Certificates** — `CertificatesUrl` model exists on `Provider`. Auto-generated certificates on course completion (`CourseCompleted` action already tracked in enums).
- **Course Progress Tracker** — Visual progress bar based on `StudentLessonWatched`. `UserCourseFinished` model is already in the domain.
- **Quiz / Assessment System** — `QuizCompleted` is already in `UserAction` enum, models pending.

### 🔍 Search & Discovery
- **Full-Text Search** — Course + instructor search with filters and sorting (enums `SearchPerformed`, `FilterApplied`, `SortApplied` already defined).
- **Course Recommendations** — Personalized recommendations based on enrolled courses and browsing history.

### 💬 Real-Time Enhancements
- **Live Notifications via SignalR** — `NotificationHub` is scaffolded; group-based delivery per user ID is the next step.
- **Typing indicators** — For the chat system.
- **Message deletion & editing** — `isDeleted` flag already on `UserMessages`.

### 💰 Monetization
- **Provider Payout System** — Commission calculation field already on `Order`. Automated payout scheduling via Hangfire planned.
- **Coupon / Discount Codes** — Promotional pricing layer.
- **Subscription Plans** — Monthly/annual platform subscriptions.

### 🔒 Security & Admin
- **Two-Factor Authentication (2FA)** — TOTP-based 2FA on top of existing OTP infrastructure.
- **Admin User Management** — Suspend/activate accounts, role assignment UI.
- **Rate Limiting Expansion** — More granular policies beyond current OTP + toggle limits.

### 📱 Mobile & Platform
- **Mobile Push Notification Topics** — Broadcast to all enrolled students of a course via FCM topic subscriptions (infrastructure already in `FcmService`).
- **Offline Lesson Download** — Allow students to download lesson content for offline viewing.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request against `main`

---

## 👤 Author

**Ahmed Tarek Zaher**  
Built with using ASP.NET Core 9 & Clean Architecture

---

<div align="center">
<i>TechMeter — Empowering learners, one lesson at a time.</i>
</div>
