import 'babel-polyfill';
import {HomeWizardBaseAccessory} from './accessory';

export class HomeWizardWaterSensor extends HomeWizardBaseAccessory {

  model = 'Water sensor';
  
  setupServices() {
    // Setup services
    const waterSensorService = new this.hap.Service.WaterSensor();
    this.waterDetected = waterSensorService.getCharacteristic(this.hap.Characteristic.WaterDetected);
    this.waterDetected.on('get', this.getWaterDetected.bind(this));
    
    // Add battery status to services
    waterSensorService
      .addCharacteristic(new this.hap.Characteristic.StatusLowBattery()) //eslint-disable-line
      .on('get', this.getLowBatteryStatus.bind(this));

    this.services.push(WaterSensorService);
  }

  getWaterDetected(callback) {
    this.api.getStatus(this.id, 'kakusensors').then(sensor => {
      const water = sensor.status === 'yes' && this.recentUpdate(sensor, 10)
        ? this.hap.Characteristic.WaterDetected.WATER_DETECTED
        : this.hap.Characteristic.WaterDetected.WATER_NOT_DETECTED;

      if (water === this.hap.Characteristic.WaterDetected.WATER_DETECTED) {
        this.log(`Detected water at sensor:${this.name}`);
      }

      this.waterDetected.setValue(water);
      callback(null, water);
    }).catch(error => {
      this.log(`Failed to retrieve water detection state for:${this.name}`);
      this.log(error);
      callback(error);
    });
  }

  getLowBatteryStatus(callback) {
    this.api.getSensors(this.id, 'kakusensors').then(sensor => {
      const lowBattery = sensor.lowBattery === 'yes';

      if (lowBattery) {
        this.log(`Low battery level for water sensor: ${this.name}`);
      }

      callback(null, lowBattery);
    }).catch(error => {
      this.log(`Failed to retrieve battery level for water sensor: ${this.name}`);
      this.log(error);
      callback(error);
    });
  }
}
