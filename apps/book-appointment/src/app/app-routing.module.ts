import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomerHomeComponent } from './customer-home/customer-home.component';
import { SignInComponent } from './sign-in/sign-in.component'

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot([
      {
        path: 'sign-in',
        component: SignInComponent
      },
      {
        path: 'customer-home',
        component: CustomerHomeComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
