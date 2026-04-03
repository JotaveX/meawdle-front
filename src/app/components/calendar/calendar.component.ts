import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasGame: boolean;
  isFuture: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnChanges {
  @Input() availableDates: string[] = [];
  @Input() selectedDate: string = '';
  @Output() dateSelected = new EventEmitter<string>();

  viewYear: number = 0;
  viewMonth: number = 0;
  weeks: CalendarDay[][] = [];
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  private today: Date = new Date();
  todayStr: string = '';
  private availableSet: Set<string> = new Set();

  constructor() {
    this.todayStr = this.formatDate(this.today);
    this.viewYear = this.today.getFullYear();
    this.viewMonth = this.today.getMonth();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['availableDates']) {
      this.availableSet = new Set(this.availableDates);
    }
    if (changes['selectedDate'] && this.selectedDate) {
      const [y, m] = this.selectedDate.split('-').map(Number);
      this.viewYear = y;
      this.viewMonth = m - 1;
    }
    this.buildCalendar();
  }

  prevMonth(): void {
    if (this.viewMonth === 0) {
      this.viewMonth = 11;
      this.viewYear--;
    } else {
      this.viewMonth--;
    }
    this.buildCalendar();
  }

  nextMonth(): void {
    const nextDate = new Date(this.viewYear, this.viewMonth + 1, 1);
    if (nextDate > new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0)) {
      return;
    }
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear++;
    } else {
      this.viewMonth++;
    }
    this.buildCalendar();
  }

  canGoNextMonth(): boolean {
    return this.viewYear < this.today.getFullYear() ||
      (this.viewYear === this.today.getFullYear() && this.viewMonth < this.today.getMonth());
  }

  goToToday(): void {
    this.dateSelected.emit(this.todayStr);
  }

  selectDay(day: CalendarDay): void {
    if (!day.isCurrentMonth || day.isFuture || !day.hasGame) return;
    this.dateSelected.emit(this.formatDate(day.date));
  }

  get monthLabel(): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${months[this.viewMonth]} ${this.viewYear}`;
  }

  private buildCalendar(): void {
    const firstDay = new Date(this.viewYear, this.viewMonth, 1);
    const lastDay = new Date(this.viewYear, this.viewMonth + 1, 0);
    const startDay = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Previous month padding
    const prevMonthLast = new Date(this.viewYear, this.viewMonth, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(this.viewYear, this.viewMonth - 1, prevMonthLast.getDate() - i);
      days.push(this.createDay(d, false));
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(this.viewYear, this.viewMonth, d);
      days.push(this.createDay(date, true));
    }

    // Pad to always have 42 cells (6 weeks) for consistent height
    let nextDay = 1;
    while (days.length < 42) {
      const d = new Date(this.viewYear, this.viewMonth + 1, nextDay++);
      days.push(this.createDay(d, false));
    }

    // Split into weeks
    this.weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      this.weeks.push(days.slice(i, i + 7));
    }
  }

  private createDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const dateStr = this.formatDate(date);
    return {
      date,
      day: date.getDate(),
      isCurrentMonth,
      isToday: dateStr === this.todayStr,
      isSelected: dateStr === this.selectedDate,
      hasGame: this.availableSet.has(dateStr),
      isFuture: dateStr > this.todayStr,
    };
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
