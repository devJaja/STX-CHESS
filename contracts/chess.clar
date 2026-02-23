;; Chess Game Contract
;; Manages chess games on Stacks blockchain

(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u100))
(define-constant err-game-not-found (err u101))
(define-constant err-invalid-move (err u102))
(define-constant err-not-your-turn (err u103))
(define-constant err-game-over (err u104))

(define-map games
  { game-id: uint }
  {
    white: principal,
    black: principal,
    current-turn: (string-ascii 5),
    status: (string-ascii 10),
    winner: (optional principal),
    moves: (list 200 (string-ascii 10))
  }
)

(define-data-var game-counter uint u0)

(define-public (create-game (opponent principal))
  (let ((game-id (+ (var-get game-counter) u1)))
    (asserts! (not (is-eq tx-sender opponent)) (err u105))
    (map-set games
      { game-id: game-id }
      {
        white: tx-sender,
        black: opponent,
        current-turn: "white",
        status: "active",
        winner: none,
        moves: (list)
      }
    )
    (var-set game-counter game-id)
    (ok game-id)
  )
)

(define-public (make-move (game-id uint) (move (string-ascii 10)))
  (let ((game (unwrap! (map-get? games { game-id: game-id }) err-game-not-found)))
    (asserts! (is-eq (get status game) "active") err-game-over)
    (asserts! 
      (or 
        (and (is-eq (get current-turn game) "white") (is-eq tx-sender (get white game)))
        (and (is-eq (get current-turn game) "black") (is-eq tx-sender (get black game)))
      )
      err-not-your-turn
    )
    (map-set games
      { game-id: game-id }
      (merge game {
        current-turn: (if (is-eq (get current-turn game) "white") "black" "white"),
        moves: (unwrap-panic (as-max-len? (append (get moves game) move) u200))
      })
    )
    (ok true)
  )
)

(define-public (end-game (game-id uint) (winner-color (string-ascii 5)))
  (let ((game (unwrap! (map-get? games { game-id: game-id }) err-game-not-found)))
    (asserts! 
      (or (is-eq tx-sender (get white game)) (is-eq tx-sender (get black game)))
      err-not-authorized
    )
    (map-set games
      { game-id: game-id }
      (merge game {
        status: "finished",
        winner: (some (if (is-eq winner-color "white") (get white game) (get black game)))
      })
    )
    (ok true)
  )
)

(define-read-only (get-game (game-id uint))
  (map-get? games { game-id: game-id })
)

(define-read-only (get-game-count)
  (ok (var-get game-counter))
)
