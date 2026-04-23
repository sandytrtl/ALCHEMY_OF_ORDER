const SettingsModal = (function () {
  const STORAGE_KEY = 'aoo_settings';

  function _load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }

  function _save(patch) {
    const saved = _load();
    Object.assign(saved, patch);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch {}
  }

  function _updateSfxSlider(pct) {
    const slider = document.getElementById('sfx-volume');
    const label  = document.getElementById('sfx-vol-label');
    if (slider) { slider.value = pct; slider.style.setProperty('--pct', pct + '%'); }
    if (label)  label.textContent = pct + '%';
  }

  function _updateSfxIcon() {
    const icon = document.getElementById('sfx-mute-icon');
    if (!icon) return;
    const vol = parseInt(document.getElementById('sfx-volume')?.value || 70, 10);
    icon.textContent = SoundManager.isMuted() || vol === 0 ? '🔇' : vol < 40 ? '🔈' : '🔊';
  }

  function _updateMusicSlider(pct) {
    const slider = document.getElementById('music-volume');
    const label  = document.getElementById('music-vol-label');
    if (slider) { slider.value = pct; slider.style.setProperty('--pct', pct + '%'); }
    if (label)  label.textContent = pct + '%';
  }

  function _updateMusicIcon() {
    const icon = document.getElementById('music-mute-icon');
    if (!icon) return;
    const vol = parseInt(document.getElementById('music-volume')?.value || 45, 10);
    icon.textContent = SoundManager.isMusicMuted() || vol === 0 ? '🔇' : '🎵';
  }

  function _updateTrackButtons(activeKey) {
    document.querySelectorAll('.track-btn').forEach(btn => {
      btn.classList.toggle('active', btn.id === 'track-btn-' + activeKey);
    });
  }

  function open() {
    document.getElementById('settings-overlay').classList.add('open');
    const saved = _load();

    const sfxPct   = saved.sfxVolume   !== undefined ? saved.sfxVolume   : 70;
    const musicPct = saved.musicVolume !== undefined ? saved.musicVolume : 45;
    const track    = saved.track       || 'default';

    _updateSfxSlider(sfxPct);
    _updateSfxIcon();
    _updateMusicSlider(musicPct);
    _updateMusicIcon();
    _updateTrackButtons(track);
  }

  function close(e) {
    if (e && e.target !== document.getElementById('settings-overlay')) return;
    document.getElementById('settings-overlay').classList.remove('open');
  }

  /* SFX */
  function setVolume(val) {
    const pct = parseInt(val, 10);
    _updateSfxSlider(pct);
    SoundManager.setVolume(pct / 100);
    if (SoundManager.isMuted()  && pct > 0) SoundManager.setMuted(false);
    if (!SoundManager.isMuted() && pct === 0) SoundManager.setMuted(true);
    _updateSfxIcon();
    _save({ sfxVolume: pct, sfxMuted: SoundManager.isMuted() });
  }

  function toggleMute() {
    SoundManager.toggleMute();
    _updateSfxIcon();
    _save({ sfxMuted: SoundManager.isMuted() });
  }

  /* Music */
  function setMusicVolume(val) {
    const pct = parseInt(val, 10);
    _updateMusicSlider(pct);
    SoundManager.setMusicVolume(pct / 100);
    if (SoundManager.isMusicMuted()  && pct > 0) SoundManager.setMusicMuted(false);
    if (!SoundManager.isMusicMuted() && pct === 0) SoundManager.setMusicMuted(true);
    _updateMusicIcon();
    _save({ musicVolume: pct, musicMuted: SoundManager.isMusicMuted() });
  }

  function toggleMusicMute() {
    SoundManager.toggleMusicMute();
    _updateMusicIcon();
    _save({ musicMuted: SoundManager.isMusicMuted() });
  }

  function setTrack(key) {
    SoundManager.setTrack(key);
    _updateTrackButtons(key);
    _save({ track: key });
  }

  function init() {
    const saved = _load();
    if (saved.sfxVolume   !== undefined) SoundManager.setVolume(saved.sfxVolume / 100);
    if (saved.sfxMuted)                  SoundManager.setMuted(true);
    if (saved.musicVolume !== undefined) SoundManager.setMusicVolume(saved.musicVolume / 100);
    if (saved.musicMuted)                SoundManager.setMusicMuted(true);
    if (saved.track)                     SoundManager.setTrack(saved.track);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') document.getElementById('settings-overlay')?.classList.remove('open');
    });
  }

  return { open, close, setVolume, toggleMute, setMusicVolume, toggleMusicMute, setTrack, init };
})();

document.addEventListener('DOMContentLoaded', () => SettingsModal.init());