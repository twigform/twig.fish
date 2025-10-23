const audio = document.getElementById('audioElement');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressHandle = document.getElementById('progressHandle');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const progressTooltip = document.getElementById('progressTooltip');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');

let isDragging = false;
let audioMotion;

playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        audio.pause();
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
});

audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('canplay', () => {
    if (durationEl.textContent === '0:00') {
        durationEl.textContent = formatTime(audio.duration);
    }
});

audio.addEventListener('durationchange', () => {
    durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
    if (!isDragging) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = progress + '%';
        progressHandle.style.left = progress + '%';
    }
    currentTimeEl.textContent = formatTime(audio.currentTime);
});

progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;
    audio.currentTime = percentage * audio.duration;
});

progressBar.addEventListener('mousemove', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;
    const hoverTime = percentage * audio.duration;
    
    progressTooltip.textContent = formatTime(hoverTime);
    progressTooltip.style.left = (percentage * 100) + '%';
    progressTooltip.style.opacity = '1';
    progressTooltip.style.transform = 'translateY(0px) translateX(-50%)';
});

progressBar.addEventListener('mouseenter', () => {
    progressTooltip.style.opacity = '1';
    progressTooltip.style.transform = 'translateY(0px) translateX(-50%)';
});

progressBar.addEventListener('mouseleave', () => {
    progressTooltip.style.opacity = '0';
    progressTooltip.style.transform = 'translateY(5px) translateX(-50%)';
});

progressHandle.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const rect = progressBar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        let percentage = offsetX / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        
        progressFill.style.width = (percentage * 100) + '%';
        progressHandle.style.left = (percentage * 100) + '%';
        audio.currentTime = percentage * audio.duration;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
