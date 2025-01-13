// Timer class to handle all timer-related functionality
class PomodoroTimer {
    constructor() {
        // Core timer properties
        this.isRunning = false;
        this.isWorkMode = true;
        this.workDuration = 25;
        this.breakDuration = 5;
        this.currentTime = this.workDuration * 60;
        this.interval = null;
        
        // DOM Elements
        this.workTab = document.getElementById('work-tab');
        this.breakTab = document.getElementById('break-tab');
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.workDurationInput = document.getElementById('work-duration');
        this.timerSound = document.getElementById('timer-sound');
        
        // Initialize
        this.updateDisplay();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.workDurationInput.addEventListener('change', () => this.updateDuration());
        this.workTab.addEventListener('click', () => this.switchMode(true));
        this.breakTab.addEventListener('click', () => this.switchMode(false));
    }

    switchMode(isWork) {
        if (this.isWorkMode !== isWork) {
            this.isWorkMode = isWork;
            this.pause();
            this.currentTime = (this.isWorkMode ? this.workDuration : this.breakDuration) * 60;
            this.workDurationInput.value = this.isWorkMode ? this.workDuration : this.breakDuration;
            this.updateDisplay();
            this.workTab.classList.toggle('active', this.isWorkMode);
            this.breakTab.classList.toggle('active', !this.isWorkMode);
            document.body.classList.toggle('break-mode', !this.isWorkMode);
        }
    }

    updateDuration() {
        const newDuration = parseInt(this.workDurationInput.value);
        if (this.isWorkMode) {
            this.workDuration = newDuration;
        } else {
            this.breakDuration = newDuration;
        }
        this.reset();
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.interval = setInterval(() => this.tick(), 1000);
            this.startBtn.disabled = true;
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.interval);
            this.startBtn.disabled = false;
        }
    }

    reset() {
        this.pause();
        this.isWorkMode = true;
        this.currentTime = this.workDuration * 60;
        this.updateDisplay();
    }

    tick() {
        if (this.currentTime > 0) {
            this.currentTime--;
            this.updateDisplay();
        } else {
            this.playNotification();
            this.switchMode(!this.isWorkMode);
        }
    }

    playNotification() {
        try {
            this.timerSound.currentTime = 0; // Reset sound to start
            this.timerSound.play();
        } catch (error) {
            console.log('Sound could not be played:', error);
        }
    }
}

class TaskManager {
    constructor() {
        this.tasks = [];
        this.taskInput = document.getElementById('task-input');
        this.taskDescription = document.getElementById('task-description');
        this.pomodoroNumber = document.getElementById('pomodoro-number');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.taskList = document.getElementById('task-list');

        this.addTaskBtn.addEventListener('click', () => this.addTask());
    }

    addTask() {
        const title = this.taskInput.value.trim();
        const description = this.taskDescription.value.trim();
        const pomodoros = parseInt(this.pomodoroNumber.value);

        if (title && pomodoros > 0) {
            const task = {
                id: Date.now(),
                title,
                description,
                totalPomodoros: pomodoros,
                completedPomodoros: 0
            };

            this.tasks.push(task);
            this.renderTask(task);
            this.clearInputs();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.remove();
        }
    }

    renderTask(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.dataset.taskId = task.id;
        taskElement.innerHTML = `
            <div class="task-header">
                <span class="task-title">${task.title}</span>
                <div class="task-controls">
                    <button class="delete-task-btn" title="Delete task">×</button>
                </div>
            </div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="pomodoro-indicators">
                ${Array(task.totalPomodoros).fill(0).map((_, i) => `
                    <div class="pomodoro-indicator ${i < task.completedPomodoros ? 'completed' : ''}"
                         data-index="${i}"></div>
                `).join('')}
            </div>
        `;

        // Add event listeners
        const deleteBtn = taskElement.querySelector('.delete-task-btn');
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        // Add click listeners for pomodoro indicators
        const indicators = taskElement.querySelectorAll('.pomodoro-indicator');
        indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const index = parseInt(indicator.dataset.index);
                task.completedPomodoros = index + 1;
                this.updateTaskDisplay(taskElement, task);
            });
        });

        this.taskList.insertBefore(taskElement, this.taskList.firstChild);
    }

    updateTaskDisplay(taskElement, task) {
        const indicators = taskElement.querySelectorAll('.pomodoro-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('completed', index < task.completedPomodoros);
        });
    }

    clearInputs() {
        this.taskInput.value = '';
        this.taskDescription.value = '';
        this.pomodoroNumber.value = '1';
    }
}

// Initialize both classes when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
    const taskManager = new TaskManager();
});