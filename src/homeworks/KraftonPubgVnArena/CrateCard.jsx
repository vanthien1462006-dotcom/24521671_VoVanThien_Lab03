import { useId } from 'react'
import { DROP_WINDOW_MS } from './arenaData.js'
import { formatCountdown, getDropPhase } from './airdropClock.js'
import { formatVnd } from './formatVnd.js'
import { usePubgAirdropTimer } from './usePubgAirdropTimer.js'
import styles from './KraftonPubgVnArena.module.css'

const PHASE_LABEL = {
  WARMUP: 'Warm-up',
  AIRDROP_LIVE: 'Airdrop live',
  LOOTED_OUT: 'Looted out',
  EXPIRED: 'Expired',
}

/**
 * One crate airdrop. The phase is derived during render from the timer's last clock tick.
 * The claim button stays focusable while unavailable: aria-disabled plus a guard in the handler.
 * The countdown is not a live region, so it is not announced on every tick.
 * @param {{
 *   crate: import('./pubg-vn-arena.contract.js').PubgCrateDrop,
 *   stock: number,
 *   isPending: boolean,
 *   ownedCount: number,
 *   onClaim: (crateId: string) => void,
 * }} props
 */
export function CrateCard({ crate, stock, isPending, ownedCount, onClaim }) {
  const titleId = useId()
  const { remainingMs, nowMs } = usePubgAirdropTimer(crate.dropEpochMs)
  const phase = getDropPhase({
    nowMs,
    dropEpochMs: crate.dropEpochMs,
    remainingStock: stock,
    windowMs: DROP_WINDOW_MS,
  })
  const canClaim = phase === 'AIRDROP_LIVE' && !isPending

  return (
    <article className={styles.crate} aria-labelledby={titleId}>
      <h4 id={titleId}>{crate.title}</h4>
      <dl className={styles.crateFacts}>
        <dt>Price</dt>
        <dd>{formatVnd(crate.priceVnd)}</dd>
        <dt>Stock</dt>
        <dd>{stock}</dd>
        <dt>Status</dt>
        <dd>{PHASE_LABEL[phase]}</dd>
        {ownedCount > 0 && (
          <>
            <dt>Claimed by you</dt>
            <dd>{ownedCount}</dd>
          </>
        )}
      </dl>
      {phase === 'WARMUP' && (
        <p>
          Drops in <time dateTime={`PT${Math.ceil(remainingMs / 1000)}S`}>{formatCountdown(remainingMs)}</time>
        </p>
      )}
      <button
        type="button"
        className={styles.claim}
        aria-disabled={!canClaim}
        onClick={() => {
          if (canClaim) onClaim(crate.id)
        }}
      >
        {isPending ? 'Claiming…' : 'Claim'}
      </button>
    </article>
  )
}
