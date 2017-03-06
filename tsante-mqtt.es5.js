'use strict';

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
      type: String
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
      value: function value() {
        return Math.random().toString(36).replace(/[^a-z]+/g, '');
      }
    },

    /**
     * username
     * @type {String}
     */
    username: {
      type: String
    },

    /**
     * password
     * @type {String}
     */
    password: {
      type: String
    },

    /**
     * timeout of the connection in seconds
     * @type {Number}
     */
    timeout: {
      type: Number,
      value: 10
    },

    /**
     * retry connect after a period
     * the time is in seconds
     * @type {Number}
     */
    retry: {
      type: Number,
      value: 0
    },

    /**
     * if true(default) the client and server persistent state
     * is deleted on successful connect.
     *
     * @type {Boolean}
     */
    cleanSession: {
      type: Boolean,
      value: true
    },

    /**
     * message sent by the server when the client disconnects abnormally.
     *
     *
     * @type {String}
     */
    willMessage: {
      type: Object,
      value: function value() {
        return {};
      }
    },

    /**
     * The mqtt client
     * @type {Object}
     */
    client: {
      type: Object,
      notify: true
    },

    /**
     * the connection status
     * @type {Boolean}
     */
    connected: {
      type: Boolean,
      value: false,
      readOnly: true,
      reflectToAttribute: true,
      observer: '_connectedChanged'
    }
  },

  observers: ['_initializeClient(host,clientID)'],

  attached: function attached() {
    this.connect();
  },
  detached: function detached() {
    this.disconnect();
  },


  _initializeClient: function _initializeClient(host, clientID) {
    if (this.connected && this.client) {
      this.disconnect();
    }
    this.client = new Paho.MQTT.Client(this.host, this.clientID);
    this.client.onConnectionLost = this._onConnectionLost.bind(this);
    this.client.onMessageArrived = this._onMessageArrived.bind(this);
    this.client.onMessageDelivered = this._onMessageDelivered.bind(this);
    this.connect();
  },

  _onConnect: function _onConnect() {
    this._setConnected(true);
  },

  /**
   * sent when the connection fails
   * @event tsante-mqtt-connect-error
   * @param  {String} message message of the error
   * @param  {Boolean} status status of the connection
   */
  _onFail: function _onFail() {
    this._setConnected(false);
    this.fire('tsante-mqtt-connect-error', {
      status: this.connected,
      message: 'fail to connect'
    });
    this._retry();
  },

  _retry: function _retry() {
    if (this.retry) {
      setTimeout(this.connect.bind(this), this.retry * 1000);
    }
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
  _connectedChanged: function _connectedChanged() {
    this.fire('tsante-mqtt-connect', { status: this.connected });
  },

  _onConnectionLost: function _onConnectionLost(msg) {
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
  _onMessageArrived: function _onMessageArrived(msg) {
    this.fire('tsante-mqtt-received', { topic: msg.destinationName, payload: msg.payloadString });
  },

  /**
   * called when a message has been delivered. All processing that this
   * Client will ever do has been completed.
   *
   * @method _onMessageDelivered
   * @param  {Object}            msg the delivered message
   */
  _onMessageDelivered: function _onMessageDelivered(msg) {
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
    this.fire('tsante-mqtt-delivered', { topic: msg.destinationName, payload: msg.payloadString });
  },

  /**
   * open the connection to the server
   *
   * @method connect
   * @param  {String} username the login to use
   * @param  {String} password the password to use
   */
  connect: function connect(username, password) {
    if (!this.client) return;
    var connectOption = {
      onSuccess: this._onConnect.bind(this),
      onFailure: this._onFail.bind(this),
      timeout: this.timeout,
      cleanSession: this.cleanSession
    };
    if (this.username || username) {
      connectOption.userName = this.username || username;
    }
    if (this.password || password) {
      connectOption.password = this.password || password;
    }

    try {
      this.client.connect(connectOption);
    } catch (err) {
      this._onError(err.message);
    }
  },

  /**
   * disconnect the client
   * @method disconnect
   */
  disconnect: function disconnect() {
    try {
      this.client.disconnect();
      this._setConnected(false);
    } catch (err) {
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
  _onError: function _onError(errMessage) {
    this.fire('tsante-mqtt-error', errMessage);
  }

});
