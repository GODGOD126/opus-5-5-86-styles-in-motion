# Opus 5.5 — 86 Styles in Motion

A Codex skill for turning a short topic into a styled HTML explainer: choose a visual direction, review a 20-second sample, then approve the complete animation.

## Workflow

1. Describe your topic in one sentence.
2. Review three recommended styles using their original reference images.
3. Choose a style. The agent studies its visual language, source code, and motion over time.
4. Watch an approximately 20-second HTML sample.
5. Approve the sample before the agent develops the full animation.

The local collection supports the original 86 visual styles plus curated Talking Head (#87) and Vibe Knowledge Film (#88) extensions, a bilingual three-column gallery, reference video playback, and copyable style names. The workflow prioritizes continuous explanatory motion, readable text, and real source materials where appropriate. It does not require a paid image-generation or narration service.

## Talking Head / 口播类

Based on 阿朱’s own approved 150-second episode, this extension includes a browsable finished reference, a 20.733-second excerpt, the complete editable HTML project, and historical edit/subtitle evidence. It combines presenter picture-in-picture/full-frame transitions, real supporting materials, continuous explanatory motion, and selective action-synced sound. The reference is a user-created work, not attributed to Opus 5.5.

Ask `$claude-opus-5-5-new 用口播类风格剪辑这段视频，先做20秒样片。` with your footage. Explicitly choosing this style skips the three-style selection; sample approval is still required before the full video. See `references/talking-head.md`. The skill display title and invocation remain unchanged.

## Vibe Knowledge Film / Vibe 知识讲解

Style #88 integrates [HeyChengC/vibe-knowledge-film](https://github.com/HeyChengC/vibe-knowledge-film) as one isolated entry with two variants: **C Nocturne / 夜曲** for abstract mechanisms, and **B Fable / 寓言** for behavior and illustrated stories. Its explanation method, storyboard guidance, Canvas engine, local fonts, and author-created examples are loaded only after this style is selected. Other styles retain their own production rules.

The workflow still uses an approximately **20-second HTML sample**, followed by approval before the full film. The upstream extra approval stages are not added. Create a self-contained project with `python scripts/new_vibe_film.py --output ../my-film/sample --world C --title "My topic"`; replace the clearly marked scaffold with your own story. `--world B` selects Fable; `--example` copies the credited original reference for study. Optional `--audio path/to/track.mp3` copies a local audio track and synchronizes it with the player.

The gallery's two silent 800×450/10fps clips are converted from the author's GIF previews; the editable source examples are about 33 seconds and run at their original 30fps. Use those HTML sources to study motion in detail. New project scaffolds explicitly use 60fps, which is not a claim of completed MP4 export. Model provenance is not independently verified as Opus 5.5. See `references/vibe-knowledge-film.md`.

## Install locally

Requires Codex with local file access, Python 3.9+ for the helper scripts, and a supported browser for preview and visual checks. Individual animation projects may require additional tools.

Clone the repository into your Codex skills directory:

```sh
git clone https://github.com/GODGOD126/opus-5-5-86-styles-in-motion.git ~/.codex/skills/claude-opus-5-5-new
```

If you use a custom `CODEX_HOME`, install under its `skills` directory instead. If the target folder already exists, choose a separate location rather than overwriting it. The display title is **Opus 5.5 — 86 Styles in Motion**; invoke it as `$claude-opus-5-5-new`.

```text
$claude-opus-5-5-new Make an explainer about Occam's razor.
```

The instructions default to Chinese and 16:9, but the user's requested language and aspect ratio take precedence. HTML is the default deliverable; MP4 export is performed only when requested.

## Inspect the references

Run from this folder:

```sh
python scripts/atlas.py --list
python scripts/atlas.py --id 11
python scripts/atlas.py --id 87
python scripts/atlas.py --id 88
python scripts/atlas.py --verify
python scripts/gallery.py --output ../styles-gallery
```

Open `assets/gallery/index.html` to browse the bundled local gallery, or serve an exported gallery with a local HTTP server. Reference scripts are study material, not automatically executed installation code.

## Files

- `SKILL.md`: production workflow and approval stages.
- `agents/openai.yaml`: display metadata and example invocation.
- `references/`: style selection, research, and delivery guidance.
- `scripts/`: atlas inspection and gallery export helpers.
- `assets/atlas/`: original reference collection with source metadata and hashes.
- `assets/gallery/`: local gallery with images and example videos.
- `assets/custom/talking-head/`: self-contained HTML reference, preview videos, editing evidence, and file hashes. The original 1080p master and untrimmed camera footage are not bundled.

- `assets/custom/vibe-knowledge-film/`: isolated engine, local fonts, two author-created examples, silent gallery clips, portable player, licenses and hashes.

## Credits

The original 86 styles are from [Futurepedia — AI Style Atlas](https://www.futurepedia.io/resources/ai-style-atlas/view).

The Talking Head reference is by 阿朱. Embedded third-party materials retain their source credits in `assets/custom/talking-head/source/assets/sources.txt` and the nested example credit files.

Vibe Knowledge Film is by HeyChengC. Its MIT license and font OFL notices are preserved in `assets/custom/vibe-knowledge-film/`. Materials expressly excluded by the upstream license are not bundled.

## 中文说明

一句选题 → 推荐三个风格并直接展示示例图 → 用户选定 → 制作约 20 秒 HTML 样片 → 用户确认 → 完整动画。默认保留两次确认，不提前扩展全片。
