import { Fragment, useId, useState } from 'react'
import { NavLink, useParams } from 'react-router'
import { FORUM_CHANNELS, isKnownChannel } from './forumApi.js'
import { useForumMessages } from './useForumMessages.js'
import styles from './ForumBoard.module.css'

const TIME_FORMAT = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

/** Route /forum/:channelId. Switching channels is a NavLink click, which aborts the request in flight. */
export function ForumBoard() {
  const headingId = useId()
  const authorId = useId()
  const textId = useId()
  const { channelId } = useParams()
  const { messages, loading, error, postMessage } = useForumMessages(channelId)
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [postState, setPostState] = useState({ status: 'idle', message: '' })

  const channel = FORUM_CHANNELS.find((c) => c.id === channelId)

  async function handleSubmit(event) {
    event.preventDefault()
    if (postState.status === 'sending') return
    setPostState({ status: 'sending', message: 'Sending…' })
    try {
      await postMessage({ author, text })
      setText('')
      setPostState({ status: 'idle', message: 'Message posted.' })
    } catch (err) {
      setPostState({ status: 'error', message: err.message })
    }
  }

  return (
    <section className={styles.board} aria-labelledby={headingId}>
      <h2 id={headingId}>Forum Channels</h2>
      <nav aria-label="Channels">
        <ul className={styles.channels}>
          {FORUM_CHANNELS.map((c) => (
            <li key={c.id}>
              <NavLink to={`/forum/${c.id}`} className={({ isActive }) => (isActive ? styles.activeChannel : styles.channel)}>
                {c.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {!isKnownChannel(channelId) ? (
        <p className={styles.alert} role="alert">
          404: Channel Not Found
        </p>
      ) : (
        <>
          <h3>{channel.label}</h3>
          <output className={styles.status} role="status" aria-live="polite">
            {loading ? `Loading ${channel.label}…` : `${messages.length} message(s) in ${channel.label}.`}
          </output>
          {error && (
            <p className={styles.alert} role="alert">
              Could not load messages: {error}. Is the API running (npm run server)?
            </p>
          )}
          <dl className={styles.messages} aria-busy={loading ? 'true' : 'false'}>
            {messages.map((msg) => (
              <Fragment key={msg.id}>
                <dt>
                  <strong>{msg.author}</strong> <time dateTime={msg.timestamp}>{TIME_FORMAT.format(new Date(msg.timestamp))}</time>
                </dt>
                <dd>{msg.text}</dd>
              </Fragment>
            ))}
          </dl>

          <form className={styles.post} noValidate onSubmit={handleSubmit}>
            <p className={styles.field}>
              <label htmlFor={authorId}>Author</label>
              <input id={authorId} value={author} maxLength={40} autoComplete="nickname" onChange={(e) => setAuthor(e.target.value)} />
            </p>
            <p className={styles.field}>
              <label htmlFor={textId}>Message</label>
              <textarea id={textId} value={text} maxLength={500} rows={3} onChange={(e) => setText(e.target.value)} />
            </p>
            <p>
              <button type="submit" aria-disabled={postState.status === 'sending' ? 'true' : 'false'}>
                Post to {channel.label}
              </button>
            </p>
            <output className={postState.status === 'error' ? styles.alert : styles.status} role="status" aria-live="polite">
              {postState.message}
            </output>
          </form>
        </>
      )}
    </section>
  )
}
