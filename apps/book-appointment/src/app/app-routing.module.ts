import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { PatientHomeComponent } from './patient-home/patient-home.component';
import { AuthGuard } from './guard/auth.guard';
import { SignInComponent } from './sign-in/sign-in.component'

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot([
      {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full',
      },
      {
        path: 'sign-in',
        component: SignInComponent
      },
      {
        path: 'customer-home',
        component: PatientHomeComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'admin-home',
        component: AdminHomeComponent,
        canActivate: [AuthGuard]
      }
    ], {useHash: true})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
