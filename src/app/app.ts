import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProjectsComponent } from './projects/projects';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('my-app');
}
