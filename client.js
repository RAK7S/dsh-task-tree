window.__ModuleLoader__.load({
  id: 'dsh-task-tree',
  factory(require) {
    const ReactNS = require('react')
    const React = ReactNS && ReactNS.createElement ? ReactNS : (ReactNS && ReactNS.default ? ReactNS.default : ReactNS)
    const h = React.createElement
    const { useState, useEffect, useCallback, useRef } = React

    const PORTS = [3013, 3014, 3015, 3016, 3017, 3018, 3019]
    const POS_KEY = 'dsh-task-tree:pos'
    const OPEN_KEY = 'dsh-task-tree:open'

    const V = {
      surface: 'var(--dsw-alias-bg-overlay, #1b1e26)',
      layer1: 'var(--dsw-alias-bg-layer-1, #232733)',
      layer2: 'var(--dsw-alias-bg-layer-2, #2a2f3d)',
      border: 'var(--dsw-alias-border-l1, rgba(255,255,255,0.12))',
      border2: 'var(--dsw-alias-border-l2, rgba(255,255,255,0.22))',
      fg: 'var(--dsw-alias-label-primary, #e8ecf6)',
      fg2: 'var(--dsw-alias-label-secondary, #9aa4ba)',
      brand: 'var(--dsw-alias-brand-primary, #4d6bfe)',
      ok: 'var(--dsw-alias-state-success-primary, #3ecf8e)',
      warn: 'var(--dsw-alias-state-warn-primary, #e0a05a)',
      err: 'var(--dsw-alias-state-error-primary, #e05a5a)',
      idle: 'var(--dsw-alias-state-idle-primary, #7d879b)',
    }

    const STATUS = {
      todo: { color: V.idle, label: '待办' },
      doing: { color: V.brand, label: '进行中' },
      done: { color: V.ok, label: '完成' },
      blocked: { color: V.warn, label: '卡住' },
      skipped: { color: V.idle, label: '废止' },
    }

    const S = {
      panel: {
        position: 'fixed', width: 404, maxHeight: '74vh',
        display: 'flex', flexDirection: 'column',
        borderRadius: 16, border: '1px solid ' + V.border,
        background: V.surface,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 2px 0 rgba(255,255,255,0.04) inset',
        color: V.fg, pointerEvents: 'auto', zIndex: 70, overflow: 'hidden',
        font: '13px/1.5 -apple-system, "Segoe UI", "Microsoft YaHei", system-ui, sans-serif',
      },
      head: {
        display: 'flex', alignItems: 'center', gap: 8, padding: '11px 12px 11px 14px',
        borderBottom: '1px solid ' + V.border, cursor: 'grab',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0))',
        userSelect: 'none',
      },
      brandDot: { width: 8, height: 8, borderRadius: 4, background: V.brand, boxShadow: '0 0 10px ' + V.brand, flex: '0 0 auto' },
      title: { fontSize: 13.5, fontWeight: 650, letterSpacing: 0.2 },
      counter: { fontSize: 11.5, color: V.fg2, flex: 1, textAlign: 'right', paddingRight: 2 },
      iconBtn: {
        border: '1px solid transparent', background: 'transparent', color: V.fg2, cursor: 'pointer',
        fontSize: 13, padding: '3px 6px', borderRadius: 7, lineHeight: 1,
      },
      body: { overflowY: 'auto', padding: '8px 10px 4px' },
      groupHead: { display: 'flex', alignItems: 'center', gap: 7, padding: '6px', borderRadius: 8, cursor: 'pointer', userSelect: 'none' },
      caret: { width: 12, fontSize: 10, color: V.fg2, textAlign: 'center' },
      groupName: { fontSize: 12.5, fontWeight: 650, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
      count: { fontSize: 11, color: V.fg2, fontVariantNumeric: 'tabular-nums' },
      tree: { marginLeft: 15, borderLeft: '1px solid ' + V.border, paddingLeft: 2 },
      card: {
        display: 'flex', alignItems: 'flex-start', gap: 8,
        padding: '7px 8px 7px 6px', margin: '3px 2px',
        borderRadius: 9, border: '1px solid transparent',
        background: V.layer1, cursor: 'grab', position: 'relative',
      },
      grip: { color: V.fg2, fontSize: 11, opacity: 0.45, cursor: 'grab', paddingTop: 2, letterSpacing: -1 },
      box: {
        width: 15, height: 15, borderRadius: 5, marginTop: 1,
        border: '1.5px solid ' + V.border2, flex: '0 0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, color: V.ok, lineHeight: 1, cursor: 'pointer',
      },
      text: { flex: 1, fontSize: 12.5, lineHeight: 1.42, wordBreak: 'break-word', minWidth: 0 },
      meta: { fontSize: 10.5, color: V.fg2, marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' },
      chip: { fontSize: 10, color: V.fg2, border: '1px solid ' + V.border, borderRadius: 5, padding: '0 4px', lineHeight: '15px', background: 'transparent' },
      dropLine: { height: 2, background: V.brand, borderRadius: 2, margin: '1px 4px', boxShadow: '0 0 8px ' + V.brand },
      foot: {
        borderTop: '1px solid ' + V.border, padding: '10px 12px 12px',
        display: 'flex', flexDirection: 'column', gap: 8,
        background: 'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.03))',
      },
      inputRow: { display: 'flex', gap: 8, alignItems: 'center' },
      input: {
        flex: 1, background: V.layer1, border: '1px solid ' + V.border,
        borderRadius: 10, color: V.fg, padding: '8px 10px', font: 'inherit',
        outline: 'none', minWidth: 0,
      },
      mic: {
        width: 34, height: 34, borderRadius: 10, border: '1px solid ' + V.border,
        background: V.layer1, color: V.fg, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
        flex: '0 0 auto', userSelect: 'none',
      },
      ghostBtn: {
        height: 34, padding: '0 11px', borderRadius: 10,
        border: '1px solid ' + V.border2, background: V.layer2, color: V.fg,
        fontWeight: 600, fontSize: 12.5, cursor: 'pointer', flex: '0 0 auto',
      },
      primaryBtn: {
        height: 34, padding: '0 13px', borderRadius: 10,
        border: '1px solid ' + V.border2, background: V.layer2, color: V.fg,
        fontWeight: 650, fontSize: 12.5, cursor: 'pointer', flex: '0 0 auto',
      },
      pill: {
        position: 'fixed', width: 46, height: 46, borderRadius: 14,
        border: '1px solid ' + V.border2,
        background: 'linear-gradient(160deg, ' + V.layer2 + ', ' + V.surface + ')',
        color: V.fg, cursor: 'pointer', pointerEvents: 'auto', zIndex: 70,
        boxShadow: '0 12px 32px rgba(0,0,0,0.45)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      },
      badge: {
        position: 'absolute', top: -6, right: -6, minWidth: 17, height: 17, borderRadius: 9,
        background: V.brand, color: '#fff', fontSize: 10, lineHeight: '17px',
        textAlign: 'center', padding: '0 4px', fontWeight: 700,
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      },
      err: { color: V.err, fontSize: 11.5, padding: '0 12px 6px' },
      hint: { fontSize: 10.5, color: V.fg2, display: 'flex', justifyContent: 'space-between', gap: 8 },
    }

    function loadPos() {
      try {
        const raw = window.localStorage.getItem(POS_KEY)
        if (!raw) return null
        const p = JSON.parse(raw)
        if (typeof p.x === 'number' && typeof p.y === 'number') return p
      } catch {}
      return null
    }

    async function findBase() {
      for (const p of PORTS) {
        try {
          const r = await fetch('http://127.0.0.1:' + p + '/ping', { cache: 'no-store' })
          if (r.ok) return 'http://127.0.0.1:' + p
        } catch {}
      }
      return ''
    }

    // webm/ogg → 16k 单声道 WAV，交给宿主 speechController 转写（与软件语音输入同一引擎）
    async function toWavBase64(blob) {
      const buf = await blob.arrayBuffer()
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioCtx()
      const audio = await ctx.decodeAudioData(buf)
      const rate = 16000
      const frames = Math.max(1, Math.ceil(audio.duration * rate))
      const off = new OfflineAudioContext(1, frames, rate)
      const srcNode = off.createBufferSource()
      srcNode.buffer = audio
      srcNode.connect(off.destination)
      srcNode.start(0)
      const rendered = await off.startRendering()
      const src = rendered.getChannelData(0)
      await ctx.close()
      const pcm = new Int16Array(src.length)
      for (let i = 0; i < src.length; i++) {
        const v = src[i] < -1 ? -1 : src[i] > 1 ? 1 : src[i]
        pcm[i] = v < 0 ? v * 0x8000 : v * 0x7fff
      }
      const bytes = new Uint8Array(44 + pcm.length * 2)
      const dv = new DataView(bytes.buffer)
      const ws = (o, t) => { for (let i = 0; i < t.length; i++) dv.setUint8(o + i, t.charCodeAt(i)) }
      ws(0, 'RIFF'); dv.setUint32(4, 36 + pcm.length * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ')
      dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true)
      dv.setUint32(24, rate, true); dv.setUint32(28, rate * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true)
      ws(36, 'data'); dv.setUint32(40, pcm.length * 2, true)
      for (let i = 0; i < pcm.length; i++) dv.setInt16(44 + i * 2, pcm[i], true)
      let bin = ''
      const CH = 0x8000
      for (let i = 0; i < bytes.length; i += CH) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH))
      return window.btoa(bin)
    }

    // 收起时：贴着离面板中心最近的那条边，形成独立小方块（不是固定角落）
    function dockToEdge(rect) {
      const W = window.innerWidth
      const H = window.innerHeight
      const size = 46
      const M = 12
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dl = cx
      const dr = W - cx
      const dt = cy
      const db = H - cy
      const min = Math.min(dl, dr, dt, db)
      if (min === dl) {
        return { x: M, y: Math.max(M, Math.min(H - size - M, cy - size / 2)) }
      }
      if (min === dr) {
        return { x: W - size - M, y: Math.max(M, Math.min(H - size - M, cy - size / 2)) }
      }
      if (min === dt) {
        return { x: Math.max(M, Math.min(W - size - M, cx - size / 2)), y: M }
      }
      return { x: Math.max(M, Math.min(W - size - M, cx - size / 2)), y: H - size - M }
    }

    function clampToScreen(x, y, w, hgt) {
      const maxX = Math.max(8, window.innerWidth - w - 8)
      const maxY = Math.max(8, window.innerHeight - hgt - 8)
      return { x: Math.max(8, Math.min(maxX, x)), y: Math.max(8, Math.min(maxY, y)) }
    }

    function Panel() {
      const [open, setOpen] = useState(() => {
        try { return window.localStorage.getItem(OPEN_KEY) === '1' } catch { return false }
      })
      const [pos, setPos] = useState(loadPos)
      const [data, setData] = useState(null)
      const [err, setErr] = useState('')
      const [draft, setDraft] = useState('')
      const [target, setTarget] = useState('')
      const [closed, setClosed] = useState({})
      const [sel, setSel] = useState('')
      const [drag, setDrag] = useState('')
      const [over, setOver] = useState('')
      const [rec, setRec] = useState('idle')
      const [seconds, setSeconds] = useState(0)
      const [notice, setNotice] = useState('')
      const [hover, setHover] = useState(false)
      const pillDrag = useRef(null)
      const baseRef = useRef('')
      const dragPanel = useRef(null)
      const panelRef = useRef(null)
      const recRef = useRef(null)
      const chunksRef = useRef([])
      const transcribeRef = useRef(null)

      const load = useCallback(async () => {
        let b = baseRef.current || (await findBase())
        if (!b) { setErr('本地接口没起来，重启一次 DSH 就好'); return }
        baseRef.current = b
        try {
          const r = await fetch(b + '/queue', { cache: 'no-store' })
          const j = await r.json()
          if (j.ok) {
            setData(j); setErr('')
            setTarget((t) => t || (j.groups[0] && j.groups[0].name) || '')
          } else setErr(j.error || '读取失败')
        } catch { setErr('连不上本地接口') }
      }, [])

      useEffect(() => { if (open && !data) load() }, [open, data, load])
      useEffect(() => { try { window.localStorage.setItem(OPEN_KEY, open ? '1' : '0') } catch {} }, [open])
      useEffect(() => { if (pos) try { window.localStorage.setItem(POS_KEY, JSON.stringify(pos)) } catch {} }, [pos])

      useEffect(() => {
        if (rec !== 'rec') return
        const t = setInterval(() => setSeconds((s) => s + 1), 1000)
        return () => clearInterval(t)
      }, [rec])

      const post = useCallback(async (op) => {
        const b = baseRef.current
        if (!b) return null
        try {
          const r = await fetch(b + '/queue', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(op) })
          const j = await r.json()
          if (j.ok) { setData(j); setErr(''); return j }
          setErr(j.error || '操作失败')
        } catch { setErr('写入失败：接口断了') }
        return null
      }, [])

      const startPanelDrag = (e) => {
        if (e.target.closest('button')) return
        const el = e.currentTarget.parentElement
        const r = el.getBoundingClientRect()
        dragPanel.current = { dx: e.clientX - r.left, dy: e.clientY - r.top, w: r.width, h: r.height }
        try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
      }
      const movePanelDrag = (e) => {
        const d = dragPanel.current
        if (!d) return
        setPos(clampToScreen(e.clientX - d.dx, e.clientY - d.dy, d.w, Math.min(d.h, window.innerHeight - 16)))
      }
      const endPanelDrag = () => { dragPanel.current = null }

      const startRec = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'].find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m))
          const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
          chunksRef.current = []
          mr.ondataavailable = (ev) => { if (ev.data && ev.data.size) chunksRef.current.push(ev.data) }
          mr.onstop = () => {
            stream.getTracks().forEach((t) => t.stop())
            setRec('ready')
            setNotice('录音结束，自动转写中…')
            setTimeout(() => { transcribeRef.current && transcribeRef.current() }, 30)
          }
          mr.start()
          recRef.current = mr
          setSeconds(0)
          setRec('rec')
          setNotice('正在录音…再点一下结束')
        } catch (e) {
          setNotice('拿不到麦克风：' + String(e && e.message ? e.message : e))
        }
      }

      const stopRec = () => {
        const mr = recRef.current
        if (mr && mr.state === 'recording') mr.stop()
      }

      const transcribe = async () => {
        setRec('stt')
        setNotice('转写中…')
        try {
          const blob = new Blob(chunksRef.current, { type: (recRef.current && recRef.current.mimeType) || 'audio/webm' })
          const wavBase64 = await toWavBase64(blob)
          const r = await fetch(baseRef.current + '/stt', {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ wavBase64, language: 'zh' }),
          })
          const j = await r.json()
          if (j.ok && j.text) {
            setDraft((d) => (d ? d + ' ' : '') + j.text.trim())
            setNotice('已转成文字，确认后成为任务条')
          } else setNotice(j.error || '没听清，再来一次？')
        } catch (e) {
          setNotice('转写失败：' + String(e && e.message ? e.message : e))
        } finally {
          chunksRef.current = []
          setRec('idle')
        }
      }

      transcribeRef.current = transcribe

      const confirmAdd = async () => {
        const title = draft.trim()
        if (!title) return
        const j = await post({ op: 'add', group: target, title })
        if (j) { setDraft(''); setNotice('已锁定为任务条') }
      }

      const collapse = () => {
        const el = panelRef.current
        let p = pos || { x: window.innerWidth - 424, y: window.innerHeight - 420 }
        if (el) {
          const r = el.getBoundingClientRect()
          p = dockToEdge(r)
        }
        setPos(p)
        setOpen(false)
      }

      const todoCount = data ? data.groups.reduce((n, g) => n + g.tasks.filter((t) => !t.done && t.status !== 'skipped').length, 0) : 0

      const panelStyle = pos
        ? { ...S.panel, left: Math.max(8, Math.min(pos.x, window.innerWidth - 412)), top: Math.max(8, Math.min(pos.y, window.innerHeight - 120)) }
        : { ...S.panel, right: 20, bottom: 20 }

      if (!open) {
        // 收起 = 在原位缩成小方块（不在固定角落），并夹回可视区
        const pillPos = pos ? clampToScreen(pos.x, pos.y, 46, 46) : { x: window.innerWidth - 66, y: window.innerHeight - 66 }
        return h('button',
          {
            style: {
              ...S.pill,
              left: pillPos.x,
              top: pillPos.y,
              transform: hover ? 'translateY(-1px) scale(1.05)' : 'none',
              boxShadow: hover ? '0 18px 40px rgba(0,0,0,0.55), 0 0 0 1px ' + V.border2 + ' inset' : S.pill.boxShadow,
              transition: 'transform 120ms ease, box-shadow 120ms ease',
              backdropFilter: 'blur(6px)',
            },
            onMouseEnter: () => setHover(true),
            onMouseLeave: () => setHover(false),
            onPointerDown: (e) => {
              pillDrag.current = { sx: e.clientX, sy: e.clientY, ox: pillPos.x, oy: pillPos.y, moved: false }
              try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
            },
            onPointerMove: (e) => {
              const d = pillDrag.current
              if (!d) return
              const dx = e.clientX - d.sx
              const dy = e.clientY - d.sy
              if (!d.moved && Math.abs(dx) + Math.abs(dy) > 4) d.moved = true
              if (d.moved) setPos(clampToScreen(d.ox + dx, d.oy + dy, 46, 46))
            },
            onPointerUp: (e) => {
              const d = pillDrag.current
              pillDrag.current = null
              try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
              if (d && !d.moved) {
                setPos(pillPos)
                setOpen(true)
              }
            },
            onPointerCancel: () => { pillDrag.current = null },
            title: '任务树 · ' + todoCount + ' 项待办（点开 / 可拖动）',
          },
          h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none' },
            h('circle', { cx: 4, cy: 4, r: 2, fill: V.brand }),
            h('circle', { cx: 4, cy: 10, r: 2, fill: V.brand, opacity: 0.7 }),
            h('circle', { cx: 4, cy: 16, r: 2, fill: V.brand, opacity: 0.45 }),
            h('rect', { x: 8, y: 3, width: 9, height: 2, rx: 1, fill: V.fg, opacity: 0.85 }),
            h('rect', { x: 8, y: 9, width: 7, height: 2, rx: 1, fill: V.fg, opacity: 0.6 }),
            h('rect', { x: 8, y: 15, width: 8, height: 2, rx: 1, fill: V.fg, opacity: 0.4 }),
          ),
          todoCount > 0 ? h('span', { style: S.badge }, String(todoCount)) : null,
        )
      }

      const groups = (data && data.groups) || []

      const renderTask = (t, ti) => {
        const st = STATUS[t.status] || STATUS.todo
        const dim = t.done || t.status === 'skipped'
        const selected = sel === t.id
        return h('div', { key: t.id },
          over === t.id ? h('div', { style: S.dropLine }) : null,
          h('div', {
            draggable: true,
            style: { ...S.card, border: '1px solid ' + (selected ? V.border2 : 'transparent'), opacity: drag === t.id ? 0.45 : 1, boxShadow: selected ? '0 6px 18px rgba(0,0,0,0.32)' : 'none' },
            onDragStart: (e) => { setDrag(t.id); try { e.dataTransfer.setData('text/plain', t.id); e.dataTransfer.effectAllowed = 'move' } catch {} },
            onDragEnd: () => { setDrag(''); setOver('') },
            onDragOver: (e) => { e.preventDefault(); if (drag && drag !== t.id) setOver(t.id) },
            onDragLeave: () => setOver((o) => (o === t.id ? '' : o)),
            onDrop: async (e) => {
              e.preventDefault()
              const id = drag || t.id
              setOver(''); setDrag('')
              if (!id || id === t.id) return
              await post({ op: 'reorder', id, before: t.id })
              setNotice('优先级已更新')
            },
            onClick: () => setSel(selected ? '' : t.id),
            title: t.id + ' · 第 ' + (ti + 1) + ' 位',
          },
            h('span', { style: S.grip }, '⠿'),
            h('div', { style: { ...S.box, borderColor: t.done ? V.ok : V.border2 }, onClick: (e) => { e.stopPropagation(); post({ op: 'toggle', id: t.id }) } }, t.done ? '✓' : ''),
            h('div', { style: { flex: 1, minWidth: 0 } },
              h('div', { style: { ...S.text, opacity: dim ? 0.42 : 1, textDecoration: dim ? 'line-through' : 'none' } }, t.title),
              h('div', { style: S.meta },
                h('span', { style: { ...S.chip, color: st.color, borderColor: st.color + '55' } }, 'P' + (ti + 1)),
                h('span', null, t.id + ' · ' + st.label),
              ),
            ),
          ),
        )
      }

      return h('div', { ref: panelRef, style: panelStyle },
        h('div', {
          style: S.head,
          onPointerDown: startPanelDrag, onPointerMove: movePanelDrag,
          onPointerUp: endPanelDrag, onPointerCancel: endPanelDrag,
        },
          h('span', { style: S.brandDot }),
          h('div', { style: S.title }, '任务树'),
          h('span', { style: S.counter }, todoCount + ' 待办 / ' + groups.reduce((n, g) => n + g.tasks.length, 0) + ' 条'),
          h('button', { style: S.iconBtn, onClick: load, title: '刷新' }, '⟳'),
          h('button', { style: S.iconBtn, onClick: collapse, title: '收起成小方块' }, '—'),
        ),
        err ? h('div', { style: S.err }, err) : null,
        h('div', { style: S.body },
          groups.length === 0
            ? h('div', { style: { ...S.meta, padding: '6px' } }, data ? '还没有分组，先在下面加一条。' : '读取中…')
            : groups.map((g) => h('div', { key: g.name },
                h('div', {
                  style: { ...S.groupHead, background: target === g.name ? V.layer1 : 'transparent' },
                  onClick: () => { setClosed({ ...closed, [g.name]: !closed[g.name] }); setTarget(g.name) },
                  onDragOver: (e) => e.preventDefault(),
                  onDrop: async (e) => {
                    e.preventDefault()
                    if (!drag) return
                    const id = drag
                    setDrag('')
                    await post({ op: 'reorder', id, before: null })
                    setNotice('已移到该组末尾')
                  },
                },
                  h('span', { style: S.caret }, closed[g.name] ? '▸' : '▾'),
                  h('span', { style: S.groupName }, g.name),
                  h('span', { style: S.count }, g.tasks.filter((t) => !t.done).length + '/' + g.tasks.length),
                ),
                closed[g.name] ? null : h('div', { style: S.tree }, g.tasks.map((t, ti) => renderTask(t, ti))),
              )),
          sel ? h('div', { style: { display: 'flex', gap: 6, padding: '4px 6px 2px 20px', flexWrap: 'wrap' } },
            ['doing', 'blocked', 'todo'].map((s) => h('span', {
              key: s, style: { ...S.chip, cursor: 'pointer', padding: '2px 7px' },
              onClick: () => post({ op: 'status', id: sel, status: s }),
            }, STATUS[s].label)),
            h('span', {
              style: { ...S.chip, cursor: 'pointer', padding: '2px 7px', borderColor: V.warn + '88', color: V.warn },
              onClick: () => post({ op: 'status', id: sel, status: 'skipped' }),
            }, '废止'),
            h('span', {
              style: { ...S.chip, cursor: 'pointer', padding: '2px 7px', borderColor: V.err + '88', color: V.err },
              onClick: () => post({ op: 'delete', id: sel }),
            }, '删除'),
          ) : null,
        ),
        h('div', { style: S.foot },
          h('div', { style: S.inputRow },
            h('input', {
              style: S.input,
              placeholder: target ? '说或打一条任务，回车确认' : '新任务…',
              value: draft,
              onChange: (e) => setDraft(e.target.value),
              onKeyDown: (e) => { if (e.key === 'Enter') confirmAdd() },
            }),
            h('button', {
              style: { ...S.mic, ...(rec === 'rec' ? { borderColor: V.err, color: V.err, boxShadow: '0 0 0 3px ' + V.err + '33', background: V.layer2 } : null), ...(rec === 'stt' ? { opacity: 0.55, cursor: 'wait' } : null) },
              onClick: () => { if (rec === 'rec') stopRec(); else if (rec === 'idle') startRec() },
              title: rec === 'rec' ? '结束录音' : '开始录音',
            }, rec === 'rec' ? '■' : rec === 'stt' ? '…' : '🎙'),
            rec === 'ready'
              ? h('button', { style: S.ghostBtn, onClick: transcribe, title: '把刚录的一段转成文字' }, '转成文字')
              : null,
            h('button', { style: S.primaryBtn, onClick: confirmAdd, title: '锁定为任务条' }, '确认'),
          ),
          h('div', { style: S.hint },
            h('span', null, notice || (rec === 'rec' ? '录音中 ' + seconds + 's' : (target ? '目标分组：' + target : ''))),
            h('span', null, '拖动 ⠿ 调优先级'),
          ),
        ),
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register({ name: 'shell.overlay', id: 'task-tree', order: 20 }, Panel),
        )
      },
    }
  },
})
