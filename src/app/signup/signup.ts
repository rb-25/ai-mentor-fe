import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase.config';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router) {}

  async onSignup() {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate form
    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    this.loading = true;

    try {
      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
      
      this.successMessage = 'Account created successfully!';
      
      // Clear form
      this.email = '';
      this.password = '';
      this.confirmPassword = '';
      
      // Redirect to interests page after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/interests']);
      }, 2000);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Please enter a valid email address';
          break;
        case 'auth/weak-password':
          this.errorMessage = 'Password is too weak. Please choose a stronger password';
          break;
        default:
          this.errorMessage = 'An error occurred during signup. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }

  async onGoogleSignup() {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    this.loading = true;

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      this.successMessage = 'Successfully signed up with Google!';
      
      // Redirect to interests page after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/interests']);
      }, 2000);
      
    } catch (error: any) {
      console.error('Google signup error:', error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          this.errorMessage = 'Signup was cancelled';
          break;
        case 'auth/popup-blocked':
          this.errorMessage = 'Popup was blocked. Please allow popups for this site';
          break;
        case 'auth/account-exists-with-different-credential':
          this.errorMessage = 'An account already exists with this email using a different sign-in method';
          break;
        default:
          this.errorMessage = 'An error occurred during Google signup. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }
}
