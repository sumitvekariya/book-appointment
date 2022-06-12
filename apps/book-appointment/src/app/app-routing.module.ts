import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { CustomerHomeComponent } from './customer-home/customer-home.component';
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
        component: CustomerHomeComponent
      },
      {
        path: 'admin-home',
        component: AdminHomeComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
