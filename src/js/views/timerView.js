// COMPLETE AND MODIFIED CODE FOR: src/js/views/timerView.js

import View from './View.js';
import icons from 'url:../../img/icons.svg';
// NEW: 1. Import the sound file. Make sure the path and name are correct.
import timerSound from 'url:../../img/timer-done.mp3';

class TimerView extends View {
  _parentElement = document.querySelector('.timer-manager-container');
  interval;
  // NEW: 2. A Set to track which timers have already made a sound.
  _playedSounds = new Set();

  addHandlerRemoveTimer(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('.timer__btn--remove');
      if (!btn) return;

      // NEW: 3. When removing a timer, also remove it from our sound tracker.
      this._playedSounds.delete(btn.dataset.id);
      
      handler(btn.dataset.id);
    });
  }

  // NEW: 4. A helper function to play the sound.
  _playSound() {
    new Audio(timerSound).play().catch(err => {
      // This handles cases where the browser might block autoplaying sounds.
      console.error("Audio playback was blocked by the browser.", err);
    });
  }

  _generateMarkup() {
    // NEW: 5. If there are no timers, we should also clear our sound tracker.
    if (!this._data || this._data.length === 0) {
      this._playedSounds.clear();
      return '';
    }
    return `
      <div class="timer-widget">
        <h3 class="timer-widget__heading">Active Timers</h3>
        <ul class="timer-widget__list">
          ${this._data.map(timer => this._generateTimerMarkup(timer)).join('')}
        </ul>
      </div>
    `;
  }

  _generateTimerMarkup(timer) {
    const elapsed = (Date.now() - timer.startTime) / 1000;
    const remaining = timer.duration - elapsed;
    const formatTime = (seconds) => {
        if (seconds < 0) seconds = 0;
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return `
      <li class="timer-item ${remaining <= 0 ? 'timer-item--done' : ''}" data-id="${timer.id}">
        <span class="timer-item__label">${timer.label}</span>
        <strong class="timer-item__time">${remaining <= 0 ? 'Done!' : formatTime(remaining)}</strong>
        <button class="btn--tiny timer__btn--remove" data-id="${timer.id}">
         <img src="src/img/minus-circle.png" alt="Remove Timer" />
        </button>
      </li>
    `;
  }
  
  runTimers() {
    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
        if (!this._data || this._data.length === 0) {
            clearInterval(this.interval);
            this.interval = null;
            this.render(this._data); 
            return;
        }

        // NEW: 6. Logic to check timers and play sound
        this._data.forEach(timer => {
            const elapsed = (Date.now() - timer.startTime) / 1000;
            const remaining = timer.duration - elapsed;

            // If a timer is finished AND we haven't played a sound for it yet...
            if (remaining <= 0 && !this._playedSounds.has(timer.id)) {
                this._playSound(); // ...play the sound...
                this._playedSounds.add(timer.id); // ...and mark it as played.
            }
        });
        
        // This existing line will smoothly update the visual countdown
        this.update(this._data);
    }, 1000);
  }
}

export default new TimerView();