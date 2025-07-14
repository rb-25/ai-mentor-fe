import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { auth } from '../firebase.config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, HttpClientModule, RouterModule],
  templateUrl: './projects.html',
  styleUrls: ['./projects.css']
})
export class ProjectsComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  projectsByStatus: { [status: string]: any[] } = {};
  loading = false;
  errorMessage = '';
  private routerSub: Subscription | undefined;
  private retried = false;

  constructor(private http: HttpClient, private router: Router, private cd: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    console.log('[ProjectsComponent] ngOnInit');
    // Always subscribe to router events
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && this.router.url.startsWith('/projects') && this.currentUser) {
        console.log('[ProjectsComponent] Router event: NavigationEnd on /projects, currentUser:', this.currentUser?.uid);
        this.fetchProjects();
      }
    });

    // Listen for auth state changes
    onAuthStateChanged(auth, user => {
      console.log('[ProjectsComponent] onAuthStateChanged:', user);
      if (user) {
        this.currentUser = user;
        // Fetch projects immediately if on /projects
        if (this.router.url.startsWith('/projects')) {
          console.log('[ProjectsComponent] Authenticated and on /projects, fetching projects');
          this.fetchProjects();
        }
      } else {
        this.currentUser = null;
        this.projectsByStatus = {};
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  async fetchProjects() {
    if (!this.currentUser) {
      console.log('[ProjectsComponent] fetchProjects called but currentUser is null');
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    const token = await this.currentUser.getIdToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    console.log('[ProjectsComponent] Fetching projects for user:', this.currentUser.uid);
    try {
      const projects = await this.http.get<any[]>(`https://gdg-be.aarabi.live/api/core/user-projects/`, { headers }).toPromise();
      console.log('[ProjectsComponent] Projects fetched:', projects);
      this.zone.run(() => {
        this.projectsByStatus = {};
        for (const proj of projects ?? []) {
          let status = 'Not Started';
          if (proj.is_completed) {
            status = 'Completed';
          } else if (proj.is_started) {
            status = 'In Progress';
          }
          if (!this.projectsByStatus[status]) {
            this.projectsByStatus[status] = [];
          }
          this.projectsByStatus[status].push(proj);
        }
        this.loading = false;
        if (this.getAllProjects().length === 0 && !this.retried) {
          this.retried = true;
          this.fetchProjects();
        }
      });
    } catch (err: any) {
      console.error('[ProjectsComponent] Unable to fetch projects:', err);
      this.zone.run(() => {
        this.errorMessage = 'Unable to fetch projects.';
        this.loading = false;
      });
    }
  }

  getAllProjects() {
    if (!this.projectsByStatus) return [];
    return Object.values(this.projectsByStatus).flat();
  }

  getCurrentStep(proj: any) {
    if (!proj.steps || proj.steps.length === 0) return null;
    return proj.steps.find((step: any) => !step.is_completed) || null;
  }

  getProgressText(proj: any) {
    if (proj.is_completed) return 'Completed';
    if (proj.is_started) return 'In Progress';
    return 'Not Started';
  }

  getProgressClass(proj: any) {
    if (proj.is_completed) return 'badge-completed';
    if (proj.is_started) return 'badge-inprogress';
    return 'badge-notstarted';
  }

  goToConfirm(proj: any) {
    if (proj.is_completed || proj.is_started) {
      this.router.navigate(['/steps'], { queryParams: { project: proj.id } });
    } else {
      this.router.navigate([`/project/${proj.id}/confirm`]);
    }
  }
}

