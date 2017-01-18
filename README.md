# \<tsante-mqtt\>

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/telecomsante/tsante-mqtt)


A MQTT component, the component connect to the MQTT server through websocket.

The component is based on the [Paho javascript client library](https://eclipse.org/paho/clients/js/).

The component has no GUI.

## Quick example

<!--
```
<custom-element-demo>
  <template>
    <script src="../webcomponentsjs/webcomponents-lite.js"></script>
    <link rel="import" href="tsante-mqtt.html">
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->
```html
<tsante-mqtt host="ws://test.mosquitto.org:8080/" >
  <tsante-mqtt-subscriber topic="terminal/hello"></tsante-mqtt-subscriber>
  <tsante-mqtt-publisher id="publisher" topic="terminal/hello" payload="polymer" ></tsante-mqtt-subscriber>
</tsante-mqtt>
<script>
const publisher = document.querySelector('#publisher')
setInterval(() => {
  publisher.payload = publisher.payload === 'polymer' ? 'world' : 'polymer';
}, 1000)
</script>
```

The component is licensed under the [ISC License](LICENSE.md)

Demo and doc are available on https://telecomsante.github.io/tsante-mqtt/
