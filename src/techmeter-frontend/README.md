# TechMeter Frontend

A React-based frontend for the TechMeter e-learning platform.

## Features

- **Authentication**: Login, Register (Student/Provider), Email Verification, Forgot Password, Reset Password, OTP Support
- **Course Management**: Browse courses, Search, Filter by category, View course details with sections and lessons
- **Shopping Cart**: Add/Remove courses, View cart, Checkout with payment integration
- **Orders**: View order history, Track order status, Cancel orders
- **User Profile**: View and edit profile (Student/Provider), View enrolled courses
- **Wishlist**: Save courses for later, Add/Remove from wishlist
- **Notifications**: Real-time notifications with SignalR, Mark as read
- **Comments & Ratings**: Comment on lessons, Like/Unlike comments, Rate courses
- **Provider Dashboard**: Create and manage courses, Add sections and lessons, View analytics
- **Contact**: Contact form for student inquiries

## Tech Stack

- **React 18** with Vite
- **TypeScript** for type safety
- **React Router v6** for routing
- **TanStack Query** for data fetching
- **React Hook Form** with Zod validation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for HTTP requests

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```
   VITE_API_BASE_URL=https://localhost:7165/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── layout/       # Header, Footer, Layout
│   ├── courses/      # CourseCard, etc.
│   └── common/       # ErrorBoundary, etc.
├── pages/            # Page components
│   ├── auth/         # Login, Register, ForgotPassword, ResetPassword
│   ├── courses/      # Courses, CourseDetail, CreateCourse
│   ├── cart/         # Cart, Checkout
│   ├── orders/       # Orders, OrderDetail
│   ├── profile/      # Profile
│   ├── wishlist/     # Wishlist
│   ├── notifications/# Notifications
│   ├── contact/      # Contact
│   └── provider/     # ProviderDashboard
├── services/         # API service layer
│   ├── api.ts        # Axios instance with interceptors
│   ├── authService.ts
│   ├── courseService.ts
│   ├── cartService.ts
│   ├── orderService.ts
│   ├── wishlistService.ts
│   ├── notificationService.ts
│   ├── commentService.ts
│   ├── ratingService.ts
│   ├── lessonService.ts
│   ├── sectionService.ts
│   ├── categoryService.ts
│   ├── profileService.ts
│   ├── contactService.ts
│   └── paymentService.ts
├── context/          # React Context (Auth)
├── types/            # TypeScript types and interfaces
└── main.jsx          # Application entry point
```

## API Integration

The frontend integrates with the TechMeter ASP.NET Core API. Make sure the backend is running on the URL specified in `.env`.

## Available Scripts

- `npm run dev` - Start development server (default: http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run oxlint

## Backend Integration

This frontend is designed to work with the TechMeter .NET backend API. Ensure the backend is running at the URL specified in your `.env` file.

### API Endpoints Used

- **Account**: `/api/Account/*` - Authentication and user management
- **Course**: `/api/Course/*` - Course CRUD operations
- **Cart**: `/api/Cart/*` - Shopping cart management
- **Order**: `/api/Order/*` - Order management
- **Wishlist**: `/api/WishList/*` - Wishlist operations
- **Notification**: `/api/Notification/*` - Notifications
- **Comment**: `/api/Comments/*` - Lesson comments
- **Rating**: `/api/Rating/*` - Course ratings
- **Lesson**: `/api/Lesson/*` - Lesson management
- **Section**: `/api/Section/*` - Section management
- **Category**: `/api/Category/*` - Category management
- **Profile**: `/api/Profile/*` - User profile management
- **Contact**: `/api/Contact/*` - Contact messages
- **Payment**: `/api/Payment/*` - Payment processing

## User Roles

- **Student**: Can browse courses, purchase courses, add to cart/wishlist, rate and comment
- **Provider**: Can create and manage courses, sections, and lessons
- **Admin**: Full system access (not implemented in frontend yet)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is part of the TechMeter e-learning platform.