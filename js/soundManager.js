const SoundManager = (function () {

  const sounds  = {};
  let sfxMuted  = false;
  let sfxVolume = 0.7;

  function register(key, path) {
    const audio   = new Audio(path);
    audio.volume  = sfxVolume;
    audio.preload = 'auto';
    sounds[key]   = audio;
  }

  function play(key) {
    if (sfxMuted) return;
    const audio = sounds[key];
    if (!audio) return;
    const clone = audio.cloneNode();
    clone.volume = sfxVolume;
    clone.play().catch(() => {});
  }

  function setVolume(v) {
    sfxVolume = Math.max(0, Math.min(1, v));
    Object.values(sounds).forEach(a => { a.volume = sfxVolume; });
  }

  function getVolume()    { return sfxVolume; }
  function toggleMute()   { sfxMuted = !sfxMuted; return sfxMuted; }
  function setMuted(val)  { sfxMuted = !!val; }
  function isMuted()      { return sfxMuted; }

  const TRACKS = {
    default:     { label: 'Default',      src: 'assets/sounds/defaultSoundtrack.mp3' },
    soundtrack1: { label: 'Soundtrack 1', src: 'assets/sounds/soundtrack1.mp3'     },
  };

  let _trackAudio    = null;   // current HTMLAudioElement
  let _currentTrack  = 'default';
  let _musicMuted    = false;
  let _musicVolume   = 0.45;   // quieter than SFX by default
  let _userStarted   = false;  // becomes true after first user interaction

  function _loadTrack(key) {
    const def = TRACKS[key];
    if (!def) return;
    if (_trackAudio) {
      _trackAudio.pause();
      _trackAudio.src = '';
    }
    _trackAudio          = new Audio(def.src);
    _trackAudio.loop     = true;
    _trackAudio.volume   = _musicMuted ? 0 : _musicVolume;
    _trackAudio.preload  = 'auto';
    _currentTrack        = key;
  }

  function _playCurrentTrack() {
    if (!_trackAudio || _musicMuted) return;
    _trackAudio.play().catch(() => {});
  }

  /** Call once after first user gesture to start music. */
  function startMusic() {
    if (_userStarted) return;
    _userStarted = true;
    _playCurrentTrack();
  }

  function setTrack(key) {
    if (!TRACKS[key]) return;
    const wasPlaying = _userStarted && !_musicMuted;
    _loadTrack(key);
    if (wasPlaying) _playCurrentTrack();
  }

  function setMusicVolume(v) {
    _musicVolume = Math.max(0, Math.min(1, v));
    if (_trackAudio) _trackAudio.volume = _musicMuted ? 0 : _musicVolume;
  }

  function getMusicVolume()   { return _musicVolume; }
  function getCurrentTrack()  { return _currentTrack; }
  function getTrackList()     { return TRACKS; }

  function toggleMusicMute() {
    _musicMuted = !_musicMuted;
    if (_trackAudio) {
      if (_musicMuted) {
        _trackAudio.pause();
      } else if (_userStarted) {
        _trackAudio.volume = _musicVolume;
        _trackAudio.play().catch(() => {});
      }
    }
    return _musicMuted;
  }

  function setMusicMuted(val) {
    _musicMuted = !!val;
    if (_trackAudio) {
      if (_musicMuted) {
        _trackAudio.pause();
      } else if (_userStarted) {
        _trackAudio.volume = _musicVolume;
        _trackAudio.play().catch(() => {});
      }
    }
  }

  function isMusicMuted() { return _musicMuted; }

  return {
    /* SFX */
    register, play, setVolume, getVolume, toggleMute, setMuted, isMuted,
    /* Music */
    startMusic, setTrack, setMusicVolume, getMusicVolume,
    getCurrentTrack, getTrackList,
    toggleMusicMute, setMusicMuted, isMusicMuted,
  };
})();

document.addEventListener('DOMContentLoaded', function () {

  /* SFX */
  SoundManager.register('addVial',      'assets/sounds/addVial.mp3');
  SoundManager.register('clickGeneral', 'assets/sounds/clickGeneral.mp3');
  SoundManager.register('clickPotion',  'assets/sounds/clickPotion.mp3');
  SoundManager.register('invalid',      'assets/sounds/invalid.mp3');
  SoundManager.register('pour',         'assets/sounds/pour.mp3');
  SoundManager.register('star',         'assets/sounds/star.mp3');
  SoundManager.register('win',          'assets/sounds/win.mp3');

  /* Restore saved prefs */
  try {
    const saved = JSON.parse(localStorage.getItem('aoo_settings') || '{}');
    if (saved.sfxVolume   !== undefined) SoundManager.setVolume(saved.sfxVolume / 100);
    if (saved.sfxMuted)                  SoundManager.setMuted(true);
    if (saved.musicVolume !== undefined) SoundManager.setMusicVolume(saved.musicVolume / 100);
    if (saved.musicMuted)                SoundManager.setMusicMuted(true);
    if (saved.track)                     SoundManager.setTrack(saved.track);
    else                                 SoundManager.setTrack('default');
  } catch {
    SoundManager.setTrack('default');
  }

  const startOnce = () => {
    SoundManager.startMusic();
    document.removeEventListener('pointerdown', startOnce);
    document.removeEventListener('keydown',     startOnce);
  };
  document.addEventListener('pointerdown', startOnce);
  document.addEventListener('keydown',     startOnce);
});