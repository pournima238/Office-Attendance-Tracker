import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body as any;
        if (body && body.errors && Array.isArray(body.errors)) {
          const isUnauthorized = body.errors.some(
            (err: any) =>
              err.message === 'Unauthorized' ||
              err.extensions?.code === 'UNAUTHENTICATED' ||
              err.message?.toLowerCase().includes('unauthorized'),
          );
          if (isUnauthorized) {
            console.warn(
              'Security: Unauthorized GraphQL request detected. Redirecting...',
            );
            localStorage.clear(); // Wipe the fake token and junk data
            router.navigate(['/login']);
          }
        }
      }
    }),
  );
};
