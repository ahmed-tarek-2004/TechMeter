export interface User {
  id: string;
  email: string;
  userName: string;
  phoneNumber?: string;
  role: 'student' | 'provider' | 'admin';
  profileUrl?: string;
  isEmailConfirmed?: boolean;
}

export interface ApiResponse<T> {
  statusCode: number;
  message?: string;
  succeeded: boolean;
  errors?: string[];
  data: T;
}

export interface AuthResponse {
  id: string;
  email: string;
  userName: string;
  phoneNumber?: string;
  photoUrl?: string;
  role: string;
  isEmailConfirmed: boolean;
  accessToken: string;
  refreshToken: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  courseProfileImageUrl: string;
  categoryId: string;
  providerId: string;
  currency: string;
  price: number;
}

export interface Section {
  id: string;
  name: string;
  courseId: string;
  lessonCount: number;
}

export interface Lesson {
  id: string;
  name: string;
  description?: string;
  lessonUrl: string;
  sectionId: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export interface CartResponse {
  cartId: string;
  totalItems: number;
  totalPrice: number;
  items: CartItemResponse[];
  createdAt: string;
  updatedAt?: string;
}

export interface CartItemResponse {
  id: string;
  courseId: string;
  unitPrice: number;
  courseName: string;
  courseImageUrl: string;
  createdAt: string;
}

export interface OrderResponse {
  id: string;
  studentId: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  totalPrice: number;
  shippingAddress: string;
  orderItems: OrderItemResponse[];
}

export interface OrderItemResponse {
  id: string;
  courseId: string;
  courseName: string;
  courseImageUrl: string;
  price: number;
}

export interface OrderSummaryResponse {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  itemCount: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  receiptId: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  parentCommentId?: string;
  isEdited: boolean;
  userId: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  lessonId: string;
  likesCount: number;
  replies: Comment[];
}

export interface WishlistItem {
  id: string;
  courseId: string;
  courseName?: string;
  courseTitle?: string;
  courseImageUrl?: string;
  courseProfileImageUrl?: string;
  price?: number;
  currency?: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  addedAt?: string;
  createdAt?: string;
}

export interface WishlistResponse {
  id: string;
  studentId: string;
  createdAt: string;
  lastUpdated: string;
  items: WishlistItem[];
}

export interface Rating {
  studentId: string;
  courseId: string;
  rating?: number;
  comment?: string;
  ratedAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  studentName: string;
  phoneNumber: string;
  email: string;
  country: string;
  educationLevel: string;
  birthDay?: string;
  profileImage: string;
}

export interface ProviderProfile {
  id: string;
  providerName: string;
  phoneNumber: string;
  email: string;
  country: string;
  bankAccount: string;
  brief: string;
  experienceYears: number;
  profileUrl?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface PaginatedList<T> {
  items: T[];
  count?: number;
  totalCount?: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface Message {
  id: number;
  message: string;
  messageId: number;
  sentAt: string;
  isRead: boolean;
  senderId?: string;
  sender?: SenderInfo;
}

export interface SenderInfo {
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipientImageUrl?: string;
}

export interface Contact {
  id: string;
  name: string;
  userProfilePictureUrl?: string;
}

export interface MessageEvent {
  id: number;
  content: string;
  sentAt: string;
  sender: SenderInfo;
}

export interface StudentEnrolledCourse extends Course {
  enrolledAt?: string;
  progressPercentage?: number;
  completedLessonsCount?: number;
  totalLessonsCount?: number;
  lastWatchedLessonId?: string;
  isFinished?: boolean;
}

export interface Transaction {
  id: string;
  transactionId?: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded' | string;
  createdAt: string;
  orderId?: string;
  providerId?: string;
  studentId?: string;
  studentName?: string;
  providerName?: string;
  courseTitle?: string;
}

export interface AdminAnalyticsSummary {
  totalRevenue: number;
  totalStudents: number;
  totalProviders: number;
  totalCourses: number;
  totalOrders: number;
  monthlyRevenue: { month: string; amount: number }[];
  recentOrders: OrderSummaryResponse[];
}

export interface ProviderAnalyticsSummary {
  totalRevenue: number;
  totalStudents: number;
  activeCourses: number;
  totalReviews: number;
  averageRating: number;
  recentSales: OrderSummaryResponse[];
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description: string;
}

export interface AddSectionRequest {
  sectionName: string;
}

export interface EditSectionRequest {
  name: string;
  courseId: string;
}

export interface AddLessonRequest {
  name: string;
  description?: string;
  lessonStream: File;
}

export interface EditLessonRequest {
  name: string;
  description?: string;
  sectionId: string;
}


