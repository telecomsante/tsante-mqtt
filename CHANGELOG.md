# v1.3.0

  - fix #9 : Add timeout and qos options for subscriber
  
# v1.2.0

  - fix #7 : cannot publish the same payload when changing the topic

# v1.1.1

  - fix #5 : enhance connection
  - fix #4

# v1.1.0

  - tsante-mqtt : send a `tsante-mqtt-connect-error` event on connection fail
  - tsante-mqtt : retry connection when `retry` is set
  - fix #2 : authenticated connection doesn't work
  - fix #1 : add a ES5 version

# v1.0.1

  - tsante-mqtt : reinitialize client when modifying host or clientID
  - tsante-mqtt : on disconnect set connected to false
  - tsante-mqtt-subscriber : when tsante-mqtt disconnect, unsubscribe the topic.

# v1.0.0

First public release
