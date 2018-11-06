Polymer({
  is: 'tsante-mqtt-subscriber',

  properties: {
    /**
     * topic to publish to
     * @type {String}
     */
    topic: {
      type: String,
      value: '#',
      observer: '_topicChanged',
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
      value: null,
    },
    /**
     * timeout
     *
     * the timeout value in seconds
     * @type {Number}
     */
    timeout: {
      type: Number,
      value: null,
    },

    /**
     * set when subscribe is sucessful
     * @type {Boolean}
     */
    subscribed: {
      type: Boolean,
      value: false,
      readOnly: true,
      reflectToAttribute: true,
    },

    _connected: {
      type: Boolean,
      observer: 'isConnected',
    },
    _client: Object,
  },

  attached: function () {
    let parent = this.parentElement
    while (['tsante-mqtt', 'body'].indexOf(parent.tagName.toLowerCase()) === -1) {
      parent = parent.parentElement
    }
    this.subscribe(parent.connected, parent.client)
  },

  detached: function () {
    this.unsubscribe(this.topic)
  },

  isConnected: function () {
    if (!this._connected && this.subscribed) this.unsubscribe()
  },

  /**
   * filter received messages
   *
   * This method is called by the `tsante-mqtt` ancestor when a message is received
   *
   *
   * @param {destinationName, payloadString} msg
   */
  _received: function (msg) {
    let rightTopic
    if (this.topic[this.topic.length - 1] === '#') {
      let shortTopic = this.topic.split('/').slice(0, -1).join('')
      rightTopic = msg.destinationName.split('/').slice(0, -1).join('').slice(0, shortTopic.length) === shortTopic
    }
    if (rightTopic || msg.destinationName === this.topic) {
      this._fireReceived({ topic: msg.destinationName, payload: msg.payloadString })
    }
  },

  /**
   * fire an event on received message
   *
   * example of the `evt.detail` :
   *
   * ```
   * {
   *   topic: "terminal/hello",
   *   payload: "polymer"
   * }
   * ```
   *
   * @event tsante-mqtt-received
   * @param  {String} topic topic of the received message
   * @param  {String} payload content of the received message
   */
  _fireReceived: function ({topic, payload}) {
    this.fire('tsante-mqtt-received', { topic, payload })
  },

  setNeededProperties: function (connected) {
    this._connected = connected
  },

  /**
   * When topic change, if the component is subscribed
   * then unsubscribe the old topic before subscribing to the new one
   *
   * @method _topicChanged
   * @param  {String}  newValue the new topic to subscribe to
   * @param  {String}  oldValue the previous topic
   */
  _topicChanged: function (newValue, oldValue) {
    if (newValue !== oldValue) {
      if (oldValue && this.subscribed) {
        this.addEventListener('tsante-mqtt-subscribed', this.subscribe, {once: true})
        this.unsubscribe(oldValue)
      } else {
        this.subscribe()
      }
    }
  },

  /**
   * subscribe to the topic
   * this method is called by the `tsante-mqtt`
   * @method subscribe
   *
   * @param {*} connected the connected status of the tsante-mqtt parent
   * @param {*} client the mqtt client of the tsante-mqtt parent
   */
  subscribe: function (connected, client) {
    this._client = this._client || client
    this._connected = this._connected || connected
    if (this._connected && !this.subscribed) {
      this._client.subscribe(this.topic, {
        onSuccess: this._onSubscribe.bind(this),
        onFailure: this._onSubscribeFail.bind(this),
        invocationContext: { topic: this.topic },
      })
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
  _onSubscribe: function (evt) {
    this._setSubscribed(true)
    this.fire('tsante-mqtt-subscribed', { topic: evt.invocationContext.topic, status: true })
  },

  _onSubscribeFail: function (evt) {
    this._setSubscribed(false)
    this._onError(evt)
  },

  /**
   * unsubscribe of the given topic
   * @method unsubscribe
   * @param  {String}  topic the topic to unsubscribe (default this.topic )
   */
  unsubscribe: function (topic = this.topic) {
    this._setSubscribed(false)
    this.fire('tsante-mqtt-subscribed', { topic: topic, status: false })
  },

  /**
   * fired on subscription/unsupscription error
   * @event tsante-mqtt-error
   * @param  {String}  message the error message
   */
  _onError (err) {
    this.fire('tsante-mqtt-error', err.message)
  },
})
