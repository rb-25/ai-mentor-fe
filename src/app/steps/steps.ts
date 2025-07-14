import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { auth } from '../firebase.config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Step {
  ordering: number;
  name: string;
  description: string;
  deadline: string;
  is_completed?: boolean;
  id: number; // Added id for update
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

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private cd: ChangeDetectorRef) {}

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
        this.steps = project.steps || [];
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

  nextStep() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.updateStepCompletion(this.currentStep.id, this.completed, () => {
        this.currentStepIndex++;
        this.completed = !!this.steps[this.currentStepIndex]?.is_completed;
      });
    }
  }

  previousStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.completed = !!this.steps[this.currentStepIndex]?.is_completed;
    }
  }

  updateStepCompletion(stepId: number, isCompleted: boolean, callback: () => void) {
    if (!this.currentUser) return;
    const url = `https://gdg-be.aarabi.live/api/core/steps/${stepId}/`;
    const body = { id: stepId, is_completed: isCompleted };
    this.currentUser.getIdToken().then(token => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      this.http.patch(url, body, { headers }).subscribe({
        next: () => {
          callback();
        },
        error: (err) => {
          alert('Failed to update step completion.');
          console.error(err);
        }
      });
    });
  }

  get currentStep(): Step {
    return this.steps[this.currentStepIndex];
  }
}

