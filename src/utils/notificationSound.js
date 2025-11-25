// Notification sound utility using HTML5 Audio
import alertSound from '../assets/sound/rogueap-alert.mp3';
import insecureAlertSound from '../assets/sound/not-secure-alert.mp3';

class NotificationSound {
    constructor() {
        this.audio = null;
        this.insecureAudio = null;
        this.isMuted = false;
    }

    // Initialize audio element (lazy loading)
    initAudio() {
        if (!this.audio) {
            this.audio = new Audio(alertSound);
            this.audio.volume = 0.7; // Set volume to 70%
        }
        return this.audio;
    }

    // Play alert sound
    playAlert() {
        if (this.isMuted) return;

        try {
            const audio = this.initAudio();

            // Reset audio to start if already playing
            audio.currentTime = 0;

            // Play the sound
            audio.play().catch(error => {
                console.error('Failed to play notification sound:', error);
            });

        } catch (error) {
            console.error('Failed to play notification sound:', error);
        }
    }

    // Initialize insecure network audio element (lazy loading)
    initInsecureAudio() {
        if (!this.insecureAudio) {
            this.insecureAudio = new Audio(insecureAlertSound);
            this.insecureAudio.volume = 0.7; // Set volume to 70%
        }
        return this.insecureAudio;
    }

    // Play insecure network alert sound
    playInsecureAlert() {
        if (this.isMuted) return;

        try {
            const audio = this.initInsecureAudio();

            // Reset audio to start if already playing
            audio.currentTime = 0;

            // Play the sound
            audio.play().catch(error => {
                console.error('Failed to play insecure network alert sound:', error);
            });

        } catch (error) {
            console.error('Failed to play insecure network alert sound:', error);
        }
    }

    // Mute/unmute sound
    setMuted(muted) {
        this.isMuted = muted;
        // Store preference in localStorage
        localStorage.setItem('rogueAPSoundMuted', muted.toString());
    }

    // Get mute status from localStorage
    getMuted() {
        const stored = localStorage.getItem('rogueAPSoundMuted');
        this.isMuted = stored === 'true';
        return this.isMuted;
    }

    // Toggle mute
    toggleMute() {
        this.setMuted(!this.isMuted);
        return this.isMuted;
    }
}

// Export singleton instance
export const notificationSound = new NotificationSound();
