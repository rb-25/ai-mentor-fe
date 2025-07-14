import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { auth } from '../firebase.config';
import { onAuthStateChanged, User } from 'firebase/auth';

@Component({
  selector: 'app-project-confirm',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './project-confirm.html',
  styleUrls: ['./project-confirm.css']
})
export class ProjectConfirmComponent implements OnInit {
  project: any = null;
  loading = true;
  errorMessage = '';
  currentUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    onAuthStateChanged(auth, user => {
      if (user) {
        this.currentUser = user;
        this.fetchProject();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  async fetchProject() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || !this.currentUser) return;
    this.loading = true;
    this.errorMessage = '';
    const token = await this.currentUser.getIdToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any>(`https://gdg-be.aarabi.live/api/core/user-projects/`, { headers }).subscribe({
      next: (projects) => {
        // Debug log
        console.log('Fetched projects:', projects);
        console.log('Looking for project with id:', id);
        // Ensure both are numbers for comparison
        const projectId = typeof id === 'string' ? parseInt(id, 10) : id;
        this.project = (projects as any[]).find(p => Number(p.id) === Number(projectId));
        if (!this.project) {
          this.errorMessage = `Project with id ${id} not found.`;
        } else {
          console.log('Found project:', this.project);
          console.log('is_started:', this.project.is_started, 'is_completed:', this.project.is_completed);
          if (this.project.is_started || this.project.is_completed) {
            // If already started or completed, redirect
            this.router.navigate(['/projects']);
          }
        }
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load project.';
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  startProject() {
    if (!this.project || !this.currentUser) return;
    const url = 'https://gdg-be.aarabi.live/api/core/user-projects/';
    const body = { project: this.project.project, is_started: true };
    this.currentUser.getIdToken().then(token => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      this.http.post(url, body, { headers }).subscribe({
        next: () => {
          alert('Project started!');
          this.router.navigate(['/steps'], { queryParams: { project: this.project.project } });
        },
        error: (err) => {
          alert('Failed to start project.');
          console.error(err);
        }
      });
    });
  }

  cancel() {
    this.router.navigate(['/projects']);
  }
} 