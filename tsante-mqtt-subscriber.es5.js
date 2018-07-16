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
      value: 0
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
    }
  },

  attached: function attached() {
    var _this = this;

    if (this.parentElement.tagName !== 'tsante-mqtt'.toUpperCase()) {
      console.error('tsante-mqtt-subscriber must have a tsante-mqtt parent');
    }
    // when the parent is connected then subscribe to the topic
    this.parentElement.addEventListener('tsante-mqtt-connect', function (evt) {
      if (evt.detail.status) {
        _this._subscribe();
      } else if (_this.subscribed) {
        _this._setSubscribed(false);
        _this.fire('tsante-mqtt-subscribed', { topic: _this.topic, status: false });
      }
    });
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
        this.addEventListener('tsante-mqtt-subscribed', this._subscribe);
      } else {
        this._subscribe();
      }
    }
  },

  /**
   * subscribe to the topic
   * @method _subscribe
   */
  _subscribe: function _subscribe() {
    if (this.parentElement.connected && !this.subscribed) {
      this.removeEventListener('tsante-mqtt-subscribed', this._subscribe);
      var subscribeOptions = {
        onSuccess: this._onSubscribe.bind(this),
        onFailure: this._onSubscribeFail.bind(this),
        invocationContext: { topic: this.topic }
      };
        if (this.qos >= 0 && this.qos <= 2) {
          subscribeOptions['qos'] = this.qos;
        }
        if (this.timeout) {
          subscribeOptions['timeout'] = this.timeout;
        }
        this.parentElement.client.subscribe(this.topic, subscribeOptions);
    }
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

    this.parentElement.client.unsubscribe(topic, {
      onSuccess: this._onUnsubscribe.bind(this),
      onFailure: this._onUnsubscribeFail.bind(this),
      invocationContext: { topic: topic }
    });
  },

  /**
   * on successful unsubscribe send a `tsante-mqtt-subscribed` event
   * @method _onUnsubscribe
   * @param  {Object} evt
   */
  _onUnsubscribe: function _onUnsubscribe(evt) {
    this._setSubscribed(false);
    this.fire('tsante-mqtt-subscribed', { topic: evt.invocationContext.topic, status: false });
  },

  _onUnsubscribeFail: function _onUnsubscribeFail(evt) {
    this._setSubscribed(true);
    this._onError(evt);
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
