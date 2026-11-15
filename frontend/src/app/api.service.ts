import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// The only place that talks to the backend. Every page calls gql().
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  // Use the port shown in the console when you run "dotnet run" ("Now listening on").
  private url = 'http://localhost:5189/graphql';

  // Sends one GraphQL request. Returns the data, or throws the API's error message.
  async gql<T>(query: string, variables: any = {}): Promise<T> {
    const res: any = await firstValueFrom(this.http.post(this.url, { query, variables }));
    if (res.errors) throw new Error(res.errors[0].message);
    return res.data as T;
  }
}
