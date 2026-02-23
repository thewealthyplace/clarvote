;; clarvote-token.clar
;; SIP-010 governance token used for voting power in clarvote DAO

(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

(define-fungible-token clarvote-token)

(define-constant CONTRACT-OWNER   tx-sender)
(define-constant ERR-NOT-OWNER    (err u100))
(define-constant ERR-NOT-SENDER   (err u101))
(define-constant ERR-ZERO-AMOUNT  (err u103))
(define-constant ERR-SELF-TX      (err u104))

(define-data-var token-name    (string-ascii 32)           "ClarVote Token")
(define-data-var token-symbol  (string-ascii 10)           "CVOTE")
(define-data-var token-decimals uint                       u6)
(define-data-var token-uri     (optional (string-utf8 256)) none)

;; Returns the token name
(define-read-only (get-name)     (ok (var-get token-name)))

;; Returns the token symbol
(define-read-only (get-symbol)   (ok (var-get token-symbol)))

;; Returns the number of decimals
(define-read-only (get-decimals) (ok (var-get token-decimals)))

;; Returns balance of account
(define-read-only (get-balance (account principal))
  (ok (ft-get-balance clarvote-token account)))

;; Returns total supply
(define-read-only (get-total-supply)
  (ok (ft-get-supply clarvote-token)))

;; Returns token URI
(define-read-only (get-token-uri) (ok (var-get token-uri)))

;; Transfers tokens between principals
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-SENDER)
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    (asserts! (not (is-eq sender recipient)) ERR-SELF-TX)
    (try! (ft-transfer? clarvote-token amount sender recipient))
    (match memo m (print m) 0x)
    (ok true)))

;; Owner can mint governance tokens
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-OWNER)
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    (ft-mint? clarvote-token amount recipient)))

;; Initialise: mint 10M tokens to deployer
(begin
  (try! (ft-mint? clarvote-token u10000000000000 CONTRACT-OWNER)))
