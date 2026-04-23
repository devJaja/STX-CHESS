;; ============================================================
;; Stack Chess — Chess Game Contract v2
;; Manages on-chain chess games on the Stacks blockchain.
;; Each game stores both players, turn state, move history,
;; and final outcome. Move validation is handled off-chain.
;; ============================================================

;; ----- Constants -----

(define-constant CONTRACT-OWNER tx-sender)

(define-constant ERR-NOT-AUTHORIZED   (err u100))
(define-constant ERR-GAME-NOT-FOUND   (err u101))
(define-constant ERR-INVALID-MOVE     (err u102))
(define-constant ERR-NOT-YOUR-TURN    (err u103))
(define-constant ERR-GAME-OVER        (err u104))
(define-constant ERR-SAME-PLAYER      (err u105))
(define-constant ERR-DRAW-NOT-OFFERED (err u106))
(define-constant ERR-ALREADY-OFFERED  (err u107))

;; ----- Storage -----

(define-map games
  { game-id: uint }
  {
    white:           principal,
    black:           principal,
    current-turn:    (string-ascii 5),
    status:          (string-ascii 10),
    winner:          (optional principal),
    moves:           (list 200 (string-ascii 10)),
    draw-offered-by: (optional principal),
    created-at:      uint,
    ended-at:        (optional uint)
  }
)

(define-data-var game-counter uint u0)

;; ----- Private Helpers -----

(define-private (is-player-turn (game {
    white: principal, black: principal,
    current-turn: (string-ascii 5), status: (string-ascii 10),
    winner: (optional principal), moves: (list 200 (string-ascii 10)),
    draw-offered-by: (optional principal), created-at: uint, ended-at: (optional uint)
  }))
  (or
    (and (is-eq (get current-turn game) "white") (is-eq tx-sender (get white game)))
    (and (is-eq (get current-turn game) "black") (is-eq tx-sender (get black game)))
  )
)

(define-private (is-participant (game {
    white: principal, black: principal,
    current-turn: (string-ascii 5), status: (string-ascii 10),
    winner: (optional principal), moves: (list 200 (string-ascii 10)),
    draw-offered-by: (optional principal), created-at: uint, ended-at: (optional uint)
  }))
  (or (is-eq tx-sender (get white game)) (is-eq tx-sender (get black game)))
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
        white:           tx-sender,
        black:           opponent,
        current-turn:    "white",
        status:          "active",
        winner:          none,
        moves:           (list),
        draw-offered-by: none,
        created-at:      block-height,
        ended-at:        none
      }
    )
    (var-set game-counter game-id)
    (ok game-id)
  )
)

;; Submit a move. Enforces turn order and minimum move length.
;; Making a move cancels any pending draw offer.
(define-public (make-move (game-id uint) (move (string-ascii 10)))
  (let ((game (unwrap! (map-get? games { game-id: game-id }) ERR-GAME-NOT-FOUND)))
    (asserts! (is-eq (get status game) "active") ERR-GAME-OVER)
    (asserts! (is-player-turn game) ERR-NOT-YOUR-TURN)
    (asserts! (>= (len move) u4) ERR-INVALID-MOVE)
    (map-set games
      { game-id: game-id }
      (merge game {
        current-turn:    (next-turn (get current-turn game)),
        moves:           (unwrap-panic (as-max-len? (append (get moves game) move) u200)),
        draw-offered-by: none
      })
    )
    (ok true)
  )
)

;; Declare a winner and close the game. Either player may call this.
(define-public (end-game (game-id uint) (winner-color (string-ascii 5)))
  (let ((game (unwrap! (map-get? games { game-id: game-id }) ERR-GAME-NOT-FOUND)))
    (asserts! (is-participant game) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status game) "active") ERR-GAME-OVER)
    (map-set games
      { game-id: game-id }
      (merge game {
        status:   "finished",
        winner:   (some (if (is-eq winner-color "white") (get white game) (get black game))),
        ended-at: (some block-height)
      })
    )
    (ok true)
  )
)

;; Resign from the game — caller forfeits, opponent wins.
(define-public (resign (game-id uint))
  (let ((game (unwrap! (map-get? games { game-id: game-id }) ERR-GAME-NOT-FOUND)))
    (asserts! (is-participant game) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status game) "active") ERR-GAME-OVER)
    (let ((winner (if (is-eq tx-sender (get white game)) (get black game) (get white game))))
      (map-set games
        { game-id: game-id }
        (merge game {
          status:   "resigned",
          winner:   (some winner),
          ended-at: (some block-height)
        })
      )
      (ok true)
    )
  )
)

;; Offer a draw. The other player must call accept-draw to finalise.
(define-public (offer-draw (game-id uint))
  (let ((game (unwrap! (map-get? games { game-id: game-id }) ERR-GAME-NOT-FOUND)))
    (asserts! (is-participant game) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status game) "active") ERR-GAME-OVER)
    (asserts! (is-none (get draw-offered-by game)) ERR-ALREADY-OFFERED)
    (map-set games { game-id: game-id } (merge game { draw-offered-by: (some tx-sender) }))
    (ok true)
  )
)

;; Accept a pending draw offer. Closes the game as a draw.
(define-public (accept-draw (game-id uint))
  (let ((game (unwrap! (map-get? games { game-id: game-id }) ERR-GAME-NOT-FOUND)))
    (asserts! (is-participant game) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status game) "active") ERR-GAME-OVER)
    (asserts! (is-some (get draw-offered-by game)) ERR-DRAW-NOT-OFFERED)
    (asserts! (not (is-eq tx-sender (unwrap-panic (get draw-offered-by game)))) ERR-NOT-AUTHORIZED)
    (map-set games
      { game-id: game-id }
      (merge game {
        status:          "draw",
        winner:          none,
        draw-offered-by: none,
        ended-at:        (some block-height)
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

(define-read-only (get-game-status (game-id uint))
  (match (map-get? games { game-id: game-id })
    game (ok (get status game))
    (err u101)
  )
)

(define-read-only (get-move-count (game-id uint))
  (match (map-get? games { game-id: game-id })
    game (ok (len (get moves game)))
    (err u101)
  )
)
