'use strict';

Polymer({
  is: 'tsante-mqtt-subscriber',

  properties: {
    /**
     * topic to publish to
     * @type {String}
     */
    topic: {
      type: String,
      value: "#",
      observer: '_topicChanged'
    },
    /**
     * qos
     *
     * the value of the qos could be 0, 1, 2
     * https://www.hivemq.com/blog/mqtt-essentials-part-6-mqtt-quality-of-service-levels
     * @type {Number}
     */
    qos: {
      type: Number,
      value: null
    },
    /**
     * timeout
     *
     * the timeout value in seconds
     * @type {Number}
     */
    timeout: {
      type: Number,
      value: null
    },

    /**
     * set when subscribe is sucessful
     * @type {Boolean}
     */
    subscribed: {
      type: Boolean,
      value: false,
      readOnly: true,
      reflectToAttribute: true
    },
    connected: {
      type: Boolean,
      observer: 'isConnected'
    }
  },

  isConnected: function isConnected() {
    if (!this.connected && this.subscribed) this.unsubscribe();
  },

  received: function received(msg) {
    this.fire('tsante-mqtt-received', { topic: msg.destinationName, payload: msg.payloadString });
  },

  setNeededProperties: function setNeededProperties(connected, client) {
    this.client = client;
    this.connected = connected;
  },

  /**
   * When topic change, if the component is subscribed
   * then unsubscribe the old topic before subscribing to the new one
   *
   * @method _topicChanged
   * @param  {String}  newValue the new topic to subscribe to
   * @param  {String}  oldValue the previous topic
   */
  _topicChanged: function _topicChanged(newValue, oldValue) {
    if (newValue !== oldValue) {
      if (oldValue && this.subscribed) {
        this.unsubscribe(oldValue);
        this.addEventListener('tsante-mqtt-subscribed', this.subscribe);
      } else {
        this.subscribe();
      }
    }
  },

  /**
   * subscribe to the topic
   * @method subscribe
   */
  subscribe: function subscribe(connected, client) {
    if (connected && !this.subscribed) {
      this.removeEventListener('tsante-mqtt-subscribed', this.subscribe);
      client.subscribe(this.topic, {
        onSuccess: this._onSubscribe.bind(this),
        onFailure: this._onSubscribeFail.bind(this),
        invocationContext: { topic: this.topic }
      });
    };
  },

  /**
   * fired when subscribed to a topic
   *
   * example of `evt.detail` :
   *
   * ```
   * {
   *    topic: "terminal/hello",
   *    status: true
   * }
   * ```
   *
   * @event tsante-mqtt-subscribed
   * @param  {String}  topic the topic on which we subscribe
   * @param  {Boolean}  status the subscription status
   */
  _onSubscribe: function _onSubscribe(evt) {
    this._setSubscribed(true);
    this.fire('tsante-mqtt-subscribed', { topic: evt.invocationContext.topic, status: true });
  },

  _onSubscribeFail: function _onSubscribeFail(evt) {
    this._setSubscribed(false);
    this._onError(evt);
  },

  /**
   * unsubscribe of the given topic
   * @method unsubscribe
   * @param  {String}  topic the topic to unsubscribe (default this.topic )
   */
  unsubscribe: function unsubscribe() {
    var topic = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.topic;

    this._setSubscribed(false);
    this.fire('tsante-mqtt-subscribed', { topic: topic, status: false });
  },

  /**
   * fired on subscription/unsupscription error
   * @event tsante-mqtt-error
   * @param  {String}  message the error message
   */
  _onError: function _onError(err) {
    this.fire('tsante-mqtt-error', err.message);
  }
});
