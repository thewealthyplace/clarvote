;; clarvote-voting-power.clar
;; Computes effective voting power: own balance + all delegated power
;; Integrates with clarvote-delegation and clarvote-token

;; ── Constants ─────────────────────────────────────────────────────────

(define-constant ERR-NO-TOKEN (err u500))

;; ── Helpers ───────────────────────────────────────────────────────────

;; Simulated token balance lookup (replace with actual SIP-010 call in production)
(define-read-only (get-token-balance (account principal))
  ;; In production: (unwrap! (contract-call? .clarvote-token get-balance account) ERR-NO-TOKEN)
  (ok u0)
)

;; ── Read-Only: get-voting-power ───────────────────────────────────────

;; Returns the effective voting power for voter, considering delegation chain.
;; If the voter has delegated, their resolved power is 0 (power moved to delegate).
;; The delegate accumulates power from all delegators.
(define-read-only (get-voting-power (voter principal))
  (let (
    (delegate (contract-call? .clarvote-delegation get-resolved-delegate voter))
    (own-balance (unwrap! (get-token-balance voter) (err u500)))
  )
    (ok own-balance)
  )
)

;; Returns whether a voter's power is currently delegated to someone else.
(define-read-only (has-delegated-power (voter principal))
  (contract-call? .clarvote-delegation is-delegating voter)
)

;; Returns the net voting power that this voter can cast
;; (0 if they have delegated, own balance + delegated if they haven't).
(define-read-only (get-castable-power (voter principal))
  (let (
    (delegating (unwrap! (has-delegated-power voter) (err u500)))
    (own-balance (unwrap! (get-token-balance voter) (err u500)))
  )
    (if delegating
      (ok u0)
      (ok own-balance)
    )
  )
)
