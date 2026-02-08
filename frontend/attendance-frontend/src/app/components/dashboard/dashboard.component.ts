import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  viewDate = signal(new Date());
  daysInMonth = signal<Date[]>([]);
  serverData = signal<Map<string, string>>(new Map());
  modifiedData = signal<Map<string, string>>(new Map());
  isLoading = signal(false);
  
  // Rules and Stats
  officeGoal = 12;
  officeDaysCount = computed(() => {
    let count = 0;
    this.daysInMonth().forEach(day => {
      if (this.getDisplayType(day) === 'OFFICE') count++;
    });
    return count;
  });

 isSaveDisabled = computed(() => this.modifiedData().size === 0 || this.isLoading());

  constructor() {
    effect(() => {
      this.generateCalendar();
      this.fetchAttendance();
    });
  }

  ngOnInit() {}

  generateCalendar() {
    const date = this.viewDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysCount }, (_, i) => new Date(year, month, i + 1));
    this.daysInMonth.set(days);
  }

  fetchAttendance() {
    const date = this.viewDate();
    const m = date.getMonth();
    const y = date.getFullYear();

    this.auth.getAttendance(m, y).subscribe({
      next: (result: any) => {
        const dataMap = new Map();
        result.data.getMyAttendance.forEach((record: any) => {
          const key = new Date(record.date).toLocaleDateString('en-CA');
          dataMap.set(key, record.type);
        });
        this.serverData.set(dataMap);
      },
      error: (err) => console.error('Fetch error:', err),
    });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-CA');
  }

  isToday(date: Date): boolean {
    return this.formatDate(date) === this.formatDate(new Date());
  }

  getDisplayType(day: Date): string {
    const key = this.formatDate(day);
    return this.modifiedData().get(key) || this.serverData().get(key) || 'NONE';
  }

  // Dynamic class helper for colors
  getDayClasses(day: Date) {
    const type = this.getDisplayType(day);
    const key = this.formatDate(day);
    return {
      'today': this.isToday(day),
      'is-modified': this.modifiedData().has(key),
      [`type-${type.toLowerCase()}`]: true
    };
  }

  onTypeChange(day: Date, event: any) {
    const key = this.formatDate(day);
    const newValue = event.target.value;
    const originalValue = this.serverData().get(key) || 'NONE';
    const newMap = new Map(this.modifiedData());
    
    if (newValue === originalValue) {
      newMap.delete(key);
    } else {
      newMap.set(key, newValue);
    }
    this.modifiedData.set(newMap);
  }

  changeMonth(delta: number) {
    const current = new Date(this.viewDate());
    current.setMonth(current.getMonth() + delta);
    this.viewDate.set(current);
    this.modifiedData.set(new Map());
  }

  saveChanges() {
    const payload = Array.from(this.modifiedData().entries())
      .map(([date, type]) => ({ date, type }))
      .filter((item) => item.type !== 'NONE');

    this.auth.saveMonthlyAttendance(payload).subscribe({
      next: (res) => {
        const updatedMap = new Map(this.serverData());
        payload.forEach((item) => updatedMap.set(item.date, item.type));
        this.serverData.set(updatedMap);
        this.modifiedData.set(new Map());
        this.isLoading.set(false);
        alert('Attendance saved successfully!');
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error:', err)},
    });
  }
}