# waves-ticketing
Waves white label ticketing solution

# known bugs UI
You need to click in the top left corner on Ticket Store to refresh UI.
The store address is hard coded for prototyping purposes.

# tools
- visual studio code
- waves-Ride for visual studio 
  - https://marketplace.visualstudio.com/items?itemName=wavesplatform.waves-ride
- docker (we will setup our own waves node)
- surfboard (to run tests on existing nodes)
  - install nodejs https://nodejs.org/en/download/
  - `npm install -g @waves/surfboard`
- waves keeper
  - https://wavesplatform.com/products-keeper
  
 # run a private node & explorer
 
### run a node
 - `docker run -d -p 6869:6869 wavesplatform/waves-private-node`
 
 test if node is running
 -  browser => `http://localhost:6869`

### run a waves explorer
 - `docker run -d -e API_NODE_URL=http://localhost:6869 -e NODE_LIST=http://localhost:6869 -p 3000:8080 wavesplatform/explorer`

 test if explorer is running
 - browser => `http://localhost:3000`
 
 (source: https://blog.wavesplatform.com/how-to-build-deploy-and-test-a-waves-ride-dapp-785311f58c2)

# git clone

### use of https

To download from private repo when 2fa is not enabled:
- git clone https://`username`:`password`@github.com/jorisadri/waves-ticketing

When 2fa is enabled (https://github.com/settings/tokens)
- https://`personal-access-token`@github.com/jorisadri/waves-ticketing

### use of ssh

- git clone ssh://git@github.com/jorisadri/waves-ticketing.git

## Development

Run:  
`npm i`  
`npm run start-dev`

This will launch a Webpack development server, rebuilding the project
automatically each time the sources are updated.

## Production
Run:  
`npm i`  
`npm run build`  
`npm run start` 
 
This will build the project in production mode and launch the Express server on port 3000.

This [project](https://gitlab.com/byzantine-solutions/wavescrow/tree/master) has been a great starting point for UI development.