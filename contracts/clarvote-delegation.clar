;; clarvote-delegation.clar
;; Vote delegation with multi-level chain support (max 5 levels)
;; Part of the clarvote governance protocol

;; ── Constants ─────────────────────────────────────────────────────────

(define-constant CONTRACT-OWNER tx-sender)
(define-constant MAX-DEPTH u5)

(define-constant ERR-SELF-DELEGATION      (err u400))
(define-constant ERR-CIRCULAR-DELEGATION  (err u401))
(define-constant ERR-MAX-DEPTH-EXCEEDED   (err u402))
(define-constant ERR-NOT-DELEGATING       (err u403))
(define-constant ERR-ALREADY-DELEGATING   (err u404))

;; ── Storage ───────────────────────────────────────────────────────────

;; Maps delegator → delegatee
(define-map delegations principal principal)

;; Snapshot of delegation power per proposal (proposal-id, voter) → locked-power
(define-map delegation-snapshots
  { proposal-id: uint, voter: principal }
  uint
)

;; ── Delegation Chain Helpers ──────────────────────────────────────────

;; Follow the delegation chain up to MAX-DEPTH levels.
;; Returns the terminal delegate (the one who actually votes).
(define-read-only (resolve-delegate (start principal))
  (let (
    (d1 (map-get? delegations start))
  )
    (if (is-none d1)
      start
      (let ((p1 (unwrap-panic d1)))
        (let ((d2 (map-get? delegations p1)))
          (if (is-none d2)
            p1
            (let ((p2 (unwrap-panic d2)))
              (let ((d3 (map-get? delegations p2)))
                (if (is-none d3)
                  p2
                  (let ((p3 (unwrap-panic d3)))
                    (let ((d4 (map-get? delegations p3)))
                      (if (is-none d4)
                        p3
                        (let ((p4 (unwrap-panic d4)))
                          (let ((d5 (map-get? delegations p4)))
                            (if (is-none d5) p4 (unwrap-panic d5))
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  )
)

;; Detect if adding delegatee would create a cycle (A→B→...→A).
;; Walks the chain from delegatee up to MAX-DEPTH steps.
(define-read-only (would-create-cycle (delegator principal) (delegatee principal))
  (let (
    (r1 (resolve-delegate delegatee))
  )
    (is-eq r1 delegator)
  )
)

;; ── Public: delegate ──────────────────────────────────────────────────

;; Delegate voting power to `delegatee`.
;; Rejects self-delegation and circular chains.
(define-public (delegate (delegatee principal))
  (begin
    (asserts! (not (is-eq delegatee tx-sender)) ERR-SELF-DELEGATION)
    (asserts! (not (would-create-cycle tx-sender delegatee)) ERR-CIRCULAR-DELEGATION)
    (map-set delegations tx-sender delegatee)
    (print { event: "delegation-set", delegator: tx-sender, delegatee: delegatee })
    (ok true)
  )
)

;; ── Public: undelegate ────────────────────────────────────────────────

;; Remove the caller's delegation, reclaiming their voting power.
(define-public (undelegate)
  (begin
    (asserts! (is-some (map-get? delegations tx-sender)) ERR-NOT-DELEGATING)
    (map-delete delegations tx-sender)
    (print { event: "delegation-removed", delegator: tx-sender })
    (ok true)
  )
)

;; ── Read-Only: delegation queries ─────────────────────────────────────

;; Returns the direct delegatee for a principal, if any.
(define-read-only (get-delegate (voter principal))
  (ok (map-get? delegations voter))
)

;; Returns true if voter has an active delegation.
(define-read-only (is-delegating (voter principal))
  (ok (is-some (map-get? delegations voter)))
)

;; Returns the terminal delegate (end of chain) for a voter.
(define-read-only (get-resolved-delegate (voter principal))
  (ok (resolve-delegate voter))
)
