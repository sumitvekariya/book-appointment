import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})

export class ApiService {
  URL = environment.endPoint; // endpoint URL
  token: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  async getToken() {
    this.token = localStorage.getItem('authorization');
    if (!this.token) {
      this.router.navigate(['sign-in'])
    }
  }

  private getHeaderWithOutToken() {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    return headers;
  }

  private async getHeaderWithToken() {
    await this.getToken();
    const headers = new HttpHeaders()
      .set('Authorization', this.token)
      .set('Content-Type', 'application/json');
    return headers;
  }

  async postReqWithOutToken(path: any, obj: any) {
    return new Promise(async (resolve, reject) => {
      return this.http.post<any>(this.URL + path, obj, { headers: this.getHeaderWithOutToken() }).subscribe((success => {
        resolve(success)
      }),
      (err => {
        reject(err)
      }))
    });
  }

  async postReqWithToken(path: any, obj: any) {
    return new Promise(async (resolve, reject) => {
      this.http.post<any>(this.URL + path, obj, { headers: await this.getHeaderWithToken() }).subscribe((success => {
        resolve(success)
      }),
      (err => {
        reject(err)
      }))
    });
  }

  async getReqWithToken(path: any, params?: any) {
    return new Promise(async (resolve, reject) => {
      this.http.get(`${this.URL}${path}`, { params, headers: await this.getHeaderWithToken() }).subscribe((success => {
        resolve(success)
      }),
      (err => {
        reject(err)
      }))
    });
  }

}