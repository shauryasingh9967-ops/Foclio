import React, { useRef, useState, useMemo } from 'react'
import { useNotes } from '../hooks/useNotes'
import { fmtTime } from '../utils/video'
import {
  Skeleton, Button, IconButton, EmptyState, ErrorState,
  PlusIcon, XIcon, SearchIcon, StarIcon, TrashIcon, EditIcon,
  ClockIcon, NotesIcon,
} from './ui'

export default function NotesPanel({ videoId, getCurrentTime, currentTime, onSeekTo, toast }) {
  const { items, loading, error, addNote, updateNote, deleteNote } = useNotes({ videoId })

  const [text, setText]         = useState('')
  const [important, setImportant] = useState(false)
  const [adding, setAdding]     = useState(false)
  const [editId, setEditId]     = useState(null)
  const [editText, setEditText] = useState('')
  const [search, setSearch]     = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [saving, setSaving]     = useState(false)
  const textareaRef = useRef(null)
  const activeNoteRef = useRef(null)

  // Find active note = closest note at or behind current playback time
  const activeId = useMemo(() => {
    if (!currentTime || currentTime < 1) return null
    let best = null
    for (const n of items) {
      if (n.timestamp <= currentTime) {
        if (!best || n.timestamp > best.timestamp) best = n
      }
    }
    return best?.id ?? null
  }, [items, currentTime])

  // Filtered list
  const displayed = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(n => n.content?.toLowerCase().includes(q))
  }, [items, search])

  async function handleAdd() {
    const content = text.trim()
    if (!content) return
    setSaving(true)
    try {
      const ts = typeof getCurrentTime === 'function' ? Math.floor(getCurrentTime()) : 0
      await addNote({ timestamp: ts, content, isImportant: important })
      toast?.success(`Note saved at ${fmtTime(ts)}`)
      setText(''); setImportant(false); setAdding(false)
    } catch (err) {
      toast?.error(err.message || 'Failed to save note')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(noteId) {
    try {
      await deleteNote(noteId)
      toast?.info('Note deleted', { duration: 2000 })
    } catch (err) {
      toast?.error(err.message)
    }
  }

  async function handleToggleStar(note) {
    try {
      await updateNote(note.id, { is_important: !note.is_important })
    } catch (err) {
      toast?.error(err.message)
    }
  }

  async function handleSaveEdit(noteId) {
    const content = editText.trim()
    if (!content) return
    try {
      await updateNote(noteId, { content })
      setEditId(null); setEditText('')
    } catch (err) {
      toast?.error(err.message)
    }
  }

  function handleNoteClick(note) {
    if (onSeekTo) {
      onSeekTo(note.timestamp)
    }
  }

  const importantCount = items.filter(n => n.is_important).length

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0
        border-b border-bg-border">
        <div className="flex items-center gap-2">
          <NotesIcon size={14} className="text-text-muted" />
          <span className="text-sm font-medium text-text-primary">Notes</span>
          {items.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md
              bg-bg-raised text-text-muted border border-bg-border">
              {items.length}
            </span>
          )}
          {importantCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md
              bg-accent-dim text-accent border border-accent-border">
              ★ {importantCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            onClick={() => { setShowSearch(v => !v); if (showSearch) setSearch('') }}
            title="Search notes"
            variant={showSearch ? 'accent' : 'ghost'}
            size="sm"
          >
            <SearchIcon size={13} />
          </IconButton>
          <button
            onClick={() => { setAdding(v => !v); if (!adding) setTimeout(() => textareaRef.current?.focus(), 50) }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs
              border transition-all duration-200
              ${adding
                ? 'bg-bg-raised border-bg-border text-text-primary'
                : 'bg-bg-surface border-bg-border text-text-secondary hover:text-text-primary'
              }`}
          >
            {adding ? <XIcon size={11} /> : <PlusIcon size={11} />}
            {adding ? 'Cancel' : 'Add'}
          </button>
        </div>
      </div>

      {/* ── Search box ── */}
      {showSearch && (
        <div className="px-3 py-2 border-b border-bg-border flex-shrink-0 animate-fade-down">
          <div className="relative">
            <SearchIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search notes…" autoFocus
              className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-bg-raised
                border border-bg-border text-text-primary placeholder:text-text-muted
                outline-none focus:border-accent/40 transition-colors"
            />
          </div>
        </div>
      )}

      {/* ── Add note form ── */}
      {adding && (
        <div className="px-3 py-3 border-b border-bg-border flex-shrink-0 animate-fade-down">
          <div className="rounded-xl border border-bg-border bg-bg-raised overflow-hidden
            focus-within:border-accent/40 transition-colors duration-200">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd()
                if (e.key === 'Escape') { setAdding(false); setText('') }
              }}
              placeholder="What's happening right now…"
              rows={3}
              className="w-full bg-transparent px-3 pt-3 pb-1 text-xs
                text-text-primary placeholder:text-text-muted
                border-none outline-none resize-none"
            />
            <div className="flex items-center justify-between px-3 pb-2.5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setImportant(v => !v)}
                  className={`flex items-center gap-1 text-[11px] transition-colors
                    ${important ? 'text-accent' : 'text-text-muted hover:text-text-secondary'}`}
                >
                  <StarIcon size={12} filled={important} />
                  Important
                </button>
                <span className="text-[10px] text-text-muted font-mono">⌘↵ to save</span>
              </div>
              <Button size="sm" onClick={handleAdd} loading={saving} disabled={!text.trim() || saving}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notes list ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2 space-y-1.5">
        {loading ? (
          <NotesSkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : displayed.length === 0 ? (
          <EmptyState
            icon={<NotesIcon size={18} />}
            title={search ? 'No matches' : 'No notes yet'}
            description={search ? 'Try a different search.' : 'Add a note to capture what matters at any timestamp.'}
          />
        ) : (
          displayed.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              isActive={note.id === activeId}
              isEditing={editId === note.id}
              editText={editText}
              onEditTextChange={setEditText}
              onClick={() => handleNoteClick(note)}
              onEdit={() => { setEditId(note.id); setEditText(note.content ?? '') }}
              onSaveEdit={() => handleSaveEdit(note.id)}
              onCancelEdit={() => { setEditId(null); setEditText('') }}
              onDelete={() => handleDelete(note.id)}
              onToggleStar={() => handleToggleStar(note)}
              ref={note.id === activeId ? activeNoteRef : null}
            />
          ))
        )}
      </div>
    </div>
  )
}

const NoteCard = React.forwardRef(function NoteCard({
  note, isActive, isEditing, editText, onEditTextChange,
  onClick, onEdit, onSaveEdit, onCancelEdit, onDelete, onToggleStar,
}, ref) {
  return (
    <div
      ref={ref}
      className={`group relative rounded-xl border p-3 cursor-pointer
        transition-all duration-300
        ${isActive
          ? 'bg-accent-dim border-accent-border'
          : 'bg-bg-surface border-bg-border hover:bg-bg-raised hover:border-bg-muted'
        }`}
      onClick={!isEditing ? onClick : undefined}
    >
      {/* Timestamp + actions row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <ClockIcon size={11} className={isActive ? 'text-accent' : 'text-text-muted'} />
          <span className={`text-[11px] font-mono ${isActive ? 'text-accent' : 'text-text-muted'}`}>
            {fmtTime(note.timestamp ?? 0)}
          </span>
          {note.is_important && <StarIcon size={11} filled className="text-accent" />}
        </div>

        {/* Action buttons — visible on hover or active */}
        <div
          className={`flex items-center gap-0.5 transition-opacity duration-150
            ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          onClick={e => e.stopPropagation()}
        >
          <NoteAction onClick={onToggleStar} title={note.is_important ? 'Unstar' : 'Star'}>
            <StarIcon size={12} filled={note.is_important} />
          </NoteAction>
          {!isEditing && (
            <NoteAction onClick={onEdit} title="Edit">
              <EditIcon size={12} />
            </NoteAction>
          )}
          <NoteAction onClick={onDelete} title="Delete" danger>
            <TrashIcon size={12} />
          </NoteAction>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div onClick={e => e.stopPropagation()}>
          <textarea
            value={editText}
            onChange={e => onEditTextChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSaveEdit()
              if (e.key === 'Escape') onCancelEdit()
            }}
            rows={3} autoFocus
            className="w-full bg-transparent text-xs text-text-primary
              border-none outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" onClick={onSaveEdit}>Save</Button>
            <button onClick={onCancelEdit}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className={`text-xs leading-relaxed whitespace-pre-wrap
          ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
          {note.content}
        </p>
      )}
    </div>
  )
})

function NoteAction({ children, onClick, title, danger }) {
  return (
    <button onClick={onClick} title={title}
      className={`w-6 h-6 rounded-md flex items-center justify-center
        transition-all duration-100
        ${danger
          ? 'text-text-muted hover:text-danger hover:bg-danger-dim'
          : 'text-text-muted hover:text-text-primary hover:bg-bg-overlay'
        }`}>
      {children}
    </button>
  )
}

function NotesSkeleton() {
  return (
    <div className="space-y-2 pt-1">
      {[72, 90, 60].map((w, i) => (
        <div key={i} className="p-3 rounded-xl border border-bg-border bg-bg-surface">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-16 h-3" />
          </div>
          <Skeleton className={`h-2.5 mb-1.5`} style={{ width: `${w}%` }} />
          {i < 2 && <Skeleton className="h-2.5 w-1/2" />}
        </div>
      ))}
    </div>
  )
}
