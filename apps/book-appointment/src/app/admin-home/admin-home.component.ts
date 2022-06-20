import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ApiService } from '../shared/api.service';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { Router } from '@angular/router';
interface slot {
  startTime: string;
  endTime: string;
  isSelected: boolean;
  isBooked: number;
}

interface bookedSlots {
  name: string;
  startTime: string;
  endTime: string;
  category: string;
  originalDate: string;
}

interface searchParam {
  category?: string;
  name?: string;
}
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'MM-DD-YYYY'
  },
};


@Component({
  selector: 'book-appointmnet-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss'],
  providers: [
    {
        provide: MAT_DATE_FORMATS,
        useValue: MY_DATE_FORMATS
    }
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AdminHomeComponent implements OnInit {

  todayDate!: string;
  date = new FormControl();
  DateFormGroup!: UntypedFormGroup;
  categories: string[] = [];
  disabled = true;
  categorySelected = false;
  selectedDate!: string;
  value = '';
  dataSource: bookedSlots[] = [];
  displayedColumns: string[] = ['name', 'email', 'date', 'slot', 'category'];
  expandedElement: bookedSlots | null = null;
  startDate!: string;
  endDate!: string;

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.todayDate = moment().format('YYYY-MM-DD');
    this.date.setValue(this.todayDate);

    this.startDate = this.todayDate;
    this.endDate = this.todayDate;
    this.DateFormGroup = new UntypedFormGroup({
      date: new FormControl(this.todayDate, [Validators.required]),
      email: new FormControl(''),
      endDate: new FormControl(this.todayDate, [Validators.required]),
      category: new FormControl(''),
    });
    this.getBookedSlots();
    this.getCategories();
  }

  getBookedSlots(params: any = null) {
    this.apiService.getReqWithToken('/appointments', { ...params, date: this.startDate, endDate: this.endDate }).then((data: any) => {
      this.dataSource = data.data;
    }).catch(err => {
      console.log(err)
      if (err.status == 401) {
        this.router.navigate(['sign-in'])
      }
      // this.toastr.error(err.message);
    })
  }

  dateChange(event: any) {
    if (this.DateFormGroup.value.date && this.DateFormGroup.value.endDate) {
      this.startDate = moment(this.DateFormGroup.value.date).format('YYYY-MM-DD');
      this.endDate = moment(this.DateFormGroup.value.endDate).format('YYYY-MM-DD');
      this.getBookedSlots();
    }
  }

  inputChange(event: any) {
    this.getBookedSlots({ name: this.value });
  }

  clearSearch() {
    this.value = '';
    this.getBookedSlots();
  }

  getCategories() {
    this.apiService.getReqWithToken('/categories').then((data: any) => {
      this.categories = data.data;
    }).catch(err => {
      console.log(err)
      this.toastr.error(err.message);
    })
  }

  selectionChange(event: any) {
    let params: searchParam = {};
    if (this.value) {
      params['name'] = this.value
    }
    if (event.value) {
      params['category'] = event.value;
      this.getBookedSlots(params);
    } else {
      this.getBookedSlots(params);
    }
  }

}
