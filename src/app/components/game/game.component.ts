import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatService } from '../../services/cat.service';
import { Cat } from '../../models/cat.model';
import { KeyboardComponent } from '../keyboard/keyboard.component';

interface LetterState {
  letter: string;
  state: 'correct' | 'present' | 'absent' | 'empty';
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, KeyboardComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit {
  cat: Cat | null = null;
  currentGuess: string = '';
  guesses: LetterState[][] = [];
  maxAttempts: number = 6;
  gameOver: boolean = false;
  won: boolean = false;
  loading: boolean = true;
  error: string = '';
  usedLetters: Map<string, 'correct' | 'present' | 'absent'> = new Map();

  // Navegação entre dias
  selectedDate: string = '';
  isToday: boolean = true;
  availableDates: string[] = [];
  todayCompleted: boolean = false;

  // Mobile
  isMobile: boolean = false;
  showDonateModal: boolean = false;
  @ViewChild('mobileInput') mobileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private catService: CatService,
  ) {}

  ngOnInit(): void {
    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.selectedDate = this.getTodayStr();
    this.checkTodayCompleted();
    this.loadCat();
    this.loadAvailableDates();
  }

  private checkTodayCompleted(): void {
    const savedGuesses = localStorage.getItem(this.getStorageKey(this.getTodayStr()));
    if (!savedGuesses) return;
    const guesses: LetterState[][] = JSON.parse(savedGuesses);
    if (guesses.length >= this.maxAttempts) {
      this.todayCompleted = true;
    }
    // Se ganhou em qualquer tentativa
    if (guesses.length > 0) {
      const lastGuess = guesses[guesses.length - 1];
      const allCorrect = lastGuess.every(l => l.state === 'correct');
      if (allCorrect) {
        this.todayCompleted = true;
      }
    }
  }

  private getTodayStr(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  private getStorageKey(date: string): string {
    return 'guesses_' + date;
  }

  loadAvailableDates(): void {
    this.catService.getAvailableDates().subscribe({
      next: (dates) => {
        this.availableDates = dates;
      },
      error: () => {}
    });
  }

  loadCat(): void {
    this.loading = true;
    this.resetGameState();

    const today = this.getTodayStr();
    this.isToday = this.selectedDate === today;

    const obs = this.isToday
      ? this.catService.getCat()
      : this.catService.getCatByDate(this.selectedDate);

    obs.subscribe({
      next: (cat) => {
        this.cat = cat;
        this.loading = false;
        this.error = '';
        if (cat) {
          this.restoreGuesses();
        } else {
          this.error = 'Nenhum gato disponivel para esta data.';
        }
      },
      error: (err) => {
        this.error = 'Erro ao carregar o gato. Verifique se o backend esta rodando.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private resetGameState(): void {
    this.cat = null;
    this.currentGuess = '';
    this.guesses = [];
    this.gameOver = false;
    this.won = false;
    this.usedLetters = new Map();
    this.error = '';
  }

  private restoreGuesses(): void {
    if (!this.cat) return;
    const savedGuesses = localStorage.getItem(this.getStorageKey(this.selectedDate));
    if (savedGuesses) {
      this.guesses = JSON.parse(savedGuesses);
      this.guesses.forEach(guessArray => this.updateUsedLetters(guessArray));
      const lastGuess = this.guesses[this.guesses.length - 1];
      const guess = lastGuess.map(l => l.letter).join('');
      const target = this.cat.nome.toUpperCase();
      if (guess === target) {
        this.gameOver = true;
        this.won = true;
      } else if (this.guesses.length >= this.maxAttempts) {
        this.gameOver = true;
        this.won = false;
      }
    }
  }

  goToPreviousDay(): void {
    const idx = this.availableDates.indexOf(this.selectedDate);
    if (idx > 0) {
      this.selectedDate = this.availableDates[idx - 1];
      this.loadCat();
    }
  }

  goToNextDay(): void {
    const idx = this.availableDates.indexOf(this.selectedDate);
    if (idx < this.availableDates.length - 1) {
      this.selectedDate = this.availableDates[idx + 1];
      this.loadCat();
    }
  }

  goToToday(): void {
    this.selectedDate = this.getTodayStr();
    this.loadCat();
  }

  canGoPrevious(): boolean {
    const idx = this.availableDates.indexOf(this.selectedDate);
    return idx > 0;
  }

  canGoNext(): boolean {
    const idx = this.availableDates.indexOf(this.selectedDate);
    return idx < this.availableDates.length - 1 && this.availableDates[idx + 1] <= this.getTodayStr();
  }

  formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  focusMobileInput(): void {
    if (this.isMobile && this.mobileInput && !this.gameOver) {
      this.mobileInput.nativeElement.focus();
    }
  }

  onMobileInput(event: Event): void {
    if (!this.cat || this.gameOver) return;
    const input = (event.target as HTMLInputElement);
    const value = input.value.toUpperCase().replace(/[^A-Z]/g, '');

    if (value.length <= this.cat.char_numero) {
      this.currentGuess = value;
    } else {
      this.currentGuess = value.slice(0, this.cat.char_numero);
    }
    // Manter o input sincronizado
    input.value = this.currentGuess;
  }

  onMobileKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submitGuess();
    }
  }

  onInputChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value.toUpperCase();
    if (this.cat && input.length <= this.cat.char_numero) {
      this.currentGuess = input;
    }
  }

  submitGuess(): void {
    if (!this.cat || this.gameOver) return;

    const guess = this.currentGuess.toUpperCase();
    const target = this.cat.nome.toUpperCase();

    if (guess.length !== this.cat.char_numero) {
      alert(`O nome tem ${this.cat.char_numero} letras!`);
      return;
    }

    const guessArray: LetterState[] = [];
    const targetLetters = target.split('');
    const guessLetters = guess.split('');
    const used: boolean[] = new Array(target.length).fill(false);

    // Primeira passagem: marcar letras corretas
    for (let i = 0; i < guessLetters.length; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        guessArray.push({ letter: guessLetters[i], state: 'correct' });
        used[i] = true;
      } else {
        guessArray.push({ letter: guessLetters[i], state: 'absent' });
      }
    }

    // Segunda passagem: marcar letras presentes
    for (let i = 0; i < guessLetters.length; i++) {
      if (guessArray[i].state === 'correct') continue;

      const foundIndex = targetLetters.findIndex((letter, idx) =>
        letter === guessLetters[i] && !used[idx]
      );

      if (foundIndex !== -1) {
        guessArray[i].state = 'present';
        used[foundIndex] = true;
      }
    }

    this.guesses.push(guessArray);
    localStorage.setItem(this.getStorageKey(this.selectedDate), JSON.stringify(this.guesses));

    // Atualizar letras usadas para o teclado
    this.updateUsedLetters(guessArray);

    // Verificar vitoria
    if (guess === target) {
      this.gameOver = true;
      this.won = true;
      if (this.isToday) this.todayCompleted = true;
    } else if (this.guesses.length >= this.maxAttempts) {
      this.gameOver = true;
      this.won = false;
      if (this.isToday) this.todayCompleted = true;
    }

    this.currentGuess = '';
    if (this.isMobile && this.mobileInput) {
      this.mobileInput.nativeElement.value = '';
    }
  }

  getRemainingAttempts(): number {
    return this.maxAttempts - this.guesses.length - (this.gameOver ? 0 : 1);
  }

  // Metodos para o teclado virtual
  onLetterClick(letter: string): void {
    if (this.cat && this.currentGuess.length < this.cat.char_numero && !this.gameOver) {
      this.currentGuess += letter;
    }
  }

  onBackspaceClick(): void {
    if (this.currentGuess.length > 0) {
      this.currentGuess = this.currentGuess.slice(0, -1);
    }
  }

  onEnterClick(): void {
    this.submitGuess();
  }

  openAdoptionLink(): void {
    if (this.cat && this.cat.url_adocao) {
      window.open(this.cat.url_adocao, '_blank', 'noopener');
    }
  }

  // Suporte a teclado fisico
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.gameOver || !this.cat) return;

    const key = event.key.toUpperCase();

    // Letras A-Z
    if (/^[A-Z]$/.test(key)) {
      event.preventDefault();
      this.onLetterClick(key);
    }
    // Enter
    else if (key === 'ENTER') {
      event.preventDefault();
      this.onEnterClick();
    }
    // Backspace
    else if (key === 'BACKSPACE') {
      event.preventDefault();
      this.onBackspaceClick();
    }
  }

  private updateUsedLetters(guessArray: LetterState[]): void {
    guessArray.forEach(letterState => {
      const currentState = this.usedLetters.get(letterState.letter);

      // Prioridade: correct > present > absent
      if (letterState.state === 'correct') {
        this.usedLetters.set(letterState.letter, 'correct');
      } else if (letterState.state === 'present' && currentState !== 'correct') {
        this.usedLetters.set(letterState.letter, 'present');
      } else if (!currentState) {
        this.usedLetters.set(letterState.letter, letterState.state as 'absent');
      }
    });
  }
}
