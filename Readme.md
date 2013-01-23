
# prix-ars-2013-server

Server application for Prix Ars 2013 competition.

## Requirement

* Node 0.8.x
* MongoDB 2.2

## Installation

#### Install dependencies.

Using homebrew.

    $ brew install node
    $ brew install mongodb

#### Prepare running application

    $ git clone git@github.com:CircuitLab/prix-ars-2013-server.git
    $ cd prix-ars-2013-server
    $ npm i

#### Run
    
    $ mongod &
    $ npm start
    $ open http://0.0.0.0:3000/

    
## Deployment

    $ git push
    $ cap deploy

## Credit

Copyright (c) 2013 Curcuit Lab. &lt;info@uniba.jp&gt;