import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { SignInComponent } from './sign-in/sign-in.component';
import { MaterialModule } from './material.module';
import { ToastrModule } from 'ngx-toastr';
import { PatientHomeComponent } from './patient-home/patient-home.component';
import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import { AdminHomeComponent } from './admin-home/admin-home.component';

@NgModule({
  declarations: [AppComponent, SignInComponent, PatientHomeComponent, AdminHomeComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    AppRoutingModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      preventDuplicates: true
    })
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
