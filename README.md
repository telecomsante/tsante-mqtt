# \<tsante-mqtt\>

![Polymer](https://img.shields.io/badge/polymer-1.x-blue.svg)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/telecomsante/tsante-mqtt)

A MQTT webcomponent, allowing to have several subscribers and publishers.

The component connect to the MQTT server through a websocket.

The component is based on the [Paho javascript client library](https://eclipse.org/paho/clients/js/).

The component has no GUI.

The component is provided in ES6

    <link rel="import" href="bower_components/tsante-mqtt.html">

or for older browser in ES5

    <link rel="import" href="bower_components/tsante-mqtt.es5.html">

## Quick example

> Nota : the demo doesn't work on webcomponents.org, due to permission access to
the localstorage, to see a demo please consult the demo link below.

```html
<tsante-mqtt host="ws://test.mosquitto.org:8080/" >
  <tsante-mqtt-subscriber topic="terminal/hello"></tsante-mqtt-subscriber>
  <tsante-mqtt-publisher id="publisher" topic="terminal/hello" payload="polymer" ></tsante-mqtt-subscriber>
</tsante-mqtt>
```

The component is licensed under the [ISC License](LICENSE.md)

Demo and doc are available on https://telecomsante.github.io/tsante-mqtt/

## Running tests

> __prerequisites :__ You will need to have __docker__ and __docker-compose__ installed

To run the test suites, you must start a local MQTT server. This is automatically done when running :

```bash
npm test
```

## npm scripts

__npm run start:mosquitto__ : starts a MQTT server into a docker container

__npm run stop:mosquitto__ : stops the MQTT server

__npm test__ : starts the MQTT server and runs the test suites on all installed browsers.

__npm run build-es5__ : builds es5 compatible components

## Git flow

The development of this component follows the git flow recommandations, so when you fork this repository and want to do a PR (push request), do it on the "develop" branch.