;; clarvote-delegation-events.clar
;; Event definitions and helpers for indexer tracking of delegation changes

;; ── Event Helpers ─────────────────────────────────────────────────────

;; Emits a structured event when a delegation is set
(define-public (emit-delegation-set (delegator principal) (delegatee principal))
  (begin
    (print {
      event: "delegation-set",
      delegator: delegator,
      delegatee: delegatee,
      block: block-height
    })
    (ok true)
  )
)

;; Emits a structured event when a delegation is removed
(define-public (emit-delegation-removed (delegator principal))
  (begin
    (print {
      event: "delegation-removed",
      delegator: delegator,
      block: block-height
    })
    (ok true)
  )
)

;; Emits a structured event when a per-proposal override is registered
(define-public (emit-override-set (proposal-id uint) (voter principal))
  (begin
    (print {
      event: "delegation-override-set",
      proposal-id: proposal-id,
      voter: voter,
      block: block-height
    })
    (ok true)
  )
)
