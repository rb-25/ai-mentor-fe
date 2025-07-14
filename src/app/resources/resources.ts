import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

interface Resource {
  resource: string;
  interest: string;
}

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, HttpClientModule, RouterModule],
  templateUrl: './resources.html',
  styleUrls: ['./resources.css']
})
export class ResourcesComponent implements OnInit {
  resourcesByInterest: { [interest: string]: Resource[] } = {};
  loading = false;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchResources();
  }

  fetchResources() {
    this.loading = true;
    this.errorMessage = '';
    this.http.get<Resource[]>('https://gdg-be.aarabi.live/api/core/resources').subscribe({
      next: (data) => {
        this.resourcesByInterest = {};
        for (const res of data) {
          if (!this.resourcesByInterest[res.interest]) {
            this.resourcesByInterest[res.interest] = [];
          }
          this.resourcesByInterest[res.interest].push(res);
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load resources.';
        this.loading = false;
      }
    });
  }
}
