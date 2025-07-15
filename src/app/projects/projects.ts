import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { auth } from '../firebase.config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ChangeDetectorRef } from '@angular/core';

// ✅ Move interface OUTSIDE the component
export interface Project {
  id: number;
  project_name: string;
  project_domain: string;
  project_description: string;
  is_starred?: boolean;
  is_started?: boolean;
  is_completed?: boolean;
  steps?: any[];
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './projects.html',
  styleUrls: ['./projects.css']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  currentUser: User | null = null;

  constructor(private http: HttpClient, private router: Router, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    onAuthStateChanged(auth, user => {
      if (user) {
        this.currentUser = user;
        this.fetchProjects();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  fetchProjects() {
    if (!this.currentUser) return;
    this.currentUser.getIdToken().then(token => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      this.http.get<any[]>('https://gdg-be.aarabi.live/api/core/user-projects/', { headers })
        .subscribe((data: any[]) => {
          console.log('Projects data:', data);
          this.projects = data.map((p: any) => ({
            id: p.id,
            project_name: p.project_name,
            project_domain: p.project_domain,
            project_description: p.project_description,
            is_starred: p.is_starred || false,
            is_started: p.is_started,
            is_completed: p.is_completed,
            steps: p.steps || [],
          }));
          this.cd.detectChanges();
        });
    });
  }

  goToSteps(project: Project) {
    if (!this.currentUser) return;
    // project.id is the userproject id
    if (project.is_started) {
      this.router.navigate(['/steps'], { queryParams: { project: project.id } });
    } else {
      this.currentUser.getIdToken().then(token => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        this.http.patch(`https://gdg-be.aarabi.live/api/core/user-projects/${project.id}/`, { is_started: true }, { headers })
          .subscribe({
            next: () => {
              this.router.navigate(['/steps'], { queryParams: { project: project.id } });
            },
            error: (err) => {
              alert('Failed to start project.');
              console.error(err);
            }
          });
      });
    }
  }
}