import { Component, OnInit, HostListener } from '@angular/core';
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

  constructor(
    private catService: CatService,
  ) {}

  ngOnInit(): void {
    this.loadCat();
  }

  loadCat(): void {
    this.loading = true;
    const service = this.catService;
    
    service.getCat().subscribe({
      next: (cat) => {
        this.cat = cat;
        this.loading = false;
        this.error = '';
        this.setGuessesLocalStorage();
      },
      error: (err) => {
        this.error = 'Erro ao carregar o gato. Verifique se o backend está rodando.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  setGuessesLocalStorage(): void {
    if (this.cat) {
      const savedGuesses = localStorage.getItem('guesses' + (new Date().getDay()) + (new Date().getMonth()) + (new Date().getFullYear()));
      if (savedGuesses) {
        this.guesses = JSON.parse(savedGuesses);
        this.guesses.forEach(guessArray => this.updateUsedLetters(guessArray));
        const lastGuess = this.guesses[this.guesses.length - 1];
        const guess = lastGuess.map(l => l.letter).join('');
        const target = this.cat.nome.toUpperCase();
        if (guess === target) {
        this.gameOver = true;
        this.won = true;
      }
      }
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
    localStorage.setItem('guesses' + (new Date().getDay()) + (new Date().getMonth()) + (new Date().getFullYear()), JSON.stringify(this.guesses));

    // Atualizar letras usadas para o teclado
    this.updateUsedLetters(guessArray);
    
    // Verificar vitória
    if (guess === target) {
      this.gameOver = true;
      this.won = true;
    } else if (this.guesses.length >= this.maxAttempts) {
      this.gameOver = true;
      this.won = false;
    }

    this.currentGuess = '';
  }

  getRemainingAttempts(): number {
    return this.maxAttempts - this.guesses.length - (this.gameOver ? 0 : 1);
  }

  // Métodos para o teclado virtual
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

  // Suporte a teclado físico
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
