import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase.config';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router) {}

  async onLogin() {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate form
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.loading = true;

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
      
      this.successMessage = 'Successfully signed in!';
      
      // Clear form
      this.email = '';
      this.password = '';
      
      // Redirect to interests page after 2 seconds
      this.router.navigate(['/projects']);
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/user-not-found':
          this.errorMessage = 'No account found with this email address';
          break;
        case 'auth/wrong-password':
          this.errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Please enter a valid email address';
          break;
        case 'auth/user-disabled':
          this.errorMessage = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          this.errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          this.errorMessage = 'An error occurred during login. Please try again.';
      }
      this.router.navigate(['/projects']);
    } finally {
      this.loading = false;
    }
  }

  async onGoogleLogin() {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    this.loading = true;

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      this.successMessage = 'Successfully signed in with Google!';
      
      // Redirect to interests page after 2 seconds
      this.router.navigate(['/projects']);
      
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          this.errorMessage = 'Login was cancelled';
          break;
        case 'auth/popup-blocked':
          this.errorMessage = 'Popup was blocked. Please allow popups for this site';
          break;
        case 'auth/account-exists-with-different-credential':
          this.errorMessage = 'An account already exists with this email using a different sign-in method';
          break;
        default:
          this.errorMessage = 'An error occurred during Google login. Please try again.';
      }
      this.router.navigate(['/projects']);
    } finally {
      this.loading = false;
    }
  }
}
