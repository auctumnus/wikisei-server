# wikisei
Wikisei (/ˈwɪ.ki:.ˌseɪ/ or /ɰᵝì.↑kí.sé:/ if you're elitist, from 惑星 *wakusei*) is Javascript wiki software originally meant for conworlding, but could be used for a variety of purposes.
This is specifically the server portion; official frontend is WIP, but should be available soon™.

## installation
Run `npm install` to grab dependencies, and then `npm run init-db` to make the database.

## usage
Run `npm run start` after installation to start the wikisei server. By default, the server runs on port 1337, but will prioritize a port set by the `PORT` environment variable.
API docs are available in api.md.