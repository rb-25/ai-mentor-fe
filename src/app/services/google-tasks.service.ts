import { Injectable } from '@angular/core';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase.config';

declare var gapi: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleTasksService {
  private gapiInitialized = false;
  private currentUser: User | null = null;

  constructor() {
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        console.log("User is signed in:", user.uid);
      } else {
        console.log("User is signed out.");
      }
    });
  }

  // Initialize the Google API client and load the Tasks API
  async initGoogleTasksApi(accessToken: string, clientId: string): Promise<boolean> {
    if (this.gapiInitialized) {
      console.log("gapi already initialized.");
      return true;
    }

    try {
      // Ensure gapi is loaded before proceeding
      await new Promise(resolve => gapi.load('client', resolve));

      await gapi.client.init({
        clientId: clientId,
        scope: 'https://www.googleapis.com/auth/tasks',
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest"]
      });

      // Set the access token obtained from Firebase
      gapi.client.setToken({ access_token: accessToken });

      // Load the Google Tasks API
      await gapi.client.load('tasks', 'v1');

      console.log('Google Tasks API loaded and client initialized.');
      this.gapiInitialized = true;
      return true;

    } catch (error: any) {
      console.error('Error initializing Google Tasks API:', error);
      if (error.result && error.result.error && error.result.error.code === 401) {
        console.error("Access token expired or invalid. Please re-authenticate.");
      }
      return false;
    }
  }

  // Sign in with Google and get access token
  async signInWithGoogle(): Promise<{ user: User; accessToken: string } | null> {
    try {
      const provider = new GoogleAuthProvider();
      // Add the Google Tasks API scope
      provider.addScope('https://www.googleapis.com/auth/tasks');

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (accessToken) {
        console.log("Signed in successfully!", user);
        console.log("Google Access Token:", accessToken);
        return { user, accessToken };
      } else {
        console.error('No access token found in Google sign-in result.');
        return null;
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  // List all task lists
  async listTaskLists(): Promise<any[]> {
    if (!this.gapiInitialized) {
      console.error("Google Tasks API not initialized. Please sign in first.");
      return [];
    }

    try {
      const response = await gapi.client.tasks.tasklists.list();
      const taskLists = response.result.items || [];
      console.log('Your Task Lists:', taskLists);
      return taskLists;
    } catch (error) {
      console.error('Error listing task lists:', error);
      return [];
    }
  }

  // Add a task to a specific task list
  async addTask(taskListId: string, taskTitle: string, notes?: string, dueDate?: Date): Promise<any> {
    if (!this.gapiInitialized) {
      console.error("Google Tasks API not initialized. Please sign in first.");
      return null;
    }

    try {
      const taskData: any = {
        title: taskTitle,
        notes: notes || "Added from my Firebase integrated app."
      };

      if (dueDate) {
        taskData.due = dueDate.toISOString();
      }

      const response = await gapi.client.tasks.tasks.insert({
        taskList: taskListId,
        resource: taskData
      });

      console.log('Task added successfully:', response.result);
      return response.result;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  // Get tasks from a specific task list
  async getTasks(taskListId: string): Promise<any[]> {
    if (!this.gapiInitialized) {
      console.error("Google Tasks API not initialized. Please sign in first.");
      return [];
    }

    try {
      const response = await gapi.client.tasks.tasks.list({
        tasklist: taskListId
      });
      const tasks = response.result.items || [];
      console.log('Tasks in list:', tasks);
      return tasks;
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  // Update a task
  async updateTask(taskListId: string, taskId: string, updates: any): Promise<any> {
    if (!this.gapiInitialized) {
      console.error("Google Tasks API not initialized. Please sign in first.");
      return null;
    }

    try {
      const response = await gapi.client.tasks.tasks.patch({
        tasklist: taskListId,
        task: taskId,
        resource: updates
      });

      console.log('Task updated successfully:', response.result);
      return response.result;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(taskListId: string, taskId: string): Promise<boolean> {
    if (!this.gapiInitialized) {
      console.error("Google Tasks API not initialized. Please sign in first.");
      return false;
    }

    try {
      await gapi.client.tasks.tasks.delete({
        tasklist: taskListId,
        task: taskId
      });

      console.log('Task deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // Check if API is initialized
  isInitialized(): boolean {
    return this.gapiInitialized;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }
} 