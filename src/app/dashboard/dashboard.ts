import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { auth } from '../firebase.config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, HttpClientModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  projects: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    onAuthStateChanged(auth, user => {
      if (user) {
        this.currentUser = user;
        this.fetchProjects();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  async fetchProjects() {
    if (!this.currentUser) return;
    this.loading = true;
    this.errorMessage = '';
    const token = await this.currentUser.getIdToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    try {
      const projRes = await this.http.get<any[]>(`https://gdg-be.aarabi.live/api/core/user-projects/`, { headers }).toPromise();
      console.log('Token sent:', token);
      this.projects = projRes ?? [];
    } catch (err: any) {
      console.error(err);
      this.errorMessage = 'Unable to fetch project data.';
    } finally {
      this.loading = false;
    }
  }
}

