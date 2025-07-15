import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { auth } from '../firebase.config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-interests',
  standalone: true,
  imports: [CommonModule, NgIf, HttpClientModule],
  templateUrl: './interests.html',
  styleUrls: ['./interests.css']
})
export class InterestsComponent {
  selectedInterests: string[] = [];
  currentUser: User | null = null;

  leftColumn = [
    { label: 'frontend development', value: 'Frontend' },
    { label: 'backend development', value: 'Backend' },
    { label: 'cybersecurity', value: 'Cybersecurity' },
    { label: 'cloud & DevOps', value: 'Cloud' }
  ];

  rightColumn = [
    { label: 'AI & machine learning', value: 'Machine Learning' },
    { label: 'game development', value: 'Game' },
    { label: 'app development', value: 'App' },
    { label: 'data science', value: 'Data Science' }
  ];

  constructor(private http: HttpClient, private router: Router) {
    onAuthStateChanged(auth, user => {
      this.currentUser = user;
    });
  }

  onCheckboxChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (input.checked) {
      this.selectedInterests.push(value);
    } else {
      this.selectedInterests = this.selectedInterests.filter(i => i !== value);
    }
  }

  async submitInterests(): Promise<void> {
    if (!this.currentUser) {
      this.router.navigate(['/experience']);
      return;
    }
    const body = { interests: this.selectedInterests };
    const token = await this.currentUser.getIdToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.put('https://gdg-be.aarabi.live/core/users/', body, { headers }).subscribe({
      next: (res: any) => {
        this.router.navigate(['/experience']);
      },
      error: (err: any) => {
        this.router.navigate(['/experience']);
      }
    });
  }
}



