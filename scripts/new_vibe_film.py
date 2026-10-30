"""Create a portable #88 project; no installation, download or browser launch."""
import argparse
import html
import json
import math
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / 'assets/custom/vibe-knowledge-film'


def create(destination, world='C', title='新知识讲解', duration=20, example=False, audio=None):
    destination = destination.resolve()
    if destination.is_relative_to(ROOT):
        raise ValueError('Create projects outside the installed Skill directory')
    if destination.exists():
        raise FileExistsError(f'Refusing to overwrite: {destination}')
    if not math.isfinite(duration) or duration <= 0:
        raise ValueError('Duration must be positive and finite')
    if world not in ('B', 'C'):
        raise ValueError('World must be B or C')
    if audio and (not audio.is_file() or audio.suffix.lower() not in ('.mp3', '.wav', '.ogg', '.m4a')):
        raise ValueError('Audio must be an existing MP3/WAV/OGG/M4A')
    destination.mkdir(parents=True)
    shutil.copytree(MODULE / 'engine', destination / 'engine')
    shutil.copy2(MODULE / 'LICENSE', destination / 'LICENSE-vibe-knowledge-film')
    shutil.copy2(MODULE / 'ORIGIN.txt', destination / 'SOURCE.txt')
    shutil.copy2(MODULE / 'player/player.js', destination / 'player.js')
    extra = ''
    if example:
        source = MODULE / 'examples' / ('fold_C' if world == 'C' else 'pigeon_B')
        for name in ('film.js', 'storyboard.md', 'layout.js'):
            if (source / name).is_file():
                shutil.copy2(source / name, destination / name)
        extra = '<script src="layout.js"></script>' if world == 'C' else ''
        title = '作者示例 · ' + ('折叠' if world == 'C' else '鸽子的迷信')
    else:
        theme = 'night' if world == 'C' else 'flat'
        code = """/* 制作骨架，不是可交付样片。以用户选题重写场景与字幕。 */
(() => {
  const K = VKit;
  const SUBS = []; // {a,b,zh,en?}; 为完整阅读和理解留时间
  VK.film({dur:__DURATION__,fps:60,theme:__THEME__,meta:{title:__TITLE__},
    draw(fr,t){
      // TODO: 先完成最难的机制镜头；所有运动从 t 计算，不能跨帧累积状态。
      fr.text('制作骨架',960,480,{font:'serif',size:68,color:'#EEC672'});
      K.subs(fr,t,SUBS,__THEME__);
    }
  });
})();
""".replace('__DURATION__', str(duration)).replace('__THEME__', json.dumps(theme)).replace('__TITLE__', json.dumps(title, ensure_ascii=False))
        (destination / 'film.js').write_bytes(code.encode('utf-8'))
    config = {}
    if audio:
        (destination / 'audio').mkdir()
        name = 'audio/track' + audio.suffix.lower()
        shutil.copy2(audio, destination / name)
        config['audio'] = name
    (destination / 'config.js').write_bytes(('window.FILM_CONFIG = ' + json.dumps(config) + ';\n').encode('utf-8'))
    page = (MODULE / 'player/index.template.html').read_text(encoding='utf-8')
    page = page.replace('__TITLE__', html.escape(title)).replace('__ENGINE_BASE__', 'engine').replace('__PLAYER_BASE__', '.').replace('__EXTRA_SCRIPTS__', extra)
    (destination / 'index.html').write_bytes(page.encode('utf-8'))
    return destination / 'index.html'


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--world', choices=['C', 'B'], default='C')
    parser.add_argument('--title', default='新知识讲解')
    parser.add_argument('--duration', type=float, default=20)
    parser.add_argument('--example', action='store_true', help='Copy the credited original 33-second reference, not a new user film')
    parser.add_argument('--audio', type=Path)
    args = parser.parse_args()
    try:
        print(create(args.output, args.world, args.title, args.duration, args.example, args.audio))
    except (OSError, ValueError) as exc:
        parser.exit(1, f'Cannot create project: {exc}\n')
