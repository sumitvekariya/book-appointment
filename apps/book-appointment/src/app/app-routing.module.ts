import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot([
      {
        path: 'sign-in',
        component: SignInComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
