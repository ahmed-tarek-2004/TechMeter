#  Tech Meter

> An online learning platform that connects students with expert instructors — built with a clean, scalable architecture.

---

##  About The Project

**Tech Meter** is a full-featured e-learning platform API where instructors (providers) can create and sell courses, and students can browse, purchase, and track their learning progress.

The platform supports a complete learning lifecycle:
- Instructors create courses organized into sections and lessons
- Students discover courses, add them to a cart or wishlist, and purchase via Stripe
- After enrollment, students can track their progress lesson by lesson
- Students can rate and review completed courses

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | ASP.NET Core Web API |
| Architecture | Clean Architecture |
| Pattern | CQRS + MediatR (with Notifications) |
| Authentication | JWT Bearer Tokens |
| Payment | Stripe (Checkout & Payment Intents) |
| ORM | Entity Framework Core |
| Database | SQL Server |

---

##  Architecture Overview

The project follows **Clean Architecture** principles, separating concerns into distinct layers:

```
TechMeter/
├── TechMeter.Domain/          # Entities, Enums, Domain Events
├── TechMeter.Application/     # CQRS Commands, Queries, Handlers, Interfaces
├── TechMeter.Infrastructure/  # EF Core, Stripe, Email, File Storage
└── TechMeter.API/             # Controllers, Middleware, DI Setup
```

### CQRS + MediatR

Every operation in the application is modeled as either a **Command** (write) or a **Query** (read), handled by a dedicated handler — keeping business logic clean and isolated.

```
Request → Controller → MediatR → Handler → Repository/Service → Response
```

**Notifications** are used for side effects — for example, when a payment is confirmed, a `PaymentSucceededNotification` is dispatched to:
- Enroll the student in purchased courses
- Send a confirmation email
- Update order status to `Paid`

---

##  User Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Browse & purchase courses, track progress, rate courses |
| **Provider** | Create and manage courses, sections, and lessons |
| **Admin** | Full platform management, moderate ratings, view all orders & transactions |

---

##  Authentication Flow

The API uses **JWT Bearer** authentication with OTP-based email verification.

```
Register → Receive OTP via Email → Confirm Email → Login → Access Token + Refresh Token
```

Password reset follows the same OTP pattern:
```
Forget Password → OTP sent to email → Verify OTP → Reset Password
```

---

##  Payment Flow

Payments are handled via **Stripe** with two supported methods:

**Option 1 — Stripe Hosted Checkout:**
```
Create Order → POST /check-out → Redirect to Stripe page → Webhook confirms → Student enrolled
```

**Option 2 — Custom Payment Intent (Stripe.js):**
```
Create Order → POST /create-payment-intent → clientSecret → Stripe.js on frontend → Webhook confirms
```

> Payment confirmation is handled automatically via Stripe Webhooks at `POST /api/Payment/HandleWebHook`

---

##  Core Modules

###  Account
Registration, login, email confirmation, password management (forget/reset/change), OTP resend, and logout.

###  Profile
View and update profile info for both students and providers — including profile photo upload.

###  Course
Providers create and manage courses with a title, description, cover image, category, and price. Students can view all courses or their enrolled ones.

###  Section & Lesson
Courses are structured into **Sections**, each containing multiple **Lessons** (video files). Students can mark lessons as finished/unfinished to track their progress.

###  Cart
Students add courses to their cart before checkout. Providers can view any student's cart.

###  Wishlist
Students can save courses to a wishlist for later purchase.

###  Order
Orders are created from the cart contents. Supports full lifecycle: create → pay → cancel/complete. Paginated views for students, providers, and admins.

###  Payment
Stripe integration for checkout sessions and payment intents. Transaction history available for providers and admins with date range filtering.

###  Rating
Students rate and review courses they've enrolled in. Admins can moderate and delete any review.

###  Category
Admins manage course categories. Each category includes a list of its associated courses.

---

##  Getting Started

### Prerequisites
- .NET 8 SDK
- SQL Server
- Stripe account (for payment features)
- SMTP server (for OTP emails)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/tech-meter.git
cd tech-meter

# Restore dependencies
dotnet restore

# Apply database migrations
dotnet ef database update --project TechMeter.Infrastructure

# Run the API
dotnet run --project TechMeter.API
```

### Configuration

Update `appsettings.json` with your credentials:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "your_sql_server_connection_string"
  },
  "JWT": {
    "Key": "your_secret_key",
    "Issuer": "TechMeter",
    "Audience": "TechMeterUsers",
    "ExpiryInDays": 7
  },
  "Stripe": {
    "SecretKey": "sk_...",
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

##  API Reference

All responses follow a consistent wrapper:

```json
{
  "statusCode": "OK",
  "message": "string",
  "succeeded": true,
  "errors": [],
  "data": {}
}
```

### Base URL
```
https://your-domain.com/api
```

### Authentication
Include the JWT token in every protected request:
```http
Authorization: Bearer <access_token>
```

### Quick Endpoint Reference

| Module | Method | Endpoint |
|--------|--------|----------|
| Auth | POST | `/Account/student/register` |
| Auth | POST | `/Account/provider/register` |
| Auth | POST | `/Account/login` |
| Auth | POST | `/Account/confirm-email` |
| Auth | POST | `/Account/forget-password` |
| Auth | POST | `/Account/reset-password` |
| Auth | POST | `/Account/logout` |
| Profile | GET | `/Profile/student/profile` |
| Profile | PUT | `/Profile/student/update/profile` |
| Profile | GET | `/Profile/provider/profile` |
| Profile | PUT | `/Profile/provider/update/profile` |
| Course | GET | `/Course` |
| Course | POST | `/Course/add` |
| Course | GET | `/Course/student/courses` |
| Course | GET | `/Course/provider/courses` |
| Section | GET | `/Section/course/{courseId}/get-all/sections` |
| Section | POST | `/Section/add-section` |
| Lesson | POST | `/Lesson/add/lesson/to-section/{sectionId}` |
| Lesson | POST | `/Lesson/student/{lessonId}/finish-unfinish/lesson` |
| Cart | GET | `/Cart/get/Student/cart` |
| Cart | POST | `/Cart/student/add/to/cart` |
| Wishlist | GET | `/WishList/get/student/wishlist` |
| Wishlist | POST | `/WishList/student/add/course/{courseId}/to/wishlist` |
| Order | POST | `/Order/create` |
| Order | PUT | `/Order/cancel/{orderId}` |
| Payment | POST | `/Payment/check-out` |
| Payment | POST | `/Payment/create-payment-intent` |
| Rating | POST | `/Rating/Student/add` |
| Rating | GET | `/Rating/get-all/{CourseId}` |
| Category | GET | `/Category/getAll` |

---

##  Project Structure

```
TechMeter.Domain/
├── Entities/
│   ├── User, Student, Provider
│   ├── Course, Section, Lesson
│   ├── Order, OrderItem
│   ├── Cart, CartItem
│   ├── WishList, WishListItem
│   └── Rating
├── Enums/
│   ├── Gender
│   └── OrderStatus
└── Events/                     # Domain events for MediatR notifications

TechMeter.Application/
├── Features/
│   ├── Account/Commands & Queries
│   ├── Courses/Commands & Queries
│   ├── Orders/Commands & Queries
│   ├── Payments/Commands
│   └── ...
├── Notifications/              # MediatR notification handlers
│   ├── PaymentSucceededNotification
│   └── OrderStatusChangedNotification
├── Interfaces/                 # IRepository, IEmailService, IFileService...
└── DTOs/

TechMeter.Infrastructure/
├── Persistence/                # EF Core DbContext, Migrations
├── Repositories/
├── Services/
│   ├── StripePaymentService
│   ├── EmailService
│   └── FileStorageService
└── DependencyInjection.cs

TechMeter.API/
├── Controllers/
├── Middleware/                 # Exception handling, logging
└── Program.cs
```

---

##  MediatR Notifications Example

When a Stripe webhook confirms payment, the system publishes a notification that fans out to multiple independent handlers:

```csharp
// Published after webhook confirmation
public record PaymentSucceededNotification(string OrderId, string StudentId)
    : INotification;

// Handler 1 — Enroll student in courses
public class EnrollStudentHandler : INotificationHandler<PaymentSucceededNotification> { }

// Handler 2 — Send confirmation email
public class SendConfirmationEmailHandler : INotificationHandler<PaymentSucceededNotification> { }

// Handler 3 — Update order status to Paid
public class UpdateOrderStatusHandler : INotificationHandler<PaymentSucceededNotification> { }
```

---

##  Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

##  License

This project is licensed under the MIT License.