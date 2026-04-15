;; ============================================================
;; Stack Chess — Chess Game Contract
;; Manages on-chain chess games on the Stacks blockchain.
;; Each game stores both players, turn state, move history,
;; and final outcome. Move validation is handled off-chain.
;; ============================================================

;; ----- Constants -----

(define-constant CONTRACT-OWNER tx-sender)

(define-constant ERR-NOT-AUTHORIZED  (err u100))
(define-constant ERR-GAME-NOT-FOUND  (err u101))
(define-constant ERR-NOT-YOUR-TURN   (err u103))
(define-constant ERR-GAME-OVER       (err u104))
(define-constant ERR-SAME-PLAYER     (err u105))

;; ----- Storage -----

(define-map games
  { game-id: uint }
  {
    white:        principal,
    black:        principal,
    current-turn: (string-ascii 5),
    status:       (string-ascii 10),
    winner:       (optional principal),
    moves:        (list 200 (string-ascii 10))
  }
)

(define-data-var game-counter uint u0)

;; ----- Private Helpers -----

(define-private (is-player-turn (game { white: principal, black: principal, current-turn: (string-ascii 5), status: (string-ascii 10), winner: (optional principal), moves: (list 200 (string-ascii 10)) }))
  (or
    (and (is-eq (get current-turn game) "white") (is-eq tx-sender (get white game)))
    (and (is-eq (get current-turn game) "black") (is-eq tx-sender (get black game)))
  )
)

(define-private (next-turn (current (string-ascii 5)))
  (if (is-eq current "white") "black" "white")
)

;; ----- Public Functions -----

;; Create a new game. Caller becomes white, opponent becomes black.
(define-public (create-game (opponent principal))
  (let ((game-id (+ (var-get game-counter) u1)))
    (asserts! (not (is-eq tx-sender opponent)) ERR-SAME-PLAYER)
    (map-set games
      { game-id: game-id }
      {
        white:        tx-sender,
        black:        opponent,
        current-turn: "white",
        status:       "active",
        winner:       none,
        moves:        (list)
      }
    )
    (var-set game-counter game-id)
    (ok game-id)
  )
)

;; Submit a move for the active game. Enforces turn order.
(define-public (make-move (game-id uint) (move (string-ascii 10)))
  (let ((game (unwrap! (map-get? games { game-id: game-id }) ERR-GAME-NOT-FOUND)))
    (asserts! (is-eq (get status game) "active") ERR-GAME-OVER)
    (asserts! (is-player-turn game) ERR-NOT-YOUR-TURN)
    (map-set games
      { game-id: game-id }
      (merge game {
        current-turn: (next-turn (get current-turn game)),
        moves:        (unwrap-panic (as-max-len? (append (get moves game) move) u200))
      })
    )
    (ok true)
  )
)

;; Declare a winner and close the game. Either player may call this.
(define-public (end-game (game-id uint) (winner-color (string-ascii 5)))
  (let ((game (unwrap! (map-get? games { game-id: game-id }) ERR-GAME-NOT-FOUND)))
    (asserts!
      (or (is-eq tx-sender (get white game)) (is-eq tx-sender (get black game)))
      ERR-NOT-AUTHORIZED
    )
    (asserts! (is-eq (get status game) "active") ERR-GAME-OVER)
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

;; ----- Read-Only Functions -----

(define-read-only (get-game (game-id uint))
  (map-get? games { game-id: game-id })
)

(define-read-only (get-game-count)
  (ok (var-get game-counter))
)
