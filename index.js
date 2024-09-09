const mqtt = require('mqtt');

// Informations du broker MQTT
const MQTT_BROKER = "mqtt://broker.hivemq.com";
const MQTT_CLIENT_ID = "sonde_random";
const MQTT_TOPIC = "cesi_weather_simulator/measures";

// Création du client MQTT
const client = mqtt.connect(MQTT_BROKER, {
  clientId: MQTT_CLIENT_ID,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

// Liste des sondes fictives
const sondes = [
  { macAddress: "01:01:01:01", name: "Paris" },
  { macAddress: "02:02:02:02", name: "Lyon" },
  { macAddress: "03:03:03:03", name: "Marseille" },
];

// Fonction pour générer des valeurs aléatoires pour les mesures
function generateRandomMessage(macAddress, name) {
  const pressure = (Math.random() * (990.0 - 950.0) + 950.0).toFixed(2); // Génère une pression entre 950.0 et 990.0
  const humidity = (Math.random() * (80.0 - 60.0) + 60.0).toFixed(2); // Génère une humidité entre 60.0 et 80.0
  const temperature = (Math.random() * (30.0 - 15.0) + 15.0).toFixed(2); // Génère une température entre 15.0 et 30.0

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

// Connexion au broker MQTT
client.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Envoi des messages toutes les minutes pour chaque sonde
  setInterval(() => {
    sondes.forEach(sonde => {
      const message = generateRandomMessage(sonde.macAddress, sonde.name);
      const messageString = JSON.stringify(message);

      // Publier le message sur le topic
      client.publish(MQTT_TOPIC, messageString, { qos: 0, retain: false }, (error) => {
        if (error) {
          console.error('Error publishing message:', error);
        } else {
          console.log('Message published:', messageString);
        }
      });
    });
  }, 60000); // 60000 millisecondes = 1 minute
});

// Gestion des erreurs de connexion
client.on('error', (error) => {
  console.error('Connection error:', error);
});