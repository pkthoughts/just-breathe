// breathingExercise.js

// Helper function to create elements with attributes and children
function createElement(tag, attributes = {}, ...children) {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
      if (key.startsWith('on')) {
          element.addEventListener(key.toLowerCase().slice(2), value);
      } else {
          element.setAttribute(key, value);
      }
  });
  children.forEach(child => {
      if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
      } else {
          element.appendChild(child);
      }
  });
  return element;
}

class BreathingExercise {
  constructor(totalTime, inhaleTime, holdInhaleTime, exhaleTime, holdExhaleTime, speed, onFinish) {
      this.totalTime = totalTime;
      this.inhaleTime = inhaleTime;
      this.holdInhaleTime = holdInhaleTime;
      this.exhaleTime = exhaleTime;
      this.holdExhaleTime = holdExhaleTime;
      this.speed = speed;
      this.onFinish = () => {
        onFinish();
        window.location.href = '/'; // Redirect to home page
    };

      this.timeLeft = totalTime;
      this.currentPhase = 'inhale';
      this.phaseTimeLeft = inhaleTime;

      // Play the inhale sound at the start of the exercise
      this.playSound('inhale', this.inhaleTime);

      this.breatheAnim = 0;
      this.holdAnim = 0; // New animation value for the hold phases
      this.animationFrame = null;

      this.container = this.createContainer('#exerciseContainer');
      this.timerText = this.container.querySelector('.timer-text');
      this.phaseText = this.container.querySelector('.phase-text');
      this.phaseTimerText = this.container.querySelector('.phase-timer-text');
      this.breatheCircle = this.container.querySelector('.breathe-circle');

      this.startTimers();
      this.startAnimation();
      
  }

  

  createContainer() {
      return createElement('div', { class: 'container' },
          createElement('p', { class: 'timer-text' }),
          createElement('div', { class: 'circle-container' },
              createElement('div', { class: 'breathe-circle' },
                  createElement('p', { class: 'phase-text' }),
                  createElement('p', { class: 'phase-timer-text' })
              )
          ),
          createElement('div', { class: 'button-container' },
              createElement('button', { class: 'button', onclick: () => this.handleRestart() }, 'Restart'),
              createElement('button', { class: 'button', onclick: this.onFinish }, 'Exit')
          )
      );
  }

  handleRestart() {
      this.timeLeft = this.totalTime;
      this.currentPhase = 'inhale';
      this.phaseTimeLeft = this.inhaleTime;
      this.breatheAnim = 0;
      this.updateUI();
  }

  startTimers() {
      setInterval(() => {
          this.timeLeft--;
          if (this.timeLeft <= 0) {
              this.onFinish();
          }
          this.updateUI();
      }, 1000);

      setInterval(() => {
          this.phaseTimeLeft--;
          if (this.phaseTimeLeft <= 0) {
              this.changePhase();
          }
          this.updateUI();
      }, 1000 / this.speed);
  }

  playSound(phase, duration) {
    const audio = new Audio(`${phase}.mp3`);
    audio.playbackRate = this.inhaleTime / duration;audio.loop = true; // Make the audio loop
    audio.play();
    
      // Stop the audio when the phase ends
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, duration * 1000 / this.speed);
} 
  changePhase() {
      
      
      switch (this.currentPhase) {
        case 'inhale':
          this.currentPhase = 'holdInhale';
          this.phaseTimeLeft = this.holdInhaleTime;
          
          break;
      case 'holdInhale':
          this.currentPhase = 'exhale';
          this.phaseTimeLeft = this.exhaleTime;
          this.playSound('exhale', this.exhaleTime);
          break;
      case 'exhale':
          this.currentPhase = 'holdExhale';
          this.phaseTimeLeft = this.holdExhaleTime;
          
          break;
      case 'holdExhale':
          this.currentPhase = 'inhale';
          this.phaseTimeLeft = this.inhaleTime;
          this.playSound('inhale', this.inhaleTime);
          break;
      }
  }
  
  
  
  
    startAnimation() {
    
      const animate = () => {
        const duration = this.phaseTimeLeft * 1000; // Duration in milliseconds
        const fps = 120; // Reduce frames per second for smoother, slower animation
        const frameDuration = 1000 / fps;
        const totalFrames = duration / frameDuration;
        const step = 1 / totalFrames;
        
    
        switch (this.currentPhase) {
          case 'inhale':
              this.breatheAnim += step;
              this.breatheAnim = Math.min(this.breatheAnim, 1.1);
              this.holdAnim = 0; // Reset hold animation
              
              break;
          case 'exhale':
              this.breatheAnim -= step;
              this.breatheAnim = Math.max(this.breatheAnim, -0.1);
              this.holdAnim = 0; // Reset hold animation
              
              break;
          case 'holdInhale':
              this.breatheAnim = 1;
              this.holdAnim = Math.min(this.holdAnim, 1.1);
              
              break;
          case 'holdExhale':
              this.breatheAnim = 0;
              this.holdAnim = Math.min(this.holdAnim, 1.1);
              
              break;
          }
    
        this.updateUI();
        this.animationFrame = requestAnimationFrame(animate);
      };
      this.animationFrame = requestAnimationFrame(animate);
    }
    
  updateUI() {
      this.timerText.textContent = this.formatTime(this.timeLeft);
      this.phaseText.textContent = this.getDisplayPhase(this.currentPhase);
      this.phaseTimerText.textContent = this.phaseTimeLeft;

      const minCircleSize = 100; // Increased minimum size
      const maxCircleSize = 300; // Increased maximum size
      const circleSize = minCircleSize + (this.breatheAnim * (maxCircleSize - minCircleSize));
      const fontSize = Math.max(16, Math.min(32, circleSize * 0.15)); // Adjusted font size range

      // Set dimensions for the inner breathing circle
      this.breatheCircle.style.width = `${circleSize}px`;
      this.breatheCircle.style.height = `${circleSize}px`;
      
      // Set font sizes for phase text and timer text
      this.phaseText.style.fontSize = `${fontSize}px`;
      this.phaseTimerText.style.fontSize = `${fontSize}px`;

      
      this.phaseText.style.fontSize = `${fontSize}px`;
      this.phaseTimerText.style.fontSize = `${fontSize}px`;

      // Handle outer circle for hold phases
      if (this.currentPhase === 'holdInhale' || this.currentPhase === 'holdExhale') {
          const holdSize = circleSize + (this.holdAnim * 60); // Outer circle grows by up to 40px
          
          if (!this.outerCircle) {
              this.outerCircle = document.createElement('div');
              this.outerCircle.className = 'outer-circle';
              this.breatheCircle.parentNode.insertBefore(this.outerCircle, this.breatheCircle);
          }
          
          this.outerCircle.style.width = `${holdSize}px`;
          this.outerCircle.style.height = `${holdSize}px`;
          this.outerCircle.style.opacity = this.holdAnim ; // Adjust opacity for visibility
      } else if (this.outerCircle) {
          this.outerCircle.style.opacity = '0';
      }

      // Adjust text color based on breathe animation progress
      const textColor = (this.currentPhase === 'inhale' || this.currentPhase === 'holdInhale') ? '#ffffff' : '#333333';
      this.phaseText.style.color = textColor;
      this.phaseTimerText.style.color = textColor;
  }


  formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  getDisplayPhase(phase) {
      switch (phase) {
          case 'inhale': return 'Inhale';
          case 'holdInhale': return 'Hold';
          case 'exhale': return 'Exhale';
          case 'holdExhale': return 'Hold';
          default: return phase;
      }
  }
}
