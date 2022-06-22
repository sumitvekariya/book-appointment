import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ApiService } from '../shared/api.service';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { MatChip } from '@angular/material/chips';
import { Router } from '@angular/router';

interface slot {
  startTime: string;
  endTime: string;
  isSelected: boolean;
  isBooked: number;
  isNoonSlot?: number;
  isMorningSlot?: number;
  isEveningSlot?: number;
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
  selector: 'book-appointmnet-customer-home',
  templateUrl: './patient-home.component.html',
  styleUrls: ['./patient-home.component.scss']
})
export class PatientHomeComponent implements OnInit {

  todayDate!: string;
  date = new FormControl();
  DateFormGroup!: UntypedFormGroup;
  slots: slot[] = [];
  categories: string[] = [];
  disabled = true;
  categorySelected = false;
  selectedSlot?: slot;
  selectedDate!: string;
  morningSlot: slot[] = [];
  noonSlot: slot[] = [];
  eveningSlot: slot[] = [];
  selectedChip?: slot;

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.todayDate = moment().format('YYYY-MM-DD');
    this.date.setValue(this.todayDate);

    this.selectedDate = this.todayDate;
    this.DateFormGroup = new UntypedFormGroup({
      date: new FormControl(this.todayDate, [Validators.required]),
      category: new FormControl('', [Validators.required])
    });
    this.getCategories();
    this.getSlots(this.todayDate);
  }

  dateChange(event: any) {
    const date = moment(event.value).format('YYYY-MM-DD');
    this.selectedDate = date;
    this.getSlots(date);
  }

  getSlots(date: string) {
    this.apiService.postReqWithToken('/slots', { date }).then((data: any) => {
      this.slots = data.data;
      this.morningSlot = [];
      this.noonSlot = [];
      this.eveningSlot = [];
      this.slots.map((obj: any) => {
        obj.isSelected = false;
        if (obj.isMorningSlot) {
          this.morningSlot.push(obj);
        }
        if (obj.isNoonSlot) {
          this.noonSlot.push(obj);
        }
        if (obj.isEveningSlot) {
          this.eveningSlot.push(obj);
        }
    });
    }).catch(err => {
      console.log(err)
      this.toastr.error(err.message);
    })
  }

  onChipClick(chip: MatChip, option: any, index: number, type: string) {
    if (option.isBooked === 0) {
      this.selectedSlot = option;
    }

  }

  getCategories() {
    this.apiService.getReqWithToken('/categories').then((data: any) => {
      this.categories = data.data;
    }).catch(err => {
      console.log(err)
      this.toastr.error(err.message);
    })
  }

  selectionChange() {
    this.categorySelected = true;
    const found = this.slots.find(obj => obj.isSelected);
    if (found) {
      this.disabled = false;
    }
  }
  bookAppointment() {
    const payload = {
      startTime: this.selectedSlot?.startTime,
      endTime: this.selectedSlot?.endTime,
      category: this.DateFormGroup.value.category
    }

    this.apiService.postReqWithToken('/book/slot', payload).then((data: any) => {
      this.toastr.success(data.message);
      this.getSlots(this.selectedDate);
    }).catch(err => {
      console.log(err)
      this.toastr.error(err.message);
    })
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.router.navigate(['sign-in']);
  }
}
