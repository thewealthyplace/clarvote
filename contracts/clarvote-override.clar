;; clarvote-override.clar
;; Per-proposal delegation override — lets a delegator vote directly
;; on a specific proposal, bypassing their active delegation.

;; ── Constants ─────────────────────────────────────────────────────────

(define-constant ERR-ALREADY-OVERRIDDEN (err u450))
(define-constant ERR-PROPOSAL-NOT-FOUND (err u451))

;; ── Storage ───────────────────────────────────────────────────────────

;; (proposal-id, voter) → true if voter has chosen to override their delegation
(define-map delegation-overrides
  { proposal-id: uint, voter: principal }
  bool
)

;; ── Public Functions ──────────────────────────────────────────────────

;; Record that a voter wants to vote directly on a proposal
;; (overriding their active delegation for this proposal only).
(define-public (set-override (proposal-id uint))
  (let (
    (key { proposal-id: proposal-id, voter: tx-sender })
    (existing (map-get? delegation-overrides key))
  )
    (asserts! (is-none existing) ERR-ALREADY-OVERRIDDEN)
    (map-set delegation-overrides key true)
    (print { event: "delegation-override", proposal-id: proposal-id, voter: tx-sender })
    (ok true)
  )
)

;; Remove override (voter reverts to delegated voting for this proposal).
(define-public (clear-override (proposal-id uint))
  (begin
    (map-delete delegation-overrides { proposal-id: proposal-id, voter: tx-sender })
    (ok true)
  )
)

;; ── Read-Only ─────────────────────────────────────────────────────────

;; Returns true if the voter is voting directly on this proposal (not via delegate).
(define-read-only (has-override (proposal-id uint) (voter principal))
  (ok (default-to false (map-get? delegation-overrides { proposal-id: proposal-id, voter: voter })))
)

;; Effective voter for a given (proposal, voter) pair:
;; If override is set → voter votes themselves.
;; Otherwise → resolved delegate votes.
(define-read-only (get-effective-voter (proposal-id uint) (voter principal))
  (let (
    (override (default-to false (map-get? delegation-overrides { proposal-id: proposal-id, voter: voter })))
  )
    (if override
      (ok voter)
      (contract-call? .clarvote-delegation get-resolved-delegate voter)
    )
  )
)
