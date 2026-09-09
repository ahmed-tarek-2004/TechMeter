// Debug authentication state
// Open browser console and paste this to check your auth status

console.log('=== Auth State Debug ===');
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
console.log('User:', localStorage.getItem('user'));
console.log('Is Authenticated:', !!localStorage.getItem('accessToken'));
console.log('=======================');

// If all are null, you need to login first!
