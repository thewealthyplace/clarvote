;; clarvote-refund.clar
;; Handles proposer deposit refunds upon cancellation
;; Deposit is locked in STX when a proposal is created and refunded on cancellation

(define-constant CONTRACT-OWNER   tx-sender)
(define-constant ERR-NOT-GUARDIAN (err u401))
(define-constant ERR-NO-DEPOSIT   (err u410))
(define-constant ERR-TRANSFER     (err u411))

;; proposer -> locked STX deposit
(define-map locked-deposits principal uint)

;; Lock a deposit when a proposal is submitted
(define-public (lock-deposit (proposer principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-GUARDIAN)
    (try! (stx-transfer? amount proposer (as-contract tx-sender)))
    (map-set locked-deposits proposer amount)
    (print { event: "deposit-locked", proposer: proposer, amount: amount })
    (ok true)
  )
)

;; Refund a proposer's deposit (called by guardian contract on cancellation)
(define-public (refund-deposit (proposer principal))
  (let ((amount (unwrap! (map-get? locked-deposits proposer) ERR-NO-DEPOSIT)))
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-GUARDIAN)
    (map-delete locked-deposits proposer)
    (try! (as-contract (stx-transfer? amount tx-sender proposer)))
    (print { event: "deposit-refunded", proposer: proposer, amount: amount })
    (ok amount)
  )
)

;; Slash a deposit (on malicious proposal — sent to treasury)
(define-public (slash-deposit (proposer principal) (treasury principal))
  (let ((amount (unwrap! (map-get? locked-deposits proposer) ERR-NO-DEPOSIT)))
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-GUARDIAN)
    (map-delete locked-deposits proposer)
    (try! (as-contract (stx-transfer? amount tx-sender treasury)))
    (print { event: "deposit-slashed", proposer: proposer, amount: amount, treasury: treasury })
    (ok amount)
  )
)

(define-read-only (get-deposit (proposer principal))
  (ok (map-get? locked-deposits proposer))
)
