import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { auth } from '../firebase.config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GoogleCalendarService } from '../services/google-calendar.service';
import { environment } from '../../environments/environment';

interface Step {
  id: number;
  ordering: number;
  name: string;
  description: string;
  deadline: string;
  is_completed: boolean;
}

@Component({
  selector: 'app-steps',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, RouterModule],
  templateUrl: './steps.html',
  styleUrls: ['./steps.css']
})
export class StepsComponent implements OnInit {
  projectId: string = '';
  steps: Step[] = [];
  currentStepIndex: number = 0;
  loading = true;
  errorMessage = '';
  currentUser: User | null = null;
  completed: boolean = false;
  projectName: string = '';
  projectDomain: string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private cd: ChangeDetectorRef, private googleCalendar: GoogleCalendarService) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.queryParamMap.get('project') || '';
    console.log('Steps page: projectId from query param:', this.projectId);
    onAuthStateChanged(auth, user => {
      if (user) {
        this.currentUser = user;
        this.fetchSteps();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  async fetchSteps() {
    if (!this.projectId || !this.currentUser) {
      this.errorMessage = 'Project not specified.';
      this.loading = false;
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    const token = await this.currentUser.getIdToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any>(`https://gdg-be.aarabi.live/api/core/user-projects/${this.projectId}`, { headers }).subscribe({
      next: (project) => {
        console.log('Steps page: API response:', project);
        this.projectName = project.name || '';
        this.projectDomain = project.domain || '';
        this.steps = (project.steps || []).sort((a: Step, b: Step) => a.ordering - b.ordering);
        // Find the current step (first incomplete step, or last if all complete)
        let idx = 0;
        if (project.current_step) {
          idx = this.steps.findIndex((s: Step) => s.ordering === project.current_step.ordering);
          if (idx === -1) idx = 0;
        } else {
          idx = this.steps.findIndex((s: Step) => !s.is_completed);
          if (idx === -1) idx = 0;
        }
        this.currentStepIndex = idx;
        this.completed = !!this.steps[idx]?.is_completed;
        if (!this.steps.length) {
          this.errorMessage = 'No steps found for this project.';
        }
        this.cd.detectChanges();
        console.log('Steps page: computed currentStepIndex:', this.currentStepIndex);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load steps.';
        this.loading = false;
      }
    });
  }

  nextStep(): void {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.completed = !!this.steps[this.currentStepIndex]?.is_completed;
    }
  }

  prevStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.completed = !!this.steps[this.currentStepIndex]?.is_completed;
    }
  }

  markComplete(): void {
    if (!this.currentUser) return;
    const step = this.steps[this.currentStepIndex];
    if (!step || step.is_completed) return;
    const url = `https://gdg-be.aarabi.live/api/core/steps/${step.id}/`;
    const body = { id: step.id, is_completed: true };
    this.currentUser.getIdToken().then(token => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      this.http.patch(url, body, { headers }).subscribe({
        next: () => {
          step.is_completed = true;
          this.completed = true;
          this.cd.detectChanges();
        },
        error: (err) => {
          alert('Failed to mark step as complete.');
          console.error(err);
        }
      });
    });
  }

  async addStepToCalendar() {
    await this.googleCalendar.init(environment.googleCloudClientId);
    await this.googleCalendar.signIn();

    const step = this.steps[this.currentStepIndex];
    const event = {
      summary: step.name,
      description: step.description,
      start: {
        date: this.getStepStartDate(), // implement this to get a date string
      },
      end: {
        date: this.getStepEndDate(), // implement this to get a date string
      }
    };

    await this.googleCalendar.addEvent(event);
    // Optionally show a confirmation
  }

  get currentStep(): Step {
    return this.steps[this.currentStepIndex];
  }

  getStepStartDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getStepEndDate(): string {
    const today = new Date();
    const step = this.steps[this.currentStepIndex];
    if (!step || !step.deadline) return today.toISOString().split('T')[0];
    const deadline = step.deadline.toLowerCase();
    let daysToAdd = 0;
    const weekMatch = deadline.match(/(\d+)\s*week/);
    const dayMatch = deadline.match(/(\d+)\s*day/);
    if (weekMatch) {
      daysToAdd += parseInt(weekMatch[1], 10) * 7;
    }
    if (dayMatch) {
      daysToAdd += parseInt(dayMatch[1], 10);
    }
    if (daysToAdd === 0) daysToAdd = 1; // fallback
    const endDate = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    return endDate.toISOString().split('T')[0];
  }
}

