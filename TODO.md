- improve `useRoomTopic` to use ws payload, instead of just invalidating room query
- unit tests wherever possible
- show opponent's name or nickname (to be created)
- refactor auth flow with the notion that 302 from BE isn't possible anymore, only 401
- problem is back: logout redirects to `http://localhost:3001/login?returnTo=%2F`, login is wrongly
  required again