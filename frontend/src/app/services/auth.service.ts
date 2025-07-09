import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

interface LoginResponse {
  token?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(credentials: { ssoId: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('http://localhost:3000/api/login', credentials).pipe(
      catchError(error => {
        // Log or handle error if needed
        console.error('Login failed', error);
        return of({ message: 'Login failed. Please try again.' });
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
