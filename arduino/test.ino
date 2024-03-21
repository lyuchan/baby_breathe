const int analogPin = A0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(analogPin);
  float voltage = sensorValue * (5.0 / 1023.0);
  float acceleration = (voltage - 1.61) * 10;  // Adjust this factor based on your observation

  Serial.print(acceleration);
  Serial.println(" g");

  delay(10);
}
