;; clarvote-guardian-multisig.clar
;; A simple 2-of-3 multisig wrapper intended to be set as the guardian
;; Requires 2 out of 3 designated signers to approve a cancellation

(define-constant ERR-NOT-SIGNER     (err u420))
(define-constant ERR-ALREADY-SIGNED (err u421))
(define-constant ERR-NOT-ENOUGH-SIGS (err u422))
(define-constant ERR-NOT-FOUND       (err u404))

(define-constant THRESHOLD u2)

;; Signers (set at deploy time — replace with actual addresses)
(define-constant SIGNER-1 'SP1SIGNER000000000000000000000000000)
(define-constant SIGNER-2 'SP2SIGNER000000000000000000000000000)
(define-constant SIGNER-3 'SP3SIGNER000000000000000000000000000)

;; pending cancellation approvals: (proposal-id, signer) -> approved
(define-map approvals { proposal-id: uint, signer: principal } bool)

;; approval count per proposal
(define-map approval-counts uint uint)

(define-read-only (is-signer (addr principal))
  (or (is-eq addr SIGNER-1)
      (is-eq addr SIGNER-2)
      (is-eq addr SIGNER-3))
)

;; Signer approves a cancellation for a given proposal
(define-public (approve-cancellation (proposal-id uint))
  (let (
    (key { proposal-id: proposal-id, signer: tx-sender })
    (existing (map-get? approvals key))
    (count (default-to u0 (map-get? approval-counts proposal-id)))
  )
    (asserts! (is-signer tx-sender) ERR-NOT-SIGNER)
    (asserts! (is-none existing) ERR-ALREADY-SIGNED)
    (map-set approvals key true)
    (map-set approval-counts proposal-id (+ count u1))
    (print { event: "cancellation-approved", proposal-id: proposal-id, signer: tx-sender, total-approvals: (+ count u1) })
    (ok (+ count u1))
  )
)

;; Execute cancellation once threshold is reached
(define-public (execute-cancellation (proposal-id uint) (reason (string-ascii 256)))
  (let ((count (default-to u0 (map-get? approval-counts proposal-id))))
    (asserts! (is-signer tx-sender) ERR-NOT-SIGNER)
    (asserts! (>= count THRESHOLD) ERR-NOT-ENOUGH-SIGS)
    ;; Delegate to guardian contract
    (try! (contract-call? .clarvote-guardian cancel-proposal proposal-id reason))
    (ok true)
  )
)

(define-read-only (get-approval-count (proposal-id uint))
  (ok (default-to u0 (map-get? approval-counts proposal-id)))
)
