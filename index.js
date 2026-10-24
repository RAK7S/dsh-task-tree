import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

export const name = 'dsh-task-tree'

const QUEUE_PATH = 'C:/DSH专用文件夹/工作区/tasks/queue.md'
const PORTS = [3013, 3014, 3015, 3016, 3017, 3018, 3019]
const SKIP_GROUP = /已完成|格式|执行规矩|用法/

const TASK_RE = /^- \[( |x|X)\]\s+([A-Za-z0-9_-]+)\s*\|\s*([^|]*?)\s*\|\s*done_when:\s*([^|]*?)\s*\|\s*needs:\s*([A-Za-z]+)\s*\|\s*status:\s*([A-Za-z]+)\s*$/

function readQueue() {
  try {
    return fs.readFileSync(QUEUE_PATH, 'utf8')
  } catch {
    return ''
  }
}

function parseTasks(md) {
  const lines = md.split(/\r?\n/)
  const groups = []
  let cur = null
  lines.forEach((line, i) => {
    const gm = line.match(/^##\s+(.+?)\s*$/)
    if (gm) {
      cur = { name: gm[1], lineIndex: i, tasks: [] }
      if (!SKIP_GROUP.test(gm[1])) groups.push(cur)
      return
    }
    const tm = line.match(TASK_RE)
    if (tm && cur) {
      cur.tasks.push({
        id: tm[2],
        title: tm[3],
        done: tm[1].toLowerCase() === 'x',
        needs: tm[5],
        status: tm[6],
        line: i,
      })
    }
  })
  return { lines, groups }
}

function nextId(groups) {
  let max = 0
  for (const g of groups) {
    for (const t of g.tasks) {
      const n = parseInt(String(t.id).replace(/\D+/g, ''), 10)
      if (Number.isFinite(n) && n > max) max = n
    }
  }
  return `T${max + 1}`
}

function buildLine(task, done, status) {
  const box = done ? 'x' : ' '
  return `- [${box}] ${task.id} | ${task.title} | done_when: ${task.doneWhen || '按标题完成'} | needs: ${task.needs || 'none'} | status: ${status}`
}

function applyOp(md, op) {
  const { lines, groups } = parseTasks(md)
  const findTask = (id) => {
    for (const g of groups) for (const t of g.tasks) if (t.id === id) return { g, t }
    return null
  }
  const write = (arr) => arr.join('\n')

  if (op.op === 'toggle') {
    const hit = findTask(op.id)
    if (!hit) throw new Error(`no task ${op.id}`)
    const done = !hit.t.done
    const tm = lines[hit.t.line].match(TASK_RE)
    lines[hit.t.line] = `- [${done ? 'x' : ' '}] ${tm[2]} | ${tm[3]} | done_when: ${tm[4]} | needs: ${tm[5]} | status: ${done ? 'done' : 'todo'}`
    return write(lines)
  }

  if (op.op === 'status') {
    const hit = findTask(op.id)
    if (!hit) throw new Error(`no task ${op.id}`)
    const tm = lines[hit.t.line].match(TASK_RE)
    const status = String(op.status || 'todo')
    const done = status === 'done'
    lines[hit.t.line] = `- [${done ? 'x' : ' '}] ${tm[2]} | ${tm[3]} | done_when: ${tm[4]} | needs: ${tm[5]} | status: ${status}`
    return write(lines)
  }

  if (op.op === 'delete') {
    const hit = findTask(op.id)
    if (!hit) throw new Error(`no task ${op.id}`)
    lines.splice(hit.t.line, 1)
    return write(lines)
  }

  if (op.op === 'add') {
    const group = groups.find((g) => g.name === op.group) || groups[groups.length - 1]
    if (!group) throw new Error('no group')
    const id = nextId(groups)
    const title = String(op.title || '').replace(/\|/g, '/').trim() || '未命名任务'
    const needs = op.needs === 'approval' || op.needs === 'user' ? op.needs : 'none'
    const line = `- [ ] ${id} | ${title} | done_when: 完成即算 | needs: ${needs} | status: todo`
    let at = group.lineIndex + 1
    let last = group.lineIndex
    for (const t of group.tasks) last = Math.max(last, t.line)
    at = group.tasks.length ? last + 1 : group.lineIndex + 1
    lines.splice(at, 0, line)
    return write(lines)
  }

  if (op.op === 'addGroup') {
    const nm = String(op.name || '').replace(/[|#]/g, '').trim()
    if (!nm) throw new Error('empty group name')
    let at = lines.length
    while (at > 0 && !lines[at - 1].trim()) at--
    lines.splice(at, 0, '', `## ${nm}`, '')
    return write(lines)
  }

  if (op.op === 'reorder') {
    const hit = findTask(op.id)
    if (!hit) throw new Error(`no task ${op.id}`)
    const moved = lines.splice(hit.t.line, 1)[0]
    let target = null
    if (op.before) {
      const before = findTask(op.before)
      if (before) target = before.t.line
    }
    if (target === null) {
      const g = hit.g
      let last = g.lineIndex
      for (const t of g.tasks) last = Math.max(last, t.line)
      target = Math.min(last + 1, lines.length)
      if (hit.t.line < target) target -= 1
    }
    lines.splice(target, 0, moved)
    return write(lines)
  }

  throw new Error(`unknown op ${op.op}`)
}

function backup(md) {
  try {
    fs.mkdirSync(path.dirname(QUEUE_PATH), { recursive: true })
    fs.writeFileSync(`${QUEUE_PATH}.bak`, md, 'utf8')
  } catch {}
}

function payload() {
  const md = readQueue()
  const { groups } = parseTasks(md)
  return {
    ok: true,
    path: QUEUE_PATH,
    groups: groups.map((g) => ({
      name: g.name,
      tasks: g.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        done: t.done,
        needs: t.needs,
        status: t.status,
      })),
    })),
  }
}

function send(res, code, obj) {
  const body = JSON.stringify(obj)
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'cache-control': 'no-store',
  })
  res.end(body)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (c) => {
      raw += c
      if (raw.length > 1e6) reject(new Error('body too large'))
    })
    req.on('end', () => resolve(raw))
    req.on('error', reject)
  })
}

export function apply(ctx) {
  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') return send(res, 204, {})
      const url = new URL(req.url || '/', 'http://127.0.0.1')

      if (req.method === 'GET' && url.pathname === '/queue') return send(res, 200, payload())
      if (req.method === 'GET' && url.pathname === '/ping') return send(res, 200, { ok: true, port: server.address()?.port })

      if (req.method === 'POST' && url.pathname === '/stt') {
        const raw = await readBody(req)
        const body = JSON.parse(raw || '{}')
        const sc = typeof ctx.get === 'function' ? ctx.get('speechController') : null
        if (!sc) return send(res, 503, { ok: false, error: 'speechController 不可用' })
        const ac = new AbortController()
        let t
        try {
          t = await sc.transcribe({ audioBase64: body.wavBase64, language: body.language || 'zh-CN' }, ac.signal)
        } catch (err) {
          return send(res, 500, { ok: false, error: 'transcribe failed: ' + (err && err.message ? err.message : String(err)) })
        }
        return send(res, 200, { ok: true, text: t.text || '', seconds: t.audioSeconds || 0 })
      }

      if (req.method === 'POST' && url.pathname === '/queue') {
        const raw = await readBody(req)
        const op = JSON.parse(raw || '{}')
        const md = readQueue()
        backup(md)
        const next = applyOp(md, op)
        fs.writeFileSync(QUEUE_PATH, next, 'utf8')
        return send(res, 200, payload())
      }

      return send(res, 404, { ok: false, error: 'not found' })
    } catch (e) {
      return send(res, 500, { ok: false, error: String(e && e.message ? e.message : e) })
    }
  })

  const listen = (i) => {
    if (i >= PORTS.length) {
      ctx.logger?.warn?.('[task-tree] no free port')
      return
    }
    server.once('error', (e) => {
      if (e && e.code === 'EADDRINUSE') listen(i + 1)
      else ctx.logger?.warn?.(`[task-tree] ${e}`)
    })
    server.listen(PORTS[i], '127.0.0.1', () => {
      ctx.logger?.info?.(`[task-tree] listening on 127.0.0.1:${PORTS[i]}`)
    })
  }
  listen(0)

  ctx.effect(() => () => {
    try {
      server.close()
    } catch {}
  })
}
