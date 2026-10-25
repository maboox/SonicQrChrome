import { createIcons, AudioLines, Send, ScanLine, ShieldCheck, RefreshCw, FileAudio, FlaskConical, Download, Copy, Settings2, Globe, CircleHelp, LockKeyhole, X, Eraser, Radio, WandSparkles } from 'lucide';

// Only the icons used by the interface are bundled. No CDN or network request.
export function renderIcons() {
  createIcons({ icons: { AudioLines, Send, ScanLine, ShieldCheck, RefreshCw, FileAudio, FlaskConical, Download, Copy, Settings2, Globe, CircleHelp, LockKeyhole, X, Eraser, Radio, WandSparkles }, attrs: { 'aria-hidden': 'true', 'focusable': 'false', 'stroke-width': 1.8 } });
}
