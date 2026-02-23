;; clarvote-guardian.clar
;; Guardian role management for emergency proposal cancellation
;; Guardian can only cancel proposals in QUEUED state (during timelock window)

;; ── Status Constants ──────────────────────────────────────────────────

(define-constant STATUS-PENDING   u0)
(define-constant STATUS-ACTIVE    u1)
(define-constant STATUS-PASSED    u2)
(define-constant STATUS-DEFEATED  u3)
(define-constant STATUS-QUEUED    u4)
(define-constant STATUS-EXECUTED  u5)
(define-constant STATUS-CANCELLED u6)

;; ── Error Constants ───────────────────────────────────────────────────

(define-constant ERR-NOT-GUARDIAN      (err u401))
(define-constant ERR-NOT-FOUND         (err u404))
(define-constant ERR-WRONG-STATE       (err u403))
(define-constant ERR-ALREADY-CANCELLED (err u405))
(define-constant ERR-GUARDIAN-EXPIRED  (err u406))

;; ── Guardian Storage ──────────────────────────────────────────────────

(define-data-var guardian principal tx-sender)

;; Optional: guardian auto-expires after this block height (0 = no expiry)
(define-data-var guardian-expiry uint u0)

;; ── Proposal Storage ──────────────────────────────────────────────────

(define-map proposals
  uint
  {
    proposer:      principal,
    status:        uint,
    queued-at:     uint,
    timelock-end:  uint,
    deposit:       uint,
    cancel-reason: (optional (string-ascii 256))
  }
)

(define-data-var proposal-count uint u0)

;; ── Cancellation Log (permanent on-chain record) ──────────────────────

(define-map cancellation-log
  uint   ;; proposal-id
  {
    cancelled-by: principal,
    reason:       (string-ascii 256),
    block:        uint
  }
)

;; ── Guardian Management ───────────────────────────────────────────────

;; Transfer guardian role to a new principal
(define-public (set-guardian (new-guardian principal))
  (begin
    (asserts! (is-eq tx-sender (var-get guardian)) ERR-NOT-GUARDIAN)
    (var-set guardian new-guardian)
    (var-set guardian-expiry u0)
    (print { event: "guardian-changed", new-guardian: new-guardian, block: block-height })
    (ok true)
  )
)

;; Set an expiry block height for the guardian role
(define-public (set-guardian-expiry (expiry-block uint))
  (begin
    (asserts! (is-eq tx-sender (var-get guardian)) ERR-NOT-GUARDIAN)
    (var-set guardian-expiry expiry-block)
    (ok true)
  )
)

(define-read-only (get-guardian) (ok (var-get guardian)))

(define-read-only (is-guardian-active)
  (let ((expiry (var-get guardian-expiry)))
    (ok (or (is-eq expiry u0) (< block-height expiry)))
  )
)

;; ── Proposal Helpers (for testing/demo — replace with core integration) ──

(define-public (create-test-proposal (deposit uint))
  (let ((id (+ (var-get proposal-count) u1)))
    (map-set proposals id {
      proposer:      tx-sender,
      status:        STATUS-PENDING,
      queued-at:     u0,
      timelock-end:  u0,
      deposit:       deposit,
      cancel-reason: none
    })
    (var-set proposal-count id)
    (ok id)
  )
)

(define-public (queue-proposal (proposal-id uint) (timelock-blocks uint))
  (let ((proposal (unwrap! (map-get? proposals proposal-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get status proposal) STATUS-PASSED) ERR-WRONG-STATE)
    (map-set proposals proposal-id
      (merge proposal {
        status:       STATUS-QUEUED,
        queued-at:    block-height,
        timelock-end: (+ block-height timelock-blocks)
      })
    )
    (ok true)
  )
)

;; ── Emergency Cancellation ────────────────────────────────────────────

;; Cancel a queued proposal during its timelock window (guardian only)
(define-public (cancel-proposal (proposal-id uint) (reason (string-ascii 256)))
  (let (
    (proposal (unwrap! (map-get? proposals proposal-id) ERR-NOT-FOUND))
    (guardian-active (unwrap! (is-guardian-active) ERR-GUARDIAN-EXPIRED))
  )
    (asserts! (is-eq tx-sender (var-get guardian)) ERR-NOT-GUARDIAN)
    (asserts! guardian-active ERR-GUARDIAN-EXPIRED)
    (asserts! (is-eq (get status proposal) STATUS-QUEUED) ERR-WRONG-STATE)

    ;; Update proposal status to CANCELLED
    (map-set proposals proposal-id
      (merge proposal {
        status:        STATUS-CANCELLED,
        cancel-reason: (some reason)
      })
    )

    ;; Write permanent cancellation log
    (map-set cancellation-log proposal-id {
      cancelled-by: tx-sender,
      reason:       reason,
      block:        block-height
    })

    ;; Emit cancellation event
    (print {
      event:       "proposal-cancelled",
      proposal-id: proposal-id,
      guardian:    tx-sender,
      reason:      reason,
      block:       block-height
    })

    ;; Refund proposer deposit
    (try! (refund-proposer proposal-id (get proposer proposal) (get deposit proposal)))

    (ok true)
  )
)

;; Internal: refund proposer's locked deposit on cancellation
(define-private (refund-proposer (proposal-id uint) (proposer principal) (amount uint))
  (begin
    (print { event: "deposit-refunded", proposal-id: proposal-id, proposer: proposer, amount: amount })
    ;; In production: (as-contract (stx-transfer? amount tx-sender proposer))
    (ok true)
  )
)

;; ── Read-Only Queries ─────────────────────────────────────────────────

(define-read-only (get-proposal (proposal-id uint))
  (ok (map-get? proposals proposal-id))
)

(define-read-only (get-cancellation-log (proposal-id uint))
  (ok (map-get? cancellation-log proposal-id))
)

(define-read-only (get-proposal-status (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal (ok (get status proposal))
    ERR-NOT-FOUND
  )
)
