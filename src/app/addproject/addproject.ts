import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { auth } from '../firebase.config';
import { onAuthStateChanged, User } from 'firebase/auth';

@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './addproject.html',
  styleUrls: ['./addproject.css']
})
export class AddProjectComponent {
  project = {
    name: '',
    description: '',
    domain: ''
  };
  currentUser: User | null = null;

  constructor(private http: HttpClient, private router: Router) {
    onAuthStateChanged(auth, user => {
      this.currentUser = user;
    });
  }

  submitProject() {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser.getIdToken().then(token => {
      const url = 'https://gdg-be.aarabi.live/api/core/projects/';
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      this.http.post(url, this.project, { headers }).subscribe({
        next: () => {
          this.router.navigate(['/projects']);
        },
        error: () => {
          this.router.navigate(['/projects']);
        }
      });
    });
  }
} 