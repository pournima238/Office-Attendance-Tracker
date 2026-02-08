import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  
  // State Management
  viewDate = signal(new Date());
  daysInMonth = signal<Date[]>([]);
  serverData = signal<Map<string, string>>(new Map());
  modifiedData = signal<Map<string, string>>(new Map());

  // Computed: Button only enabled if there are unsaved changes
  isSaveDisabled = computed(() => this.modifiedData().size === 0);

  constructor() {
    // Automatically re-run when viewDate changes
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
    this.auth.getAttendance(date.getMonth() + 1, date.getFullYear()).subscribe({
      next: (result: any) => {
        const dataMap = new Map();
        result.data.getMyAttendance.forEach((record: any) => {
          const key = this.formatDate(new Date(record.date));
          dataMap.set(key, record.type);
        });
        this.serverData.set(dataMap);
      }
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return this.formatDate(date) === this.formatDate(today);
  }

  getDisplayType(day: Date): string {
    const key = this.formatDate(day);
    return this.modifiedData().get(key) || this.serverData().get(key) || 'NONE';
  }

  onTypeChange(day: Date, event: any) {
    const key = this.formatDate(day);
    const newValue = event.target.value;
    const newMap = new Map(this.modifiedData());
    
    if (newValue === this.serverData().get(key)) {
      newMap.delete(key); // Remove if changed back to original
    } else {
      newMap.set(key, newValue);
    }
    this.modifiedData.set(newMap);
  }

  changeMonth(delta: number) {
    const current = new Date(this.viewDate());
    current.setMonth(current.getMonth() + delta);
    this.viewDate.set(current);
    this.modifiedData.set(new Map()); // Clear unsaved changes
  }

// ... inside DashboardComponent class

// saveChanges() {
//   const payload = Array.from(this.modifiedData().entries())
//     .map(([date, type]) => ({ date, type }))
//     // Only send values that exist in your Prisma AttendanceType enum
//     .filter(item => item.type !== 'NONE'); 

//   if (payload.length === 0) {
//     alert("No valid changes to save.");
//     return;
//   }

//   this.auth.saveMonthlyAttendance(payload).subscribe({
//     next: (res) => {
//       alert('Attendance saved successfully!');
//       this.modifiedData.set(new Map()); // Reset the "Save" button
//       this.fetchAttendance(); // Refresh the UI with data from DB
//     },
//     error: (err) => {
//       console.error('Check Network Tab for specific error:', err);
//       alert('Save failed. Check if you selected a valid option.');
//     }
//   });
// }

saveChanges() {
  const payload = Array.from(this.modifiedData().entries())
    .map(([date, type]) => ({ date, type }))
    .filter(item => item.type !== 'NONE');

  this.auth.saveMonthlyAttendance(payload).subscribe({
    next: (res) => {
      // 1. Create a fresh copy of current server data
      const updatedMap = new Map(this.serverData());
      
      // 2. Merge the saved changes into the server data map
      payload.forEach(item => {
        updatedMap.set(item.date, item.type);
      });

      // 3. Update the signal (this triggers the UI to re-evaluate)
      this.serverData.set(updatedMap);

      // 4. CRITICAL: Clear the modified data last
      this.modifiedData.set(new Map());
      
      alert('Attendance saved successfully!');
    },
    error: (err) => console.error('Error:', err)
  });
}
}