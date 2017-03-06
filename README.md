# \<tsante-mqtt\>

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/telecomsante/tsante-mqtt)


A MQTT component, the component connect to the MQTT server through websocket.

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
