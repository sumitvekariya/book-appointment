import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ApiService } from '../shared/api.service';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import {animate, state, style, transition, trigger} from '@angular/animations';

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

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.todayDate = moment().format('YYYY-MM-DD');
    this.date.setValue(this.todayDate);

    this.selectedDate = this.todayDate;
    this.DateFormGroup = new UntypedFormGroup({
      date: new FormControl(this.todayDate, [Validators.required]),
      email: new FormControl(''),
    });
    this.getBookedSlots();
  }

  getBookedSlots(params: any = null) {
    this.apiService.getReqWithToken('/appointments', { ...params, date: this.selectedDate }).then((data: any) => {
      this.dataSource = data.data;
    }).catch(err => {
      console.log(err)
      this.toastr.error(err.message);
    })
  }

  dateChange(event: any) {
    const date = moment(event.value).format('YYYY-MM-DD');
    this.selectedDate = date;
    this.getBookedSlots();
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
