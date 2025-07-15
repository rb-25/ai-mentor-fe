import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing';
import { Signup } from './signup/signup';
import { Login } from './login/login';
import { InterestsComponent } from './interests/interests';
import { ExperienceComponent } from './experience/experience';
import { ResourcesComponent } from './resources/resources';
import { ProjectsComponent } from './projects/projects';
import { StepsComponent } from './steps/steps';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'landing', component: LandingComponent },
  { path: 'signup', component: Signup },
  { path: 'login', component: Login },
  { path: 'interests', component: InterestsComponent },
  { path: 'experience', component: ExperienceComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'projects', component: ProjectsComponent },
  {path: 'steps', component: StepsComponent},
  { path: 'project/:id/confirm', component: StepsComponent },
];
