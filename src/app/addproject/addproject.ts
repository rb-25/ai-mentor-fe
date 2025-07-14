import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

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
    field: ''
  };

  constructor(private http: HttpClient) {}

  submitProject() {
    const url = 'https://gdg-be.aarabi.live/api/core/project';
    this.http.post(url, this.project).subscribe({
      next: response => {
        alert('Project created successfully!');
        this.project = { name: '', description: '', field: '' };
      },
      error: err => {
        alert('Failed to create project.');
        console.error(err);
      }
    });
  }
}

