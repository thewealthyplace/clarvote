;; clarvote-cancellation-log.clar
;; Permanent, append-only on-chain log of all guardian cancellations
;; Provides auditability and transparency for all emergency actions

(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant CONTRACT-OWNER tx-sender)

;; Total number of cancellations logged
(define-data-var log-count uint u0)

;; log-id -> cancellation record
(define-map cancellation-records
  uint
  {
    proposal-id:  uint,
    guardian:     principal,
    reason:       (string-ascii 256),
    proposer:     principal,
    block-height: uint,
    refunded:     bool
  }
)

;; proposal-id -> log-id (for quick lookup)
(define-map proposal-to-log uint uint)

;; Append a new cancellation record (called by guardian contract)
(define-public (log-cancellation
  (proposal-id uint)
  (guardian    principal)
  (reason      (string-ascii 256))
  (proposer    principal)
  (refunded    bool)
)
  (let ((log-id (+ (var-get log-count) u1)))
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (map-set cancellation-records log-id {
      proposal-id:  proposal-id,
      guardian:     guardian,
      reason:       reason,
      proposer:     proposer,
      block-height: block-height,
      refunded:     refunded
    })
    (map-set proposal-to-log proposal-id log-id)
    (var-set log-count log-id)
    (print {
      event:       "cancellation-logged",
      log-id:      log-id,
      proposal-id: proposal-id,
      guardian:    guardian,
      reason:      reason
    })
    (ok log-id)
  )
)

;; Read a cancellation record by log ID
(define-read-only (get-record (log-id uint))
  (ok (map-get? cancellation-records log-id))
)

;; Read the cancellation record for a specific proposal
(define-read-only (get-record-by-proposal (proposal-id uint))
  (match (map-get? proposal-to-log proposal-id)
    log-id (ok (map-get? cancellation-records log-id))
    (ok none)
  )
)

;; Total cancellations logged
(define-read-only (get-log-count)
  (ok (var-get log-count))
)
