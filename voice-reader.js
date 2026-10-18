/**
 * voice-reader.js — Web Speech API Voice Reader for Portfolio & Case Studies
 * Provides interactive speech reading with playback controls (play, pause, resume, stop),
 * natural English voice selection, and graceful browser fallbacks.
 *
 * Zero external dependencies · 100% GitHub Pages compatible · No API keys
 */

(function () {
  'use strict';

  // Feature detection
  const hasSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  /* ===================================================================
     VOICE MANAGEMENT & NATURAL ENGLISH SELECTION
     =================================================================== */
  let availableVoices = [];

  function loadVoices() {
    if (!hasSpeech) return [];
    const all = window.speechSynthesis.getVoices() || [];
    // Filter to English voices
    availableVoices = all.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
    if (availableVoices.length === 0) {
      availableVoices = all; // fallback to all voices if no en-* found
    }
    return availableVoices;
  }

  function getBestEnglishVoice(selectedVoiceURI) {
    if (!availableVoices.length) loadVoices();
    if (selectedVoiceURI) {
      const match = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (match) return match;
    }

    // Heuristic prioritization for high-quality natural voices
    const priorityKeywords = [
      'google us english',
      'google uk english female',
      'natural',
      'online (natural)',
      'jenny',
      'guy',
      'aria',
      'samantha',
      'daniel',
      'karen'
    ];

    for (const kw of priorityKeywords) {
      const found = availableVoices.find(v => v.name.toLowerCase().includes(kw));
      if (found) return found;
    }

    // Default to first English voice or null
    return availableVoices[0] || null;
  }

  if (hasSpeech) {
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        loadVoices();
        populateVoiceSelects();
      };
    }
  }

  /* ===================================================================
     CENTRAL SPEECH CONTROLLER
     Ensures only one speech utterance is active across the entire application
     =================================================================== */
  const SpeechController = {
    activePlayer: null, // reference to active widget

    stopAll() {
      if (hasSpeech) {
        window.speechSynthesis.cancel();
      }
      if (this.activePlayer && typeof this.activePlayer.onSpeechStopped === 'function') {
        this.activePlayer.onSpeechStopped();
      }
      this.activePlayer = null;
    },

    setActive(player) {
      if (this.activePlayer && this.activePlayer !== player) {
        this.stopAll();
      }
      this.activePlayer = player;
    }
  };

  // Stop speech when navigating away from page or clicking links
  window.addEventListener('beforeunload', () => SpeechController.stopAll());
  window.addEventListener('pagehide', () => SpeechController.stopAll());
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
      SpeechController.stopAll();
    }
  });

  /* ===================================================================
     1. PROJECT CASE STUDY VOICE READER (priceguard-ai.html)
     =================================================================== */
  function initProjectVoiceReader() {
    const container = document.getElementById('projectVoiceReader');
    if (!container) return;

    if (!hasSpeech) {
      container.innerHTML = `
        <div class="voice-fallback-msg">
          <span>ℹ️ Audio reading is not supported by your browser.</span>
        </div>
      `;
      return;
    }

    // Structured sections to read aloud in order
    const sections = [
      {
        title: 'Project Overview',
        text: 'PriceGuard AI. An automated market oversight dashboard designed to evaluate commodity price reasonability, detect artificial price gouging, and protect consumer welfare using statistical models.'
      },
      {
        title: 'System Disclosure',
        text: 'Verified System Disclosure: The public GitHub Pages demo runs browser-side calculations based on historical AGMARKNET and eNAM benchmark datasets. The standalone Python machine learning backend with Isolation Forest is documented in the project repository.'
      },
      {
        title: 'Problem & Approach',
        text: 'Section 1: Problem and Solution. The Challenge: Consumers and market supervisors often lack accessible, real-time mechanisms to evaluate whether retail commodity prices reflect legitimate market supply-demand fundamentals or unjustified retail inflation. The Approach: PriceGuard AI structures complex price variance into an intuitive, accessible interface, pairing dynamic statistical confidence bands with an ensemble anomaly score.'
      },
      {
        title: 'How It Works',
        text: 'Section 2: How It Works. Step 1: Benchmark Ingestion. Historical price indices from eNAM and AGMARKNET reference benchmarks establish a robust statistical baseline. Step 2: Statistical Bounds. Computes mean price bands, coefficient of variation, and rolling standard deviations for fair-value boundaries. Step 3: Anomaly Scoring. Z-score variance and Isolation Forest heuristics flag sudden price spikes that diverge significantly from seasonal trends. Step 4: Interface Rendering. Client-side Chart.js visualizations and reactive controls present intuitive comparisons without latency.'
      },
      {
        title: 'Key Features',
        text: 'Section 3: Key Implemented Features. Reasonability Index, calculating a percentage score reflecting whether a commodity is priced fairly within computed statistical bounds. Side-by-Side Comparison, contrasting commodities across current price, volatility, and anomaly flags. 12-Month Trend Visualisation, showing interactive historical curves across past quarters. Anomaly Alert Indicators, providing color-coded badges reflecting Isolation Forest thresholds. And Commodity Categories, with instant filtering across Grains, Vegetables, Dairy, and Daily Essentials.'
      },
      {
        title: 'Technology Stack',
        text: 'Section 4: Technology Stack. Frontend interface built with HTML5, CSS3, JavaScript, and Chart.js. Backend machine learning model in repository built with Python 3, scikit-learn, and Isolation Forest. Deployed statically to GitHub Pages.'
      }
    ];

    let currentSectionIdx = 0;
    let isPlaying = false;
    let isPaused = false;
    let selectedVoiceURI = '';

    // Render HTML Controls
    container.innerHTML = `
      <div class="voice-player-panel" role="region" aria-label="Audio Reader Controls">
        <div class="voice-player-main">
          <!-- Primary action / toggle button -->
          <button type="button" class="btn btn-voice-play" id="projectPlayBtn" aria-label="Listen to project explanation aloud">
            <svg class="voice-icon-play" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <svg class="voice-icon-pause" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="display: none;">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
            <span id="projectPlayText">Listen to Project</span>
          </button>

          <!-- Stop button -->
          <button type="button" class="btn-voice-ctrl" id="projectStopBtn" aria-label="Stop reading" style="display: none;" title="Stop audio">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="4" y="4" width="16" height="16" rx="2"></rect>
            </svg>
            <span>Stop</span>
          </button>

          <!-- Status indicator with animated soundwave -->
          <div class="voice-status-wrap" id="projectStatusWrap" style="display: none;">
            <div class="voice-equalizer" aria-hidden="true">
              <span class="bar bar-1"></span>
              <span class="bar bar-2"></span>
              <span class="bar bar-3"></span>
            </div>
            <span class="voice-status-text" id="projectStatusText" aria-live="polite">Ready</span>
          </div>
        </div>

        <!-- Voice selector dropdown -->
        <div class="voice-settings" id="projectVoiceSettings">
          <label for="projectVoiceSelect" class="voice-select-label">Voice:</label>
          <select id="projectVoiceSelect" class="voice-select" aria-label="Select voice for reading">
            <option value="">Default English Voice</option>
          </select>
        </div>
      </div>
    `;

    const playBtn = document.getElementById('projectPlayBtn');
    const stopBtn = document.getElementById('projectStopBtn');
    const playText = document.getElementById('projectPlayText');
    const iconPlay = playBtn.querySelector('.voice-icon-play');
    const iconPause = playBtn.querySelector('.voice-icon-pause');
    const statusWrap = document.getElementById('projectStatusWrap');
    const statusText = document.getElementById('projectStatusText');
    const voiceSelect = document.getElementById('projectVoiceSelect');
    const equalizer = container.querySelector('.voice-equalizer');

    // Populate voice dropdown
    function updateSelectOptions() {
      if (!voiceSelect) return;
      const voices = loadVoices();
      const currentVal = voiceSelect.value;
      voiceSelect.innerHTML = '';

      if (voices.length === 0) {
        voiceSelect.innerHTML = '<option value="">Default Voice</option>';
        return;
      }

      voices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.voiceURI;
        opt.textContent = `${v.name} (${v.lang})`;
        voiceSelect.appendChild(opt);
      });

      // Restore selection or select best voice
      const best = getBestEnglishVoice(selectedVoiceURI);
      if (best) {
        voiceSelect.value = best.voiceURI;
        selectedVoiceURI = best.voiceURI;
      } else if (currentVal) {
        voiceSelect.value = currentVal;
      }
    }

    updateSelectOptions();

    voiceSelect.addEventListener('change', () => {
      selectedVoiceURI = voiceSelect.value;
      if (isPlaying) {
        // Restart current section with new voice
        window.speechSynthesis.cancel();
        speakCurrentSection();
      }
    });

    const playerObject = {
      onSpeechStopped() {
        isPlaying = false;
        isPaused = false;
        currentSectionIdx = 0;
        playBtn.classList.remove('playing', 'paused');
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
        playText.textContent = 'Listen to Project';
        stopBtn.style.display = 'none';
        statusWrap.style.display = 'none';
        equalizer.classList.remove('active');
        statusText.textContent = 'Stopped';
      }
    };

    function speakCurrentSection() {
      if (currentSectionIdx >= sections.length) {
        playerObject.onSpeechStopped();
        return;
      }

      const sec = sections[currentSectionIdx];
      statusWrap.style.display = 'inline-flex';
      statusText.textContent = `Reading: ${sec.title} (${currentSectionIdx + 1}/${sections.length})`;
      equalizer.classList.add('active');

      const utterance = new SpeechSynthesisUtterance(sec.text);
      utterance.voice = getBestEnglishVoice(selectedVoiceURI);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        if (!isPlaying || isPaused) return;
        currentSectionIdx++;
        if (currentSectionIdx < sections.length) {
          // Brief pause between sections
          setTimeout(speakCurrentSection, 400);
        } else {
          playerObject.onSpeechStopped();
        }
      };

      utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        console.warn('SpeechSynthesis error:', e);
        playerObject.onSpeechStopped();
      };

      window.speechSynthesis.speak(utterance);
    }

    // Play / Pause toggle
    playBtn.addEventListener('click', () => {
      if (!isPlaying) {
        // Start fresh playback
        SpeechController.setActive(playerObject);
        window.speechSynthesis.cancel();
        isPlaying = true;
        isPaused = false;
        currentSectionIdx = 0;

        playBtn.classList.add('playing');
        playBtn.classList.remove('paused');
        iconPlay.style.display = 'none';
        iconPause.style.display = 'block';
        playText.textContent = 'Pause';
        stopBtn.style.display = 'inline-flex';

        speakCurrentSection();
      } else if (isPlaying && !isPaused) {
        // Pause
        window.speechSynthesis.pause();
        isPaused = true;
        playBtn.classList.add('paused');
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
        playText.textContent = 'Resume';
        statusText.textContent = `Paused: ${sections[currentSectionIdx].title}`;
        equalizer.classList.remove('active');
      } else if (isPlaying && isPaused) {
        // Resume
        isPaused = false;
        playBtn.classList.remove('paused');
        iconPlay.style.display = 'none';
        iconPause.style.display = 'block';
        playText.textContent = 'Pause';
        equalizer.classList.add('active');
        statusText.textContent = `Reading: ${sections[currentSectionIdx].title} (${currentSectionIdx + 1}/${sections.length})`;
        window.speechSynthesis.resume();
      }
    });

    // Stop
    stopBtn.addEventListener('click', () => {
      SpeechController.stopAll();
    });
  }

  /* ===================================================================
     2. HOMEPAGE HERO INTRODUCTION READER (index.html)
     =================================================================== */
  function initHeroVoiceReader() {
    const heroBtn = document.getElementById('heroVoiceBtn');
    if (!heroBtn) return;

    if (!hasSpeech) {
      heroBtn.style.display = 'none'; // gracefully hide if not supported
      return;
    }

    const introText = "Hello, I'm M Pavan. First-Year B.Tech Computer Science and Engineering student at VIT Vellore. Exploring the intersection of Human-Computer Interaction, Ubiquitous Computing, and Artificial Intelligence — motivated by building intelligent interfaces that integrate naturally into people's lives.";

    let isPlaying = false;
    let isPaused = false;

    const btnText = heroBtn.querySelector('.audio-btn-text') || heroBtn;

    const playerObject = {
      onSpeechStopped() {
        isPlaying = false;
        isPaused = false;
        heroBtn.classList.remove('playing', 'paused');
        if (btnText) btnText.textContent = 'Listen to Intro';
        heroBtn.setAttribute('aria-label', 'Listen to introduction aloud');
      }
    };

    heroBtn.addEventListener('click', () => {
      if (!isPlaying) {
        // Start playback
        SpeechController.setActive(playerObject);
        window.speechSynthesis.cancel();
        isPlaying = true;
        isPaused = false;

        heroBtn.classList.add('playing');
        heroBtn.classList.remove('paused');
        if (btnText) btnText.textContent = 'Pause Intro';
        heroBtn.setAttribute('aria-label', 'Pause introduction playback');

        const utterance = new SpeechSynthesisUtterance(introText);
        utterance.voice = getBestEnglishVoice();
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          playerObject.onSpeechStopped();
        };

        utterance.onerror = (e) => {
          if (e.error === 'interrupted' || e.error === 'canceled') return;
          console.warn('Hero speech error:', e);
          playerObject.onSpeechStopped();
        };

        window.speechSynthesis.speak(utterance);
      } else if (isPlaying && !isPaused) {
        // Pause
        window.speechSynthesis.pause();
        isPaused = true;
        heroBtn.classList.add('paused');
        if (btnText) btnText.textContent = 'Resume Intro';
        heroBtn.setAttribute('aria-label', 'Resume introduction playback');
      } else if (isPlaying && isPaused) {
        // Resume
        isPaused = false;
        heroBtn.classList.remove('paused');
        if (btnText) btnText.textContent = 'Pause Intro';
        heroBtn.setAttribute('aria-label', 'Pause introduction playback');
        window.speechSynthesis.resume();
      }
    });
  }

  function populateVoiceSelects() {
    const voiceSelect = document.getElementById('projectVoiceSelect');
    if (voiceSelect && hasSpeech) {
      const voices = loadVoices();
      const current = voiceSelect.value;
      voiceSelect.innerHTML = '';
      voices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.voiceURI;
        opt.textContent = `${v.name} (${v.lang})`;
        voiceSelect.appendChild(opt);
      });
      const best = getBestEnglishVoice(current);
      if (best) voiceSelect.value = best.voiceURI;
    }
  }

  /* ===================================================================
     INITIALIZATION ON DOM LOAD
     =================================================================== */
  function init() {
    initProjectVoiceReader();
    initHeroVoiceReader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
