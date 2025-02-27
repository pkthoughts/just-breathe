class BreathingExercise {
    constructor(totalMinutes, inhale, holdInhale, exhale, holdExhale, speed) {
        this.totalDuration = totalMinutes * 60;
        this.phases = {
            inhale: parseInt(inhale),
            holdInhale: parseInt(holdInhale),
            exhale: parseInt(exhale),
            holdExhale: parseInt(holdExhale)
        };
        this.speed = parseFloat(speed);
        this.currentPhase = 'inhale';
        this.timeLeft = this.totalDuration;
        this.phaseTimeLeft = this.phases[this.currentPhase];
        this.circle = document.querySelector('.progress-indicator');
        this.circumference = 2 * Math.PI * 45;
        this.animationFrameId = null;
        this.phaseStartTime = null;
        this.init();
        this.audio = {
            inhale: new Audio('inhale.mp3'),
            exhale: new Audio('exhale.mp3')
        };
        this.currentAudio = null;
    }

    init() {
        this.totalTimerElement = document.querySelector('.total-timer');
        this.phaseNameElement = document.querySelector('.phase-name');
        this.phaseTimerElement = document.querySelector('.phase-timer');
        this.setupProgressCircle();
        this.updateCircleColor();
    }

    setupProgressCircle() {
        this.circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.circle.style.strokeDashoffset = 0; // Start full
    }

    start() {
        this.setBackgroundImage();
        this.playPhaseAudio();
        this.phaseStartTime = Date.now();
        this.updateTotalTimer();
        this.totalInterval = setInterval(() => this.updateTotalTimer(), 1000);
        this.animatePhaseProgress();
        this.playPhaseAudio();
    }

    animatePhaseProgress() {
        const phaseDuration = (this.phases[this.currentPhase] * 1000) / this.speed;
        const elapsed = Date.now() - this.phaseStartTime;
        const progress = Math.min(elapsed / phaseDuration, 1);

        // Update progress circle from 0 to circumference (full to empty)
        const offset = progress * this.circumference;
        this.circle.style.strokeDashoffset = offset;

        // Update phase timer display
        const remaining = Math.ceil((phaseDuration - elapsed) / 1000);
        this.phaseTimerElement.textContent = Math.max(0, remaining);

        if (progress >= 1) {
            this.transitionPhase();
        } else {
            this.animationFrameId = requestAnimationFrame(() => this.animatePhaseProgress());
        }
    }

    playPhaseAudio() {
        this.stopAudio(); // Stop any previous audio
        if (this.currentPhase === 'inhale') {
            this.currentAudio = this.audio.inhale;
        } else if (this.currentPhase === 'exhale') {
            this.currentAudio = this.audio.exhale;
        } else {
            return; // No audio for hold phases
        }
        
        this.currentAudio.loop = true;
        this.currentAudio.play().catch(error => {
            console.log('Audio play failed:', error);
        });
    }

    stopAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio.loop = false;
        }
    }

    transitionPhase() {
        this.stopAudio(); // Stop current phase audio
        const phaseOrder = ['inhale', 'holdInhale', 'exhale', 'holdExhale'];
        const currentIndex = phaseOrder.indexOf(this.currentPhase);
        this.currentPhase = phaseOrder[(currentIndex + 1) % 4];
        
        // Force final empty state
        this.circle.style.strokeDashoffset = this.circumference;
        this.phaseTimerElement.textContent = 0;

        this.playPhaseAudio(); // Start next phase audio

        // Start next phase with fresh animation
        setTimeout(() => {
            cancelAnimationFrame(this.animationFrameId);
            this.phaseStartTime = Date.now();
            this.phaseTimeLeft = this.phases[this.currentPhase];
            this.setupProgressCircle(); // Reset to full
            this.updatePhaseDisplay();
            this.animatePhaseProgress();
        }, 50); // Smooth transition delay
    }

    updatePhaseDisplay() {
        let phaseName = this.currentPhase;
        switch (this.currentPhase) {
            case 'holdInhale':
            case 'holdExhale':
                phaseName = 'Hold';
                break;
            default:
                break;
        }
        this.phaseNameElement.textContent = phaseName.toUpperCase();
            
        this.updateCircleColor();
        this.phaseTimerElement.textContent = this.phases[this.currentPhase];
    }

    updateTotalTimer() {
        this.timeLeft--;
        const minutes = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
        const seconds = (this.timeLeft % 60).toString().padStart(2, '0');
        this.totalTimerElement.textContent = `${minutes}:${seconds}`;
        
        if (this.timeLeft <= 0) this.completeExercise();
    }

    updateCircleColor() {
        const colors = {
            inhale: '#2ecc71',
            holdInhale: '#3498db',
            exhale: '#e74c3c',
            holdExhale: '#3498db'
        };
        this.circle.style.stroke = colors[this.currentPhase];
    }

    completeExercise() {
        this.cleanup();
        if (this.onComplete) this.onComplete();
    }

    cleanup() {
        document.body.style.backgroundImage = 'none';
        this.stopAudio();
        clearInterval(this.totalInterval);
        cancelAnimationFrame(this.animationFrameId);
        this.resetProgress();
    }

    resetProgress() {
        this.circle.style.strokeDashoffset = 0; // Reset to full
        this.circle.style.stroke = '#3498db';
    }

    restart() {
        this.cleanup();
        this.timeLeft = this.totalDuration;
        this.currentPhase = 'inhale';
        this.phaseTimeLeft = this.phases[this.currentPhase];
        this.setupProgressCircle();
        this.updateCircleColor();
        this.updatePhaseDisplay();
        this.start();
    }

    setBackgroundImage() {
        const images = ['images/nature.jpg', 'images/sunrise.jpg','images/valley.jpg','images/waterfall.jpg'];
        const randomImage = images[Math.floor(Math.random() * images.length)];
        const exerciseScreen = document.querySelector('.exercise-screen');
        exerciseScreen.style.backgroundImage = `url('${randomImage}')`;
        exerciseScreen.style.backgroundSize = 'cover';
        exerciseScreen.style.backgroundPosition = 'center';
      }
      
}


// UI Controller
const UI = {
    init() {
        this.addEventListeners();
        this.setupTouchSupport();
    },

    addEventListeners() {
        document.querySelector('.start-btn').addEventListener('click', () => this.showScreen('config-modal'));
        document.querySelector('.cancel-btn').addEventListener('click', () => this.showScreen('home-screen'));
        document.querySelector('.exercise-form').addEventListener('submit', function(event) {
          setTimeout(() => {
            this.handleFormSubmit(event);
          }, 2000);
        }.bind(this));
        document.querySelector('.exit-btn').addEventListener('click', () => {
            if (this.currentExercise) this.currentExercise.cleanup();
            this.showScreen('home-screen');
        });
        document.querySelector('.restart-btn').addEventListener('click', () => {
            if (this.currentExercise) {
                this.currentExercise.restart();
            }
        });
    },

    setupTouchSupport() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.target.click();
            });
        });
    },

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.querySelector(`.${screenId}`).classList.add('active');
    },

    handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        this.currentExercise = new BreathingExercise(
            formData.get('totalTime'),
            formData.get('inhale'),
            formData.get('holdInhale'),
            formData.get('exhale'),
            formData.get('holdExhale'),
            formData.get('speed')
        );
        
        this.currentExercise.onComplete = () => {
            this.showScreen('home-screen');
            this.currentExercise.cleanup();
        };
        
        this.showScreen('exercise-screen');
        this.currentExercise.start();
    }
};

// Initialize Application
UI.init();
