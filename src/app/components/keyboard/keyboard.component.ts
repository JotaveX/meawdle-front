import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-keyboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './keyboard.component.html',
  styleUrl: './keyboard.component.css'
})
export class KeyboardComponent {
  @Input() usedLetters: Map<string, 'correct' | 'present' | 'absent'> = new Map();
  @Output() letterClicked = new EventEmitter<string>();
  @Output() enterClicked = new EventEmitter<void>();
  @Output() backspaceClicked = new EventEmitter<void>();

  keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
  ];

  onKeyClick(key: string): void {
    if (key === 'ENTER') {
      this.enterClicked.emit();
    } else if (key === '⌫') {
      this.backspaceClicked.emit();
    } else {
      this.letterClicked.emit(key);
    }
  }

  getKeyClass(key: string): string {
    if (key === 'ENTER' || key === '⌫') {
      return 'special-key';
    }
    
    const state = this.usedLetters.get(key);
    if (state) {
      return state;
    }
    
    return '';
  }
}
