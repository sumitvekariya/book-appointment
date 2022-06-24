import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ApiService } from '../shared/api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
@Component({
  selector: 'book-appointmnet-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {

  signInForm!: UntypedFormGroup;
  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.signInForm = new UntypedFormGroup({
      email: new FormControl<string>('', [Validators.required, Validators.email]),
      password: new FormControl<string>('', [Validators.required]),
    })
  }

  onSubmit() {
    this.apiService.postReqWithOutToken('/login', this.signInForm.value).then((data: any) => {
      localStorage.setItem('authorization', data.data.token);
      localStorage.setItem('username', data.data.name);
      this.toastr.success(data.message);
      if (data.data.role === 'user') {
        this.router.navigate(['customer-home']);
      } else {
        this.router.navigate(['admin-home']);
      }
    }).catch(err => {
      console.log(err)
      this.toastr.error(err.error.message);
    })
  }
}
