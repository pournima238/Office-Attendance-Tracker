import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;

  onLogin() {
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        const { access_token, user } = res.data.login;
        localStorage.setItem('access_token', access_token);
        this.authService.currentUser.set(user);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        alert('Login failed: ' + err.message);
      }
    });
  }
}