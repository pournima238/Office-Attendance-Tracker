import { HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<any>(null);

  constructor(private apollo: Apollo) {}

  login(email: string, pass: string) {
    const LOGIN_MUTATION = gql`
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          access_token
          user { id name email }
        }
      }
    `;
    return this.apollo.mutate({
      mutation: LOGIN_MUTATION,
      variables: { email, password: pass }
    });
  }

  register(email: string, name: string, pass: string) {

    const REGISTER_MUTATION = gql`
      mutation Register($email: String!, $name: String!, $password: String!) {
        register(email: $email, name: $name, password: $password) {
          id
          email
          name
        }
      }
    `;
    return this.apollo.mutate({
      mutation: REGISTER_MUTATION,
      variables: { email, name, password: pass }
    });
  }

  getAttendance(month: number, year: number) {
  const GET_ATTENDANCE = gql`
    query GetMyAttendance($month: Int!, $year: Int!) {
      getMyAttendance(month: $month, year: $year) {
        date
        type
      }
    }
  `;
  const token = localStorage.getItem('access_token');
  return this.apollo.query({
    query: GET_ATTENDANCE,
    variables: { month, year },
    context: {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    },
    fetchPolicy: 'network-only' // Ensures we get fresh data when switching months
  });
}

saveMonthlyAttendance(data: { date: string, type: string }[]) {
  const SAVE_MUTATION = gql`
    mutation saveMonthlyAttendance($data: [AttendanceInput!]!) {
      saveMonthlyAttendance(data: $data)
    }
  `;
  const token = localStorage.getItem('access_token');
  return this.apollo.mutate({
    mutation: SAVE_MUTATION,
    variables: { data },
    context: {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    }
  });
}

logout() {
  localStorage.clear(); 
  this.currentUser.set(null);
  window.location.href = '/login';
}
}