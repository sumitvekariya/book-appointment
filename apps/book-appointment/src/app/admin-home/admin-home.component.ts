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
  slots: slot[]
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
  slots: any[] = [];
  categories: any[] = [];
  disabled = true;
  categorySelected = false;
  selectedDate!: string;
  value = '';
  dataSource: bookedSlots[] = [];
  displayedColumns: string[] = ['name', 'email', 'date'];
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
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
      endDate: new FormControl(this.todayDate, [Validators.required])
    });
    this.getBookedSlots();
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

  selectionChange() {
    this.categorySelected = true;
    const found = this.slots.find(obj => obj.isSelected);
    if (found) {
      this.disabled = false;
    }
  }

  inputChange(event: any) {
    this.getBookedSlots({ name: this.value });
  }

  clearSearch() {
    this.value = '';
    this.getBookedSlots();
  }
}
