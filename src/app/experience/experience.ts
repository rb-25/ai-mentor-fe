import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-experience-level',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience.html',
  styleUrls: ['./experience.css']
})
export class ExperienceComponent {
  levels = [
    { label: 'Beginner', icon: '🐣' },
    { label: 'Intermediate', icon: '⚙️' },
    { label: 'Advanced', icon: '🚀' }
  ];

  selected: string | null = null;

  constructor(private router: Router) {}

  selectLevel(level: string) {
    this.selected = level;
  }

  next() {
    if (!this.selected) {
      this.router.navigate(['/projects']);
      return;
    }
    try {
      this.router.navigate(['/projects']);
    } catch (err) {
      this.router.navigate(['/projects']);
    }
  }
}
