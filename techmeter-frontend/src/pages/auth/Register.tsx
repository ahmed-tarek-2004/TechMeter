import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, Loader2, MapPin, GraduationCap, Briefcase, Building, FileText, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../../utils/errorUtils';

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<'student' | 'provider'>('student');
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    country: '',
    gender: 'Male',
    birthDate: '',
    educationLevel: '',
    bankAccount: '',
    brief: '',
    experienceYears: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      const { userId, email } = await register({ ...formData, role });
      const targetEmail = email || formData.email;

      if (userId) {
        sessionStorage.setItem('otp_userId', userId);
      }
      if (targetEmail) {
        sessionStorage.setItem('otp_email', targetEmail);
      }
      sessionStorage.setItem('otp_password', formData.password);

      toast('Please check your email for the 6-digit verification code', { icon: '📧' });
      navigate('/verify-otp', {
        state: {
          userId,
          email: targetEmail,
          password: formData.password,
          from: '/',
        },
        replace: true,
      });
    } catch (error: any) {
      const errorMessage = getApiErrorMessage(error, 'Registration failed. Please try again.');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-lg w-full bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm dark:shadow-2xl border border-gray-100 dark:border-gray-800 space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-4 border rounded-2xl text-center transition ${
                    role === 'student'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <GraduationCap className="h-6 w-6 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-xs">Learn (Student)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`p-4 border rounded-2xl text-center transition ${
                    role === 'provider'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Briefcase className="h-6 w-6 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-xs">Teach (Instructor)</span>
                </button>
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="userName" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Username</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="userName" name="userName" type="text" value={formData.userName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                  placeholder="Choose a username" required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Email address</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email" name="email" type="email" value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                  placeholder="name@example.com" required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phoneNumber" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Phone number</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                  placeholder="+1234567890" required
                />
              </div>
            </div>

            {/* Country & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="country" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Country</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="country" name="country" type="text" value={formData.country}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                    placeholder="Country" required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Gender</label>
                <select
                  id="gender" name="gender" value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2.5 px-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                >
                  <option value="Male" className="dark:bg-gray-800">Male</option>
                  <option value="Female" className="dark:bg-gray-800">Female</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'}
                  value={formData.password} onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                  placeholder="Create password" required
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-300" /> : <Eye className="h-4 w-4 text-gray-400 hover:text-gray-300" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Confirm password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword} onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                  placeholder="Repeat password" required
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-300" /> : <Eye className="h-4 w-4 text-gray-400 hover:text-gray-300" />}
                </button>
              </div>
            </div>

            {/* Student-only fields */}
            {role === 'student' && (
              <div className="space-y-4 pt-1">
                <div>
                  <label htmlFor="birthDate" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Birth Date</label>
                  <input
                    id="birthDate" name="birthDate" type="date" value={formData.birthDate}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2.5 px-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="educationLevel" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Education Level</label>
                  <select
                    id="educationLevel" name="educationLevel" value={formData.educationLevel}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2.5 px-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                    required
                  >
                    <option value="" className="dark:bg-gray-800">Select education level</option>
                    <option value="High School" className="dark:bg-gray-800">High School</option>
                    <option value="Bachelor" className="dark:bg-gray-800">Bachelor</option>
                    <option value="Master" className="dark:bg-gray-800">Master</option>
                    <option value="PhD" className="dark:bg-gray-800">PhD</option>
                    <option value="Other" className="dark:bg-gray-800">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Provider-only fields */}
            {role === 'provider' && (
              <div className="space-y-4 pt-1">
                <div>
                  <label htmlFor="bankAccount" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Bank Account</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Building className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      id="bankAccount" name="bankAccount" type="text" value={formData.bankAccount}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                      placeholder="IBAN or Account Number" required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="experienceYears" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Years of Experience</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      id="experienceYears" name="experienceYears" type="number" min="0"
                      value={formData.experienceYears} onChange={handleChange}
                      className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                      placeholder="0" required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="brief" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Brief Bio</label>
                  <div className="mt-1 relative">
                    <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none">
                      <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <textarea
                      id="brief" name="brief" rows={3} value={formData.brief}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                      placeholder="Tell students about your expertise..."
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center pt-2">
            <input id="terms" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800" required />
            <label htmlFor="terms" className="ml-2 block text-xs text-gray-700 dark:text-gray-300">
              I agree to the{' '}
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Privacy Policy</a>
            </label>
          </div>

          <div>
            <button
              type="submit" disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
