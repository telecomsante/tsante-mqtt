'use strict';

Polymer({
  is: 'tsante-mqtt-publisher',

  properties: {
    /**
     * the topic to publish in
     *
     * when the topic is changed, the payload is changed to null.
     *
     * @type {String}
     */
    topic: {
      type: String,
      observer: '_topicChanged'
    },
    /**
     * qos
     *
     * the value of the qos could be 0, 1, 2
     * @type {Number}
     */
    qos: {
      type: Number,
      value: 0
    },
    /**
     * retain flag
     * @type {Boolean}
     */
    retained: {
      type: Boolean,
      value: false
    },
    /**
     * the payload to send
     * @type {String}
     */
    payload: {
      type: String,
      value: null
    },
    alreadyPublished: {
      type: Boolean,
      value: false
      // observer: 'isConnected'
    },
    connected: {
      type: Boolean
      // observer: 'isConnected'
    }
  },

  observers: ['isConnected(alreadyPublished,connected)', 'publish(payload)'],

  setNeededProperties: function setNeededProperties(connected, client) {
    console.log('pubNeeded');
    this.connected = connected;
    this.client = client;
  },

  isConnected: function isConnected() {
    console.log('isConnected');
    if (this.connected === true && !this.alreadyPublished && this.client) this.publish();
  },

  _topicChanged: function _topicChanged(newValue) {
    this.payload = null;
    this.alreadyPublished = false;
  },

  /**
   * publish to the server
   *
   * @method publish
   * @param  {String} payload the value to publish
   * @param  {Number} qos the qos of the message (0,1,2) by default this.qos
   * @param  {Boolean} retained flag indicates that the server must or not keep the value by default this.retained
   */
  publish: function publish(payload, qos, retained) {
    console.log('pubCli', this.client);
    if (this.connected) {
      console.log('publish on connected');
      payload = typeof payload === 'string' ? payload : this.payload;
      if (payload === null) return;
      qos = !qos || isNaN(qos) ? this.qos : qos;
      retained = typeof retained === 'boolean' ? retained : this.retained;
      this.client.send(this.topic, payload, qos, retained);
      this.alreadyPublished = true;
    }
  }
});
