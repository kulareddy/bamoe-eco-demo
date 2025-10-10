import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from './core/services/auth.service';
import { UserInfo } from './core/models/auth-config.model';
import { NavigationComponent } from './shared/components/navigation/navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    NavigationComponent
  ],
  template: `
    <div class="app-container">
      <ng-container *ngIf="isAuthenticated; else loginLayout">
        <app-navigation>
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </app-navigation>
      </ng-container>
      
      <ng-template #loginLayout>
        <div class="login-layout">
          <mat-toolbar color="primary">
            <mat-icon>business</mat-icon>
            <span>Enquiry Process Management</span>
            <div class="toolbar-spacer"></div>
            <button mat-button (click)="login()">
              <mat-icon>login</mat-icon>
              Login
            </button>
          </mat-toolbar>
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .login-layout {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .main-content {
      flex: 1;
      overflow: auto;
    }

    mat-toolbar {
      gap: 16px;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Enquiry Process Management';
  isAuthenticated = false;
  userInfo: UserInfo | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.onAuthStateChanged()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
        if (isAuth) {
          this.authService.getUserInfo()
            .pipe(takeUntil(this.destroy$))
            .subscribe(userInfo => {
              this.userInfo = userInfo;
            });
        } else {
          this.userInfo = null;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }
}