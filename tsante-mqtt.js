Polymer({

  is: 'tsante-mqtt',

  properties: {
    /**
     * the url of the server
     *
     * by exapmple :
     * `ws://test.mosquitto.org:8080/`
     *
     * @type {String}
     */
    host: {
      type: String,
    },

    /**
     * clientID
     *
     * the clientID is used by the server to retrieve the previous session
     *
     * @type {String}
     */
    clientID: {
      type: String,
      value: function() {
        return Math.random().toString(36).replace(/[^a-z]+/g, '');
      }
    },

    /**
     * username
     * @type {String}
     */
    username: {
      type: String,
    },

    /**
     * password
     * @type {String}
     */
    password: {
      type: String,
    },

    /**
     * timeout of the connection in seconds
     * @type {Number}
     */
    timeout: {
      type: Number,
      value: 10,
    },

    /**
     * retry connect after a period
     * the time is in seconds
     * @type {Number}
     */
    retry: {
      type: Number,
      value: 0,
    },

    /**
     * if true(default) the client and server persistent state
     * is deleted on successful connect.
     *
     * @type {Boolean}
     */
    cleanSession: {
      type: Boolean,
      value: true,
    },

    /**
     * message sent by the server when the client disconnects abnormally.
     *
     *
     * @type {String}
     */
    willMessage: {
      type: Object,
      value: function() { return {}; },
    },

    /**
     * The mqtt client
     * @type {Object}
     */
    client: {
      type: Object,
      notify: true,
    },

    /**
     * the connection status
     * @type {Boolean}
     */
    connected: {
      type: Boolean,
      value:false,
      readOnly: true,
      reflectToAttribute: true,
      observer: '_connectedChanged'
    }
  },

  observers: [
    'sendInfoToPubSub(connected,client)',
    '_initializeClient(host,clientID)',
    'connect(username, password)',
  ],

  sendInfoToPubSub(connected,client) {
    let pubSub = [].slice.call(this.querySelectorAll('tsante-mqtt-publisher, tsante-mqtt-subscriber'))
    for(let value of pubSub){
      value.setNeededProperties(this.connected,this.client)
    }
  },

  attached() {
    this.connect();
  },

  detached() {
    this.disconnect();
  },

  _initializeClient: function(host,clientID) {
    if(this.connected && this.client) { this.disconnect(); }
    this.client = new Paho.MQTT.Client(this.host, this.clientID);
    this.client.onConnectionLost = this._onConnectionLost.bind(this);
    this.client.onMessageArrived = this._onMessageArrived.bind(this);
    this.client.onMessageDelivered = this._onMessageDelivered.bind(this);
    this.connect();
  },

  _onConnect: function() {
    this._setConnected(true);
  },

  /**
   * sent when the connection fails
   * @event tsante-mqtt-connect-error
   * @param  {String} message message of the error
   * @param  {Boolean} status status of the connection
   */
  _onFail: function() {
    this._setConnected(false);
    this.fire('tsante-mqtt-connect-error', {
      status: this.connected,
      message: 'fail to connect',
     });
     this._retry();
  },

  _retry: function() {
    if(this.retry) { setTimeout(this.connect.bind(this), this.retry*1000); }
  },

  /**
   * Fired when the status of the connection change
   *
   * example of `evt.detail` :
   *
   * ```
   * { status: true }
   * ```
   *
   * @event tsante-mqtt-connect
   * @param {Boolean} status the status of the connection
   */
  _connectedChanged: function() {
    let subscribers = [].slice.call(this.querySelectorAll('tsante-mqtt-subscriber'));
    for(let value of subscribers){
      if(this.connected) {
        value.subscribe(this.connected,this.client)
        value._setSubscribed(true)
        this.fire('tsante-mqtt-connect', { status:this.connected });
      // }else{
        // value._setSubscribed(false);
        // value.fire('tsante-mqtt-subscribed', { topic: this.topic, status: false });
      }
    }
  },

  _onConnectionLost: function(msg) {
    this._setConnected(false);
    this._retry();
  },

  /**
   * fired when a message is read
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
  _onMessageArrived: function(msg) {
    let subscribers = [].slice.call(this.querySelectorAll('tsante-mqtt-subscriber'))
    for(let value of subscribers){
      value.received(msg);
    }
  },

  /**
   * called when a message has been delivered. All processing that this
   * Client will ever do has been completed.
   *
   * @method _onMessageDelivered
   * @param  {Object}            msg the delivered message
   */
  _onMessageDelivered: function(msg) {
    /**
     * fired when a message has been delivered
     *
     * example of `evt.detail` :
     * ```
     * {
     *    topic: 'terminal/hello',
     *    payload: 'world'
     * }
     * ```
     *
     * @event tsante-mqtt-delivered
     * @param {String} topic the topic
     * @param {String} payload the content of the message
     */
    if(typeof msg.payloadString === 'string'){
      this.fire('tsante-mqtt-delivered', { topic:msg.destinationName, payload:msg.payloadString })
    }
  },

  /**
   * open the connection to the server
   *
   * @method connect
   * @param  {String} username the login to use
   * @param  {String} password the password to use
   */
  connect: function(username, password) {
    if(!this.client) return;
    this.debounce('connect',() => {
      const connectOption = {
        onSuccess: this._onConnect.bind(this),
        onFailure: this._onFail.bind(this),
        timeout: this.timeout,
        cleanSession: this.cleanSession,
      };
      if(this.username || username) {
        this.username = this.username || username;
        connectOption.userName = this.username || username;
      }
      if(this.password || password) {
        this.password = this.password || password;
        connectOption.password = this.password || password;
      }
      try {
        this.client.connect(connectOption);
      } catch(err) {
        this._onError(err.message);
      }
    }, 100);
  },

  /**
   * disconnect the client
   * @method disconnect
   */
  disconnect: function() {
    // if (!this.client) return;
    try {
      this.client.disconnect();
      this._setConnected(false);
      this.fire('tsante-mqtt-connect', { status:this.connected });
    } catch(err) {
      this._onError(err.message);
    }
  },

  /**
   * fired when an error occurs while connect or disconnect
   *
   * example of error :
   *  - "AMQJS0011E Invalid state not connecting or connected."
   *  - "AMQJS0011E Invalid state already connected."
   *
   * @event tsante-mqtt-error
   * @param  {String} errMessage message of the error
   */
  _onError: function(errMessage) {
    this.fire('tsante-mqtt-error', errMessage);
  },

});
