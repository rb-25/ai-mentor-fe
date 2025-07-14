import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-interests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interests.html',
  styleUrls: ['./interests.css']
})
export class InterestsComponent {
  interests = [
    { label: 'Web Development', icon: '🌐' },
    { label: 'AI & Machine Learning', icon: '🤖' },
    { label: 'App Development', icon: '📱' },
    { label: 'UI/UX Design', icon: '🎨' },
    { label: 'Cybersecurity', icon: '🛡️' },
    { label: 'Cloud & DevOps', icon: '☁️' },
    { label: 'Game Development', icon: '🎮' },
    { label: 'Data Science', icon: '📊' }
  ];

  selected: Set<string> = new Set();

  constructor(private router: Router) {}

  toggleInterest(label: string) {
    this.selected.has(label)
      ? this.selected.delete(label)
      : this.selected.add(label);
  }

  next() {
    console.log('Selected interests:', Array.from(this.selected));
    this.router.navigate(['/dashboard']);
  }
}

