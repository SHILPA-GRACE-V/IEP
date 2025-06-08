import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputsModule, ButtonsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  loginForm = this.fb.group({
  ssoId: ['', [Validators.required, Validators.email]],
  password: ['', Validators.required],
  rememberMe: [false]
});


  onSubmit() {
  if (this.loginForm.valid) {
    const { ssoId, password, rememberMe } = this.loginForm.value;

    this.auth.login({ ssoId: ssoId!, password: password! }).subscribe(res => {
      if (res.token) {
        localStorage.setItem('token', res.token);
        if (rememberMe) {
          localStorage.setItem('ssoId', ssoId!); // or save credentials/token securely
        }
        this.router.navigate(['/dashboard']);
      } else {
        alert('Invalid credentials');
      }
    });
  }
}

}
