import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

// The only place that talks to the GraphQL API. Sends the token with every request.
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // Sends one GraphQL request. Returns the data, or throws the API's error message.
  async gql<T>(query: string, variables: any = {}): Promise<T> {
    try {
      const headers = new HttpHeaders({ Authorization: 'Bearer ' + (this.auth.token ?? '') });
      const res: any = await firstValueFrom(
        this.http.post(this.auth.base + '/graphql', { query, variables }, { headers }));
      if (res.errors) throw new Error(res.errors[0].message);
      return res.data as T;
    } catch (e: any) {
      if (e.status === 401) { this.auth.logout(); throw new Error('Session expired, please log in'); }
      throw e;
    }
  }
}
