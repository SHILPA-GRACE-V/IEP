import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(credentials: { ssoId: string; password: string }): Observable<any> {
    return this.http.post('http://localhost:3000/api/login', credentials);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
