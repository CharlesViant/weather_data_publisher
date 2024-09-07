const mqtt = require('mqtt');

const MQTT_BROKER = "mqtt://broker.hivemq.com";
const MQTT_CLIENT_ID = "sonde_random";
const MQTT_TOPIC = "cesi_weather_simulator/measures";

// Fonction pour générer des valeurs aléatoires pour les mesures
function generateRandomMessage() {
  const macAddress = "01:01:01:01"; 
  const name = `random_1`;
  const pressure = (Math.random() * (990.0 - 950.0) + 950.0).toFixed(2); 
  const humidity = (Math.random() * (80.0 - 60.0) + 60.0).toFixed(2);
  const temperature = (Math.random() * (30.0 - 15.0) + 15.0).toFixed(2); 

  return {
    mac_address: macAddress,
    name: name,
    measures: [
      { valeur: pressure, label: "pressure" },
      { valeur: humidity, label: "humidity" },
      { valeur: temperature, label: "temperature" },
    ],
  };
}

module.exports = (req, res) => {
  const client = mqtt.connect(MQTT_BROKER, {
    clientId: MQTT_CLIENT_ID,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  });

  client.on('connect', () => {
    const message = generateRandomMessage();
    const messageString = JSON.stringify(message);

    client.publish(MQTT_TOPIC, messageString, { qos: 0, retain: false }, (error) => {
      if (error) {
        console.error('Error publishing message:', error);
        res.status(500).json({ error: 'Failed to publish message' });
      } else {
        console.log('Message published:', messageString);
        res.status(200).json({ message: 'Message published successfully' });
      }
      client.end();
    });
  });

  client.on('error', (error) => {
    console.error('Connection error:', error);
    res.status(500).json({ error: 'Connection error' });
    client.end();
  });
};
