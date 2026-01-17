- improve `useRoomTopic` to use ws payload, instead of just invalidating room query
- unit tests wherever possible
- show opponent's name or nickname (to be created)
- on dev+prod, after logout I get redirected to `https://dariolab.com/wordle-duel/login?returnTo=%2F`,
  which triggers a login request right away, it should not.
