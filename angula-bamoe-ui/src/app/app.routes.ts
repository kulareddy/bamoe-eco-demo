import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'enquiries',
    loadComponent: () => import('./features/enquiries/enquiry-list/enquiry-list.component').then(m => m.EnquiryListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'enquiries/new',
    loadComponent: () => import('./features/enquiries/enquiry-form/enquiry-form.component').then(m => m.EnquiryFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'enquiries/:id/edit',
    loadComponent: () => import('./features/enquiries/enquiry-form/enquiry-form.component').then(m => m.EnquiryFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'enquiries/:id',
    loadComponent: () => import('./features/enquiries/enquiry-detail/enquiry-detail.component').then(m => m.EnquiryDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tasks',
    loadComponent: () => import('./features/tasks/task-list/task-list.component').then(m => m.TaskListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/user-profile.component').then(m => m.UserProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];